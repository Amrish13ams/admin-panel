-- Fix existing data to ensure proper relationships and data integrity

-- Step 1: Ensure all products have valid company_id references
-- Remove orphaned products (products without valid company references)
DELETE FROM public.products 
WHERE company_id NOT IN (SELECT id FROM public.companies);

-- Step 2: Ensure all ar_requests have valid references
-- Remove orphaned ar_requests
DELETE FROM public.ar_requests 
WHERE product_id NOT IN (SELECT id FROM public.products)
   OR company_id NOT IN (SELECT id FROM public.companies);

-- Step 3: Update ar_requests to ensure company_id matches the product's company
UPDATE public.ar_requests 
SET company_id = p.company_id
FROM public.products p
WHERE public.ar_requests.product_id = p.id
  AND public.ar_requests.company_id != p.company_id;

-- Step 4: Set default values for missing required fields
UPDATE public.products 
SET 
    price = 0.00 WHERE price IS NULL,
    status = 'Active' WHERE status IS NULL,
    has_ar = false WHERE has_ar IS NULL,
    featured = false WHERE featured IS NULL,
    ar_scale = 1.0 WHERE ar_scale IS NULL,
    ar_placement = 'floor' WHERE ar_placement IS NULL;

-- Step 5: Ensure companies have valid subdomains
UPDATE public.companies 
SET subdomain = LOWER(REPLACE(REPLACE(shop_name, ' ', ''), '.', ''))
WHERE subdomain IS NULL OR subdomain = '';

-- Handle duplicate subdomains by appending numbers
DO $$
DECLARE
    company_record RECORD;
    new_subdomain TEXT;
    counter INTEGER;
BEGIN
    FOR company_record IN 
        SELECT id, subdomain, shop_name
        FROM public.companies 
        WHERE subdomain IN (
            SELECT subdomain 
            FROM public.companies 
            GROUP BY subdomain 
            HAVING COUNT(*) > 1
        )
        ORDER BY id
    LOOP
        counter := 1;
        new_subdomain := company_record.subdomain;
        
        WHILE EXISTS (SELECT 1 FROM public.companies WHERE subdomain = new_subdomain AND id != company_record.id) LOOP
            new_subdomain := company_record.subdomain || counter::text;
            counter := counter + 1;
        END LOOP;
        
        IF new_subdomain != company_record.subdomain THEN
            UPDATE public.companies 
            SET subdomain = new_subdomain 
            WHERE id = company_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 6: Update timestamps for existing records
UPDATE public.companies 
SET 
    created_at = COALESCE(created_at, join_date, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE public.products 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE public.ar_requests 
SET request_date = COALESCE(request_date, NOW())
WHERE request_date IS NULL;
