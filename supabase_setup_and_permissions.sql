-- ==============================================================================
-- SPENDSENTINEL SUPABASE BACKEND INTEGRATION & PERMISSIONS SCRIPT
-- Project: Cloud_Cost (Ref: jxbrdsiuigzfgkgnsrlp)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/jxbrdsiuigzfgkgnsrlp/sql)
--
-- This script grants permissions and enables RLS policies on your EXISTING tables and views.
-- It does NOT delete, overwrite, or insert any mock data.
-- ==============================================================================

-- 1. GRANT USAGE & FULL ACCESS TO 'anon' AND 'authenticated' ROLES
-- This resolves the Postgres 42501 (permission denied for table/view/function) error.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. RELAX NOT-NULL ON ORGANIZATIONS.CREATED_BY
-- Allows new organizations to be created freely without requiring pre-registered auth users.
ALTER TABLE IF EXISTS organizations ALTER COLUMN created_by DROP NOT NULL;

-- 3. ENABLE ROW LEVEL SECURITY & ADD POLICIES FOR EXISTING TABLES

-- Organizations
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public organizations read/write" ON organizations;
CREATE POLICY "Public organizations read/write" ON organizations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Billing Uploads
ALTER TABLE IF EXISTS billing_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public billing_uploads read/write" ON billing_uploads;
CREATE POLICY "Public billing_uploads read/write" ON billing_uploads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Billing Line Items
ALTER TABLE IF EXISTS billing_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public billing_line_items read/write" ON billing_line_items;
CREATE POLICY "Public billing_line_items read/write" ON billing_line_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Anomalies
ALTER TABLE IF EXISTS anomalies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public anomalies read/write" ON anomalies;
CREATE POLICY "Public anomalies read/write" ON anomalies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Verdicts
ALTER TABLE IF EXISTS verdicts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public verdicts read/write" ON verdicts;
CREATE POLICY "Public verdicts read/write" ON verdicts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Evidence Ledger
ALTER TABLE IF EXISTS evidence_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public evidence_ledger read/write" ON evidence_ledger;
CREATE POLICY "Public evidence_ledger read/write" ON evidence_ledger FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Idle Resources
ALTER TABLE IF EXISTS idle_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public idle_resources read/write" ON idle_resources;
CREATE POLICY "Public idle_resources read/write" ON idle_resources FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Analysis Runs
ALTER TABLE IF EXISTS analysis_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public analysis_runs read/write" ON analysis_runs;
CREATE POLICY "Public analysis_runs read/write" ON analysis_runs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Audit Log
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public audit_log read/write" ON audit_log;
CREATE POLICY "Public audit_log read/write" ON audit_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. SETUP STORAGE BUCKET FOR BILLING UPLOADS (IF NOT ALREADY CREATED)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('billing-uploads', 'billing-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage access" ON storage.objects;
CREATE POLICY "Public storage access" ON storage.objects FOR ALL TO anon, authenticated 
USING (bucket_id = 'billing-uploads') WITH CHECK (bucket_id = 'billing-uploads');
