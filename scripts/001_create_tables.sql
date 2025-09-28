-- Create companies table with authentication fields
CREATE TABLE IF NOT EXISTS public.companies (
  id serial NOT NULL,
  shop_name character varying(255) NOT NULL,
  subdomain character varying(100) NOT NULL UNIQUE,
  description text NULL,
  logo text NULL,
  phone character varying(20) NULL,
  whatsapp character varying(20) NULL,
  website text NULL,
  status character varying(20) NULL DEFAULT 'Active'::character varying,
  plan character varying(20) NULL DEFAULT 'Trial'::character varying,
  join_date timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  -- Authentication fields
  email character varying(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  -- Product limits based on plan
  product_limit integer DEFAULT 10,
  current_product_count integer DEFAULT 0
);

ALTER TABLE public.companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id serial NOT NULL,
  name character varying(255) NOT NULL,
  description text NULL,
  price numeric(10, 2) NOT NULL,
  discount_price numeric(10, 2) NULL,
  company_id integer NOT NULL,
  category character varying(100) NULL,
  image_1 text NULL,
  image_2 text NULL,
  image_3 text NULL,
  image_4 text NULL,
  dimensions character varying(100) NULL,
  weight character varying(50) NULL,
  material character varying(100) NULL,
  color character varying(50) NULL,
  ar_scale numeric(5, 2) NULL DEFAULT 1.0,
  ar_placement character varying(20) NULL DEFAULT 'floor'::character varying,
  has_ar boolean NULL DEFAULT false,
  glb_file text NULL,
  usdz_file text NULL,
  featured boolean NULL DEFAULT false,
  status character varying(20) NULL DEFAULT 'Active'::character varying,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.products ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Create ar_requests table
CREATE TABLE IF NOT EXISTS public.ar_requests (
  id serial NOT NULL,
  product_id integer NOT NULL,
  company_id integer NOT NULL,
  status character varying(20) NULL DEFAULT 'Pending'::character varying,
  request_date timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  approved_date timestamp without time zone NULL,
  rejected_date timestamp without time zone NULL,
  admin_notes text NULL
);

ALTER TABLE public.ar_requests ADD CONSTRAINT ar_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.ar_requests ADD CONSTRAINT ar_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.ar_requests ADD CONSTRAINT ar_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (companies can only see their own data)
CREATE POLICY "Companies can view own data" ON public.companies FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Companies can update own data" ON public.companies FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for products (companies can only manage their own products)
CREATE POLICY "Companies can view own products" ON public.products FOR SELECT USING (auth.uid()::text = company_id::text);
CREATE POLICY "Companies can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid()::text = company_id::text);
CREATE POLICY "Companies can update own products" ON public.products FOR UPDATE USING (auth.uid()::text = company_id::text);
CREATE POLICY "Companies can delete own products" ON public.products FOR DELETE USING (auth.uid()::text = company_id::text);

-- RLS Policies for ar_requests (companies can only see their own requests)
CREATE POLICY "Companies can view own ar_requests" ON public.ar_requests FOR SELECT USING (auth.uid()::text = company_id::text);
CREATE POLICY "Companies can insert own ar_requests" ON public.ar_requests FOR INSERT WITH CHECK (auth.uid()::text = company_id::text);
CREATE POLICY "Companies can update own ar_requests" ON public.ar_requests FOR UPDATE USING (auth.uid()::text = company_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_requests_company_id ON public.ar_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_requests_product_id ON public.ar_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
