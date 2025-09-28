-- Insert demo company data
INSERT INTO companies (
    shop_name,
    username,
    email,
    password_hash,
    phone,
    whatsapp,
    website,
    description,
    subdomain,
    logo,
    plan,
    status,
    product_limit,
    current_product_count,
    join_date,
    created_at,
    updated_at
) VALUES (
    'Demo Furniture Store',
    'demo',
    'demo@furniture.com',
    'demo123', -- Simple password for demo purposes
    '+1-555-0123',
    '+1-555-0123',
    'https://demo-furniture.com',
    'A demo furniture store for testing the admin panel',
    'demo-furniture',
    'https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=DEMO',
    'premium',
    'active',
    100,
    5,
    NOW(),
    NOW(),
    NOW()
);

-- Insert some demo products
INSERT INTO products (
    company_id,
    name,
    description,
    category,
    price,
    discount_price,
    image_1,
    image_2,
    status,
    featured,
    has_ar,
    dimensions,
    weight,
    material,
    color,
    ar_placement,
    created_at,
    updated_at
) VALUES 
(
    1, -- Assuming the demo company gets ID 1
    'Modern Sofa',
    'A comfortable modern sofa perfect for any living room',
    'Furniture',
    1299.99,
    999.99,
    'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Modern+Sofa',
    'https://via.placeholder.com/400x300/A78BFA/FFFFFF?text=Sofa+Side',
    'active',
    true,
    true,
    '200cm x 90cm x 85cm',
    '45kg',
    'Fabric',
    'Gray',
    'floor',
    NOW(),
    NOW()
),
(
    1,
    'Coffee Table',
    'Elegant wooden coffee table with storage',
    'Furniture',
    599.99,
    449.99,
    'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Coffee+Table',
    'https://via.placeholder.com/400x300/34D399/FFFFFF?text=Table+Top',
    'active',
    true,
    false,
    '120cm x 60cm x 45cm',
    '25kg',
    'Wood',
    'Oak',
    'floor',
    NOW(),
    NOW()
);

-- Insert a demo AR request
INSERT INTO ar_requests (
    company_id,
    product_id,
    status,
    request_date,
    admin_notes
) VALUES (
    1,
    1,
    'pending',
    NOW(),
    'Demo AR request for modern sofa'
);
