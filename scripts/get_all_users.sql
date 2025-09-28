-- Get all usernames and passwords from the companies table
SELECT 
    id,
    shop_name,
    username,
    password_hash as password,
    email,
    status,
    created_at
FROM companies 
ORDER BY id;
