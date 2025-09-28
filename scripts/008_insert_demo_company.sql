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
  'Demo Furniture Store',
  'demo@furniture.com',
  'demo',
  'demo123', -- Using plain text password for now, in production use bcrypt
  '+1234567890',
  '+1234567890',
  'https://demo-furniture.com',
  'A demo furniture store for testing the admin panel',
  'demo-furniture',
  'premium',
  'active', -- Changed from 'Active' to 'active' to match query
  100,
  0,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert some sample products for the demo company
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
  (SELECT id FROM companies WHERE username = 'demo'),
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
  (SELECT id FROM companies WHERE username = 'demo'),
  'Dining Table',
  'Elegant wooden dining table for 6 people',
  'Furniture',
  899.99,
  NULL,
  '/placeholder.svg?height=400&width=400',
  '/placeholder.svg?height=400&width=400',
  '180cm x 90cm x 75cm',
  '35kg',
  'Wood',
  'Oak',
  'active',
  false,
  false,
  1.0,
  'floor',
  NOW(),
  NOW()
);

-- Insert a sample AR request
INSERT INTO ar_requests (
  company_id,
  product_id,
  status,
  request_date,
  admin_notes
) VALUES (
  (SELECT id FROM companies WHERE username = 'demo'),
  (SELECT id FROM products WHERE name = 'Modern Sofa' AND company_id = (SELECT id FROM companies WHERE username = 'demo')),
  'pending',
  NOW(),
  'Initial AR request for modern sofa'
);
