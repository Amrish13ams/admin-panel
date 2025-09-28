-- Drop existing RLS policies that rely on auth.uid()
DROP POLICY IF EXISTS "Companies can view own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can view own products" ON public.products;
DROP POLICY IF EXISTS "Companies can insert own products" ON public.products;
DROP POLICY IF EXISTS "Companies can update own products" ON public.products;
DROP POLICY IF EXISTS "Companies can delete own products" ON public.products;
DROP POLICY IF EXISTS "Companies can view own ar_requests" ON public.ar_requests;
DROP POLICY IF EXISTS "Companies can insert own ar_requests" ON public.ar_requests;
DROP POLICY IF EXISTS "Companies can update own ar_requests" ON public.ar_requests;

-- Disable RLS for now since we're using custom authentication
-- In a production environment, you would want to implement proper RLS policies
-- that work with your custom authentication system
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_requests DISABLE ROW LEVEL SECURITY;

-- Note: This temporarily disables RLS for development purposes
-- For production, you should implement proper authentication middleware
-- that validates company access at the application level
