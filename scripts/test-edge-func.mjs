import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jxbrdsiuigzfgkgnsrlp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YnJkc2l1aWd6ZmdrZ25zcmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDExOTgsImV4cCI6MjEwODMxNzE5OH0.3_oq-AINyBEVOf_lPfwcjtsy9RQhv8lkv4_rGZDnBgw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.functions.invoke("calculate-unit-economics", {
    body: {
      startup_type: "b2b_saas",
      daily_cloud_spend_inr: 50000,
      business_metric_value: 100,
    },
  });

  console.log("Edge Function Response:", data, "Error:", error);
}

test();
