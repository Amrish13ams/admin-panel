-- Debug script to check companies table and fix ID issues
SELECT 
  id,
  shop_name,
  username,
  status,
  created_at
FROM companies 
ORDER BY id;

-- Also check if there are any products referencing non-existent companies
SELECT DISTINCT company_id 
FROM products 
WHERE company_id NOT IN (SELECT id FROM companies);
