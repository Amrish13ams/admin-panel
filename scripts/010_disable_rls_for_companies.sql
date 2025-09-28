-- Disable Row Level Security on companies table to allow public read access
-- This allows the login system to query companies without authentication
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Optional: Add a policy to allow public read access if you want to re-enable RLS later
-- CREATE POLICY "Allow public read access to companies" ON companies FOR SELECT USING (true);
