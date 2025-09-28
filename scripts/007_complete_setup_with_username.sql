-- Complete setup script that adds username field and creates sample data

-- Add username field to companies table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'username') THEN
        ALTER TABLE public.companies ADD COLUMN username character varying(100) UNIQUE;
    END IF;
END $$;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_companies_username ON public.companies(username);

-- Insert or update sample company with username
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
    logo,
    join_date,
    created_at,
    updated_at
) VALUES (
    'Demo Furniture Co',
    'demo-furniture',
    'demo@furniture.com',
    'demo',
    '$2b$10$dummy.hash.for.demo123.password',
    '+1-555-0123',
    '+1-555-0123',
    'https://demo-furniture.com',
    'A premium furniture company specializing in modern and contemporary designs for homes and offices.',
    'Premium',
    50,
    4,
    'Active',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center',
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '6 months',
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    plan = EXCLUDED.plan,
    product_limit = EXCLUDED.product_limit,
    current_product_count = EXCLUDED.current_product_count,
    status = EXCLUDED.status,
    logo = EXCLUDED.logo,
    updated_at = NOW();

-- Insert sample products for the demo company
INSERT INTO public.products (
    name,
    description,
    category,
    price,
    discount_price,
    material,
    color,
    dimensions,
    weight,
    image_1,
    image_2,
    image_3,
    image_4,
    has_ar,
    ar_scale,
    ar_placement,
    glb_file,
    usdz_file,
    featured,
    status,
    company_id,
    created_at,
    updated_at
) 
SELECT 
    'Modern Office Chair',
    'Ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.',
    'Office Furniture',
    299.99,
    249.99,
    'Mesh and Steel',
    'Black',
    '26" W x 26" D x 40-44" H',
    '35 lbs',
    'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
    true,
    1.0,
    'floor',
    '/models/office-chair.glb',
    '/models/office-chair.usdz',
    true,
    'Active',
    c.id,
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '1 week'
FROM public.companies c WHERE c.username = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
    name,
    description,
    category,
    price,
    material,
    color,
    dimensions,
    weight,
    image_1,
    image_2,
    has_ar,
    ar_scale,
    ar_placement,
    featured,
    status,
    company_id,
    created_at,
    updated_at
) 
SELECT 
    'Executive Desk',
    'Spacious executive desk with built-in storage and cable management.',
    'Office Furniture',
    899.99,
    'Oak Wood',
    'Natural',
    '60" W x 30" D x 30" H',
    '120 lbs',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    true,
    1.0,
    'floor',
    false,
    'Active',
    c.id,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '2 weeks'
FROM public.companies c WHERE c.username = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
    name,
    description,
    category,
    price,
    discount_price,
    material,
    color,
    dimensions,
    weight,
    image_1,
    has_ar,
    featured,
    status,
    company_id,
    created_at,
    updated_at
) 
SELECT 
    'Conference Table',
    'Large conference table for meetings and presentations.',
    'Office Furniture',
    1299.99,
    1099.99,
    'Glass and Steel',
    'Clear',
    '96" W x 42" D x 30" H',
    '180 lbs',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
    false,
    true,
    'Active',
    c.id,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '3 days'
FROM public.companies c WHERE c.username = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
    name,
    description,
    category,
    price,
    material,
    color,
    dimensions,
    image_1,
    has_ar,
    status,
    company_id,
    created_at,
    updated_at
) 
SELECT 
    'Storage Cabinet',
    'Lockable storage cabinet with adjustable shelves.',
    'Storage',
    399.99,
    'Steel',
    'Gray',
    '36" W x 18" D x 72" H',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop',
    false,
    'Active',
    c.id,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '1 day'
FROM public.companies c WHERE c.username = 'demo'
ON CONFLICT DO NOTHING;

-- Insert sample AR request
INSERT INTO public.ar_requests (
    product_id,
    company_id,
    status,
    admin_notes,
    request_date
)
SELECT 
    p.id,
    c.id,
    'Pending',
    'Initial AR request for office chair model',
    NOW() - INTERVAL '1 week'
FROM public.companies c 
JOIN public.products p ON p.company_id = c.id 
WHERE c.username = 'demo' AND p.name = 'Modern Office Chair'
ON CONFLICT DO NOTHING;
