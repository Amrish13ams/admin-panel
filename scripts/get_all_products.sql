-- Query to fetch all product data from the products table
SELECT 
    id,
    name,
    description,
    price,
    stock_quantity,
    category,
    company_id,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC;
