-- Add username field to companies table and update authentication
ALTER TABLE public.companies ADD COLUMN username character varying(100) UNIQUE;

-- Update existing companies with usernames based on email
UPDATE public.companies SET username = SPLIT_PART(email, '@', 1);

-- Make username NOT NULL after setting values
ALTER TABLE public.companies ALTER COLUMN username SET NOT NULL;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_companies_username ON public.companies(username);

-- Update sample data with proper username
UPDATE public.companies 
SET username = 'demo' 
WHERE email = 'demo@furniture.com';
