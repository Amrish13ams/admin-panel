-- Insert demo company data for testing
INSERT INTO companies (
  username,
  password_hash,
  email,
  shop_name,
  description,
  phone,
  whatsapp,
  website,
  status,
  plan,
  subdomain,
  product_limit,
  current_products,
  join_date,
  created_at,
  updated_at
) VALUES (
  'demo',
  'demo123',
  'demo@company.com',
  'Demo Shop',
  'A demo company for testing the admin panel',
  '+1234567890',
  '+1234567890',
  'https://demo-shop.com',
  'active',
  'premium',
  'demo-shop',
  100,
  0,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  shop_name = EXCLUDED.shop_name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  website = EXCLUDED.website,
  status = EXCLUDED.status,
  plan = EXCLUDED.plan,
  subdomain = EXCLUDED.subdomain,
  product_limit = EXCLUDED.product_limit,
  current_products = EXCLUDED.current_products,
  updated_at = NOW();

-- Insert some demo products for the demo company
INSERT INTO products (
  name,
  description,
  price,
  stock_quantity,
  category,
  image_url,
  company_id,
  created_at,
  updated_at
) VALUES 
(
  'Demo Product 1',
  'This is a demo product for testing purposes',
  29.99,
  50,
  'Electronics',
  '/placeholder.svg?height=200&width=200',
  (SELECT id FROM companies WHERE username = 'demo'),
  NOW(),
  NOW()
),
(
  'Demo Product 2',
  'Another demo product with different specifications',
  49.99,
  25,
  'Accessories',
  '/placeholder.svg?height=200&width=200',
  (SELECT id FROM companies WHERE username = 'demo'),
  NOW(),
  NOW()
),
(
  'Demo Product 3',
  'Premium demo product for showcase',
  99.99,
  10,
  'Premium',
  '/placeholder.svg?height=200&width=200',
  (SELECT id FROM companies WHERE username = 'demo'),
  NOW(),
  NOW()
);

-- Update the current_products count for the demo company
UPDATE companies 
SET current_products = (
  SELECT COUNT(*) 
  FROM products 
  WHERE company_id = companies.id
) 
WHERE username = 'demo';
