-- Migration script to update existing database to match admin panel requirements
-- This script safely adds missing columns and tables without affecting existing data

-- Step 1: Add missing columns to companies table
DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'email') THEN
        ALTER TABLE public.companies ADD COLUMN email character varying(255);
    END IF;
    
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'username') THEN
        ALTER TABLE public.companies ADD COLUMN username character varying(100);
    END IF;
    
    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'password_hash') THEN
        ALTER TABLE public.companies ADD COLUMN password_hash text;
    END IF;
    
    -- Add product_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'product_limit') THEN
        ALTER TABLE public.companies ADD COLUMN product_limit integer DEFAULT 10;
    END IF;
    
    -- Add current_product_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'current_product_count') THEN
        ALTER TABLE public.companies ADD COLUMN current_product_count integer DEFAULT 0;
    END IF;
END $$;

-- Step 2: Update existing companies with required authentication data
-- Generate usernames from shop_name for existing companies
UPDATE public.companies 
SET username = LOWER(REPLACE(REPLACE(shop_name, ' ', ''), '.', ''))
WHERE username IS NULL;

-- Generate email addresses for existing companies
UPDATE public.companies 
SET email = LOWER(REPLACE(REPLACE(shop_name, ' ', ''), '.', '')) || '@company.local'
WHERE email IS NULL;

-- Set default password hash for existing companies (they'll need to reset)
UPDATE public.companies 
SET password_hash = '$2b$10$dummy.hash.needs.reset.by.admin.user'
WHERE password_hash IS NULL;

-- Update product counts for existing companies
UPDATE public.companies 
SET current_product_count = (
    SELECT COUNT(*) 
    FROM public.products 
    WHERE products.company_id = companies.id
)
WHERE current_product_count = 0 OR current_product_count IS NULL;

-- Step 3: Make required columns NOT NULL after populating them
ALTER TABLE public.companies ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.companies ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.companies ALTER COLUMN password_hash SET NOT NULL;

-- Step 4: Add unique constraints
DO $$
BEGIN
    -- Add unique constraint on email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'companies_email_key' 
                   AND table_name = 'companies') THEN
        ALTER TABLE public.companies ADD CONSTRAINT companies_email_key UNIQUE (email);
    END IF;
    
    -- Add unique constraint on username if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'companies_username_key' 
                   AND table_name = 'companies') THEN
        ALTER TABLE public.companies ADD CONSTRAINT companies_username_key UNIQUE (username);
    END IF;
    
    -- Add unique constraint on subdomain if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'companies_subdomain_key' 
                   AND table_name = 'companies') THEN
        ALTER TABLE public.companies ADD CONSTRAINT companies_subdomain_key UNIQUE (subdomain);
    END IF;
END $$;

-- Step 5: Fix ar_requests table structure
-- Rename 'product' column to 'product_id' if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'ar_requests' AND column_name = 'product') THEN
        ALTER TABLE public.ar_requests RENAME COLUMN product TO product_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'ar_requests' AND column_name = 'shop') THEN
        ALTER TABLE public.ar_requests RENAME COLUMN shop TO company_id;
    END IF;
END $$;

-- Add missing columns to ar_requests
DO $$
BEGIN
    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ar_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.ar_requests ADD COLUMN admin_notes text;
    END IF;
END $$;

-- Step 6: Make foreign key columns NOT NULL and add constraints
ALTER TABLE public.ar_requests ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE public.ar_requests ALTER COLUMN company_id SET NOT NULL;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for product_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'ar_requests_product_id_fkey' 
                   AND table_name = 'ar_requests') THEN
        ALTER TABLE public.ar_requests 
        ADD CONSTRAINT ar_requests_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for company_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'ar_requests_company_id_fkey' 
                   AND table_name = 'ar_requests') THEN
        ALTER TABLE public.ar_requests 
        ADD CONSTRAINT ar_requests_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_requests_company_id ON public.ar_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_requests_product_id ON public.ar_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_username ON public.companies(username);

-- Step 8: Update status values to match expected format
-- Change 'Active' to 'active' in companies table to match login expectations
UPDATE public.companies SET status = 'active' WHERE status = 'Active';
UPDATE public.products SET status = 'Active' WHERE status = 'active';

-- Step 9: Create demo user with proper credentials
INSERT INTO public.companies (
    shop_name,
    subdomain,
    email,
    username,
    password_hash,
    phone,
    whatsapp,
    website,
    description,
    plan,
    product_limit,
    current_product_count,
    status,
    join_date,
    created_at,
    updated_at
) VALUES (
    'Demo Furniture Co',
    'demo',
    'demo@furniture.com',
    'demo',
    'demo123', -- Plain text password for demo (will be hashed by app)
    '+1-555-0123',
    '+1-555-0123',
    'https://demo-furniture.com',
    'Premium furniture with AR visualization',
    'Trial',
    50,
    2,
    'active',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password_hash = 'demo123',
    status = 'active',
    current_product_count = 2,
    updated_at = NOW();
