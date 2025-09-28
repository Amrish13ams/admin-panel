-- Ensure demo company exists with correct data
DELETE FROM companies WHERE username = 'demo';

-- Insert demo company for testing
INSERT INTO companies (
  shop_name,
  email,
  username,
  password_hash,
  phone,
  whatsapp,
  website,
  description,
  subdomain,
  plan,
  status,
  product_limit,
  current_product_count,
  join_date,
  created_at,
  updated_at
) VALUES (
  'Demo Furniture Co',
  'demo@furniture.com',
  'demo',
  'demo123', -- Using plain text password for demo purposes
  '+1234567890',
  '+1234567890',
  'https://demo-furniture.com',
  'A demo furniture store for testing the admin panel',
  'demo-furniture',
  'premium',
  'active',
  100,
  2,
  NOW(),
  NOW(),
  NOW()
);

-- Get the company ID for the demo company
DO $$
DECLARE
    demo_company_id INTEGER;
BEGIN
    SELECT id INTO demo_company_id FROM companies WHERE username = 'demo';
    
    -- Delete existing demo products
    DELETE FROM products WHERE company_id = demo_company_id;
    
    -- Insert demo products
    INSERT INTO products (
      company_id,
      name,
      description,
      category,
      price,
      discount_price,
      image_1,
      image_2,
      dimensions,
      weight,
      material,
      color,
      status,
      featured,
      has_ar,
      ar_scale,
      ar_placement,
      created_at,
      updated_at
    ) VALUES 
    (
      demo_company_id,
      'Modern Sofa',
      'A comfortable modern sofa perfect for any living room',
      'Furniture',
      1299.99,
      999.99,
      '/placeholder.svg?height=400&width=400',
      '/placeholder.svg?height=400&width=400',
      '200cm x 90cm x 80cm',
      '45kg',
      'Fabric',
      'Gray',
      'active',
      true,
      true,
      1.0,
      'floor',
      NOW(),
      NOW()
    ),
    (
      demo_company_id,
      'Coffee Table',
      'Elegant wooden coffee table with storage compartment',
      'Furniture',
      599.99,
      449.99,
      '/placeholder.svg?height=400&width=400',
      '/placeholder.svg?height=400&width=400',
      '120cm x 60cm x 45cm',
      '25kg',
      'Wood',
      'Oak',
      'active',
      true,
      false,
      1.0,
      'floor',
      NOW(),
      NOW()
    );
    
    -- Delete existing demo AR requests
    DELETE FROM ar_requests WHERE company_id = demo_company_id;
    
    -- Insert demo AR request
    INSERT INTO ar_requests (
      company_id,
      product_id,
      status,
      request_date,
      admin_notes
    ) VALUES (
      demo_company_id,
      (SELECT id FROM products WHERE name = 'Modern Sofa' AND company_id = demo_company_id),
      'pending',
      NOW(),
      'Demo AR request for modern sofa - testing AR functionality'
    );
END $$;
