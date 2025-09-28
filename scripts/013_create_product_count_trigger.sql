-- Create trigger to automatically update product count when products are added/removed

-- Function to update product count
CREATE OR REPLACE FUNCTION update_company_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.companies 
        SET current_product_count = current_product_count + 1,
            updated_at = NOW()
        WHERE id = NEW.company_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.companies 
        SET current_product_count = GREATEST(current_product_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.company_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_product_count_insert ON public.products;
DROP TRIGGER IF EXISTS trigger_update_product_count_delete ON public.products;

CREATE TRIGGER trigger_update_product_count_insert
    AFTER INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_company_product_count();

CREATE TRIGGER trigger_update_product_count_delete
    AFTER DELETE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_company_product_count();
