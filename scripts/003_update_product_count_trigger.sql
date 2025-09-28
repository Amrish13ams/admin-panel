-- Function to update product count when products are added/removed
CREATE OR REPLACE FUNCTION update_company_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.companies 
    SET current_product_count = current_product_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.companies 
    SET current_product_count = current_product_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS product_count_trigger_insert ON public.products;
DROP TRIGGER IF EXISTS product_count_trigger_delete ON public.products;

CREATE TRIGGER product_count_trigger_insert
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_company_product_count();

CREATE TRIGGER product_count_trigger_delete
  AFTER DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_company_product_count();

-- Initialize current product counts for existing companies
UPDATE public.companies 
SET current_product_count = (
  SELECT COUNT(*) 
  FROM public.products 
  WHERE products.company_id = companies.id
);
