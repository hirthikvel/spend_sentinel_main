import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jxbrdsiuigzfgkgnsrlp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YnJkc2l1aWd6ZmdrZ25zcmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDExOTgsImV4cCI6MjEwODMxNzE5OH0.3_oq-AINyBEVOf_lPfwcjtsy9RQhv8lkv4_rGZDnBgw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Purging mock billing records from Supabase database...");
  
  const tables = [
    "anomaly_attributions",
    "evidence_ledger",
    "verdicts",
    "anomalies",
    "idle_resources",
    "resource_utilization",
    "analysis_runs",
    "billing_line_items",
    "billing_uploads",
  ];

  await supabase.from("resource_utilization").delete().gt("id", 0);
  await supabase.from("billing_line_items").delete().gt("id", 0);
  const { count: bCount } = await supabase.from("billing_line_items").select("*", { count: "exact", head: true });
  console.log(`billing_line_items remaining: ${bCount}`);
}

main().catch(console.error);
