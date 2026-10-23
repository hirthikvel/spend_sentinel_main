-- ==============================================================================
-- SPENDSENTINEL SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor to link live database telemetry
-- ==============================================================================

-- 1. Create KPI Metrics Table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_days INT NOT NULL UNIQUE,
  spend_total TEXT NOT NULL,
  spend_growth_pill TEXT NOT NULL,
  open_anomalies_count INT NOT NULL,
  open_anomalies_pill TEXT NOT NULL,
  idle_resources_count INT NOT NULL,
  idle_resources_pill TEXT NOT NULL,
  monthly_saving_total TEXT NOT NULL,
  monthly_saving_pill TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Anomalies Incident Table
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  delta TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('MISCONFIGURATION', 'FORGOTTEN ENVIRONMENT', 'HEALTHY GROWTH')),
  confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  evidence_code TEXT NOT NULL,
  dot_color TEXT NOT NULL,
  description TEXT NOT NULL,
  region TEXT NOT NULL,
  environment TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Savings Recommendations Table
CREATE TABLE IF NOT EXISTS savings_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  amount TEXT NOT NULL,
  action TEXT NOT NULL,
  service TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Billing Uploads Table
CREATE TABLE IF NOT EXISTS billing_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  format TEXT NOT NULL DEFAULT 'AWS CUR',
  row_count INT DEFAULT 0,
  status TEXT DEFAULT 'VALIDATED',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Public Read/Write Policies
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on kpi_metrics" ON kpi_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access on anomalies" ON anomalies FOR SELECT USING (true);
CREATE POLICY "Allow public read access on savings_recommendations" ON savings_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public all access on organizations" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow public all access on billing_uploads" ON billing_uploads FOR ALL USING (true);

-- 5. Seed Benchmark Data (Exact Dashboard Defaults)
INSERT INTO kpi_metrics (period_days, spend_total, spend_growth_pill, open_anomalies_count, open_anomalies_pill, idle_resources_count, idle_resources_pill, monthly_saving_total, monthly_saving_pill)
VALUES 
  (7, '$6,350', '+4%', 1, '1 HIGH', 3, 'REVIEW', '$2,900', 'SAVINGS'),
  (14, '$12,800', '+7%', 2, '1 HIGH', 5, 'REVIEW', '$5,750', 'SAVINGS'),
  (30, '$27,400', '+9%', 3, '2 HIGH', 8, 'REVIEW', '$12,100', 'SAVINGS'),
  (60, '$27,400', '+9%', 3, '2 HIGH', 8, 'REVIEW', '$12,100', 'SAVINGS'),
  (90, '$81,200', '+14%', 7, '4 HIGH', 16, 'REVIEW', '$16,800', 'SAVINGS')
ON CONFLICT (period_days) DO UPDATE 
SET spend_total = EXCLUDED.spend_total;

INSERT INTO anomalies (service, delta, verdict, confidence, evidence_code, dot_color, description, region, environment)
VALUES
  ('VPC US-EAST-1', '+$198', 'MISCONFIGURATION', 94, 'E1', '#c85a4b', 'NAT Gateway cross-AZ data processing loop caused by route table misconfiguration.', 'US-EAST-1', 'PRODUCTION'),
  ('EC2 US-WEST-2', '+$285', 'FORGOTTEN ENVIRONMENT', 88, 'E2', '#d99738', 'Unattached p3.2xlarge benchmarking GPU instance running unmonitored over weekend.', 'US-WEST-2', 'STAGING'),
  ('EC2 US-EAST-1', '+$180', 'HEALTHY GROWTH', 96, 'E3', '#60a377', 'Autoscaling group scale-out triggered by organic customer traffic surge during launch.', 'US-EAST-1', 'PRODUCTION');

INSERT INTO savings_recommendations (resource, amount, action, service, environment)
VALUES
  ('I-STG-GPU-01', '$2,850', 'STOP UNATTACHED GPU INSTANCE', 'EC2', 'STAGING'),
  ('RDS-ANALYTICS-OLD', '$1,920', 'DOWNGRADE OR SNAPSHOT DB', 'RDS', 'PRODUCTION'),
  ('I-API-03', '$780', 'RIGHTSIZE OVERPROVISIONED INSTANCE', 'EC2', 'STAGING');
