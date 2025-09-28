-- Complete database setup for Railway PostgreSQL
-- Run this script on your Railway database to set up all required tables and demo data

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS ar_requests CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    description TEXT,
    logo TEXT,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    website TEXT,
    status VARCHAR(20) DEFAULT 'active',
    plan VARCHAR(20) DEFAULT 'trial',
    product_limit INTEGER DEFAULT 10,
    current_products INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ar_requests table
CREATE TABLE ar_requests (
    id SERIAL PRIMARY KEY,
    product INTEGER REFERENCES products(id) ON DELETE CASCADE,
    shop INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP,
    rejected_date TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_companies_username ON companies(username);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_subdomain ON companies(subdomain);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_ar_requests_product ON ar_requests(product);
CREATE INDEX idx_ar_requests_shop ON ar_requests(shop);
CREATE INDEX idx_ar_requests_status ON ar_requests(status);

-- Create trigger to update product count automatically
CREATE OR REPLACE FUNCTION update_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE companies 
        SET current_products = current_products + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.company_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies 
        SET current_products = GREATEST(current_products - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.company_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_count
    AFTER INSERT OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_count();

-- Insert demo company data
INSERT INTO companies (
    shop_name, 
    subdomain, 
    email, 
    username, 
    password_hash, 
    description, 
    phone, 
    whatsapp, 
    website, 
    status, 
    plan, 
    product_limit, 
    current_products
) VALUES (
    'Demo Furniture Co',
    'demo-furniture',
    'demo@furniture.com',
    'demo',
    'demo123', -- In production, this should be properly hashed
    'A demo furniture company for testing the admin panel',
    '+1234567890',
    '+1234567890',
    'https://demo-furniture.com',
    'active',
    'premium',
    100,
    2
);

-- Get the company ID for foreign key references
DO $$
DECLARE
    demo_company_id INTEGER;
BEGIN
    SELECT id INTO demo_company_id FROM companies WHERE username = 'demo';
    
    -- Insert demo products
    INSERT INTO products (name, description, price, image_url, category, stock_quantity, company_id) VALUES
    ('Modern Office Chair', 'Ergonomic office chair with lumbar support', 299.99, '/placeholder.svg?height=300&width=300', 'Furniture', 15, demo_company_id),
    ('Wooden Dining Table', 'Solid oak dining table for 6 people', 899.99, '/placeholder.svg?height=300&width=300', 'Furniture', 8, demo_company_id);
    
    -- Insert demo AR requests
    INSERT INTO ar_requests (product, shop, status, request_date) VALUES
    ((SELECT id FROM products WHERE name = 'Modern Office Chair' AND company_id = demo_company_id), demo_company_id, 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ((SELECT id FROM products WHERE name = 'Wooden Dining Table' AND company_id = demo_company_id), demo_company_id, 'approved', CURRENT_TIMESTAMP - INTERVAL '1 day');
    
    -- Update the approved request with approval date
    UPDATE ar_requests 
    SET approved_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
    WHERE status = 'approved' AND shop = demo_company_id;
END $$;

-- Create a function to verify the setup
CREATE OR REPLACE FUNCTION verify_setup()
RETURNS TABLE(
    table_name TEXT,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'companies'::TEXT, COUNT(*) FROM companies
    UNION ALL
    SELECT 'products'::TEXT, COUNT(*) FROM products
    UNION ALL
    SELECT 'ar_requests'::TEXT, COUNT(*) FROM ar_requests;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM verify_setup();

-- Display demo login credentials
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete!';
    RAISE NOTICE 'Demo login credentials:';
    RAISE NOTICE 'Username: demo';
    RAISE NOTICE 'Password: demo123';
    RAISE NOTICE 'Company: Demo Furniture Co';
END $$;
