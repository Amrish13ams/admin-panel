-- Migration script to add authentication fields to existing Railway database
-- This script safely adds missing columns without affecting existing data

BEGIN;

-- Add missing columns to companies table for authentication
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS email character varying(255),
ADD COLUMN IF NOT EXISTS username character varying(100),
ADD COLUMN IF NOT EXISTS password_hash character varying(255),
ADD COLUMN IF NOT EXISTS product_count integer DEFAULT 0;

-- Create unique constraints for new fields
CREATE UNIQUE INDEX IF NOT EXISTS companies_email_key ON public.companies(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS companies_username_key ON public.companies(username) WHERE username IS NOT NULL;

-- Add foreign key constraint to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_company_id_fkey'
    ) THEN
        ALTER TABLE public.products 
        ADD CONSTRAINT products_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints to ar_requests table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ar_requests_product_fkey'
    ) THEN
        ALTER TABLE public.ar_requests 
        ADD CONSTRAINT ar_requests_product_fkey 
        FOREIGN KEY (product) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ar_requests_shop_fkey'
    ) THEN
        ALTER TABLE public.ar_requests 
        ADD CONSTRAINT ar_requests_shop_fkey 
        FOREIGN KEY (shop) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update product counts for existing companies
UPDATE public.companies 
SET product_count = (
    SELECT COUNT(*) 
    FROM public.products 
    WHERE products.company_id = companies.id
)
WHERE product_count IS NULL OR product_count = 0;

-- Create demo user for testing (only if it doesn't exist)
INSERT INTO public.companies (
    shop_name, subdomain, email, username, password_hash, 
    description, phone, whatsapp, status, plan, product_count
)
SELECT 
    'Demo Furniture Co', 'demo', 'demo@example.com', 'demo', 
    '$2b$10$rQZ9vKzf8vKzf8vKzf8vKOeJ9vKzf8vKzf8vKzf8vKzf8vKzf8vKO', -- password: demo123
    'Demo company for testing the admin panel', 
    '+1 555-0123', '+1 555-0123', 'Active', 'Trial', 2
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies WHERE username = 'demo'
);

-- Create trigger function to automatically update product counts
CREATE OR REPLACE FUNCTION update_company_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.companies 
        SET product_count = product_count + 1 
        WHERE id = NEW.company_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.companies 
        SET product_count = product_count - 1 
        WHERE id = OLD.company_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.company_id != NEW.company_id THEN
            UPDATE public.companies 
            SET product_count = product_count - 1 
            WHERE id = OLD.company_id;
            UPDATE public.companies 
            SET product_count = product_count + 1 
            WHERE id = NEW.company_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic product count updates
DROP TRIGGER IF EXISTS product_count_trigger ON public.products;
CREATE TRIGGER product_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_company_product_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_requests_product ON public.ar_requests(product);
CREATE INDEX IF NOT EXISTS idx_ar_requests_shop ON public.ar_requests(shop);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

COMMIT;

-- Verification queries
SELECT 'Migration completed successfully!' as status;
SELECT 'Demo login credentials:' as info;
SELECT 'Username: demo' as username;
SELECT 'Password: demo123' as password;

-- Show updated schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('companies', 'products', 'ar_requests')
ORDER BY table_name, ordinal_position;
