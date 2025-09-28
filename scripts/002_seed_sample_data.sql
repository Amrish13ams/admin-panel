-- Insert sample companies for testing
INSERT INTO public.companies (
  shop_name, 
  subdomain, 
  description, 
  email, 
  password_hash,
  plan,
  product_limit
) VALUES 
(
  'MCSAK Furniture', 
  'mcsak', 
  'Premium furniture with AR visualization', 
  'admin@mcsak.com',
  '$2b$10$example_hash_here', -- This should be properly hashed in production
  'Premium',
  50
),
(
  'Modern Living', 
  'modernliving', 
  'Contemporary furniture solutions', 
  'admin@modernliving.com',
  '$2b$10$example_hash_here', -- This should be properly hashed in production
  'Basic',
  25
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (
  name,
  description,
  price,
  company_id,
  category,
  image_1,
  status
) VALUES 
(
  'Modern Sofa',
  'Comfortable 3-seater sofa with premium fabric',
  1299.99,
  1,
  'Living Room',
  '/placeholder.svg?height=400&width=600',
  'Active'
),
(
  'Dining Table',
  'Solid wood dining table for 6 people',
  899.99,
  1,
  'Dining Room',
  '/placeholder.svg?height=400&width=600',
  'Active'
)
ON CONFLICT DO NOTHING;
