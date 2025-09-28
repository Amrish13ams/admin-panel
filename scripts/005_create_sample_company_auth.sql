-- Create a sample company for testing
-- This script should be run after setting up Supabase Auth

-- First, create the company record
INSERT INTO public.companies (
  shop_name, 
  subdomain, 
  description, 
  email, 
  plan,
  product_limit,
  logo_url
) VALUES (
  'Demo Furniture Co', 
  'demo', 
  'Sample furniture company for testing the admin panel', 
  'demo@furniture.com',
  'Premium',
  50,
  '/placeholder.svg?height=100&width=200'
) ON CONFLICT (email) DO UPDATE SET
  shop_name = EXCLUDED.shop_name,
  subdomain = EXCLUDED.subdomain,
  description = EXCLUDED.description,
  plan = EXCLUDED.plan,
  product_limit = EXCLUDED.product_limit,
  logo_url = EXCLUDED.logo_url;

-- Insert some sample products for the demo company
INSERT INTO public.products (
  name,
  description,
  price,
  company_id,
  category,
  image_1,
  image_2,
  status
) VALUES 
(
  'Executive Office Chair',
  'Ergonomic leather office chair with lumbar support and adjustable height',
  599.99,
  (SELECT id FROM public.companies WHERE email = 'demo@furniture.com'),
  'Office',
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
  'Active'
),
(
  'Standing Desk',
  'Height-adjustable standing desk with electric motor and memory presets',
  899.99,
  (SELECT id FROM public.companies WHERE email = 'demo@furniture.com'),
  'Office',
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
  'Active'
),
(
  'Sectional Sofa',
  'L-shaped sectional sofa with premium fabric upholstery',
  1899.99,
  (SELECT id FROM public.companies WHERE email = 'demo@furniture.com'),
  'Living Room',
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
  'Active'
),
(
  'Coffee Table',
  'Modern glass-top coffee table with wooden legs',
  399.99,
  (SELECT id FROM public.companies WHERE email = 'demo@furniture.com'),
  'Living Room',
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
  'Active'
)
ON CONFLICT DO NOTHING;

-- Insert a sample AR request
INSERT INTO public.ar_requests (
  product_id,
  company_id,
  status,
  notes,
  requested_at
) VALUES (
  (SELECT id FROM public.products WHERE name = 'Executive Office Chair' LIMIT 1),
  (SELECT id FROM public.companies WHERE email = 'demo@furniture.com'),
  'pending',
  'Customer requested AR visualization for this popular office chair model',
  NOW()
) ON CONFLICT DO NOTHING;
