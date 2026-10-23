import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jxbrdsiuigzfgkgnsrlp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YnJkc2l1aWd6ZmdrZ25zcmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDExOTgsImV4cCI6MjEwODMxNzE5OH0.3_oq-AINyBEVOf_lPfwcjtsy9RQhv8lkv4_rGZDnBgw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const row = {
    org_id: "a54ece43-d648-4610-8f4b-200c69c2437d",
    usage_date: "2026-10-15",
    service: "Amazon EC2",
    cost: 142.50,
    region: "us-east-1",
    resource_id: "i-012ec2prod",
    tags: { env: "production" },
    currency: "USD",
    is_demo: false,
  };

  const { data, error } = await supabase.from("billing_line_items").insert([row]);
  console.log("Insert result:", { data, error });
}

test();
