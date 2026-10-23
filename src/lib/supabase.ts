import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project-url")
  );
};

// Initialize Supabase client if credentials exist
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign In with email and password via Supabase Auth
 */
export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) {
    console.warn("Supabase not configured, using local authentication simulation.");
    return { data: { user: { email } }, error: null };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign Up with email and password via Supabase Auth
 */
export async function signUpWithSupabase(email: string, password: string) {
  if (!supabase) {
    console.warn("Supabase not configured, using local authentication simulation.");
    return { data: { user: { email } }, error: null };
  }
  return await supabase.auth.signUp({ email, password });
}

/**
 * Save Organization in Supabase organizations table
 */
export async function createOrganizationInSupabase(name: string) {
  if (!supabase) {
    console.warn("Supabase not configured, saved organization locally:", name);
    return { data: [{ id: "local-org-1", name }], error: null };
  }
  return await supabase.from("organizations").insert([{ name }]).select();
}

/**
 * Save uploaded billing records metadata in Supabase
 */
export async function uploadBillingFileToSupabase(fileMetadata: {
  filename: string;
  sizeBytes: number;
  format: string;
  rowCount?: number;
}) {
  if (!supabase) {
    console.warn("Supabase not configured, saved billing upload locally:", fileMetadata);
    return { data: [{ id: "local-upload-1", ...fileMetadata }], error: null };
  }
  return await supabase.from("billing_uploads").insert([fileMetadata]).select();
}

/**
 * Update anomaly status in Supabase
 */
export async function updateAnomalyStatusInSupabase(
  id: string,
  status: "Open" | "Investigating" | "Resolved"
) {
  if (!supabase) {
    console.warn("Supabase not configured, updated anomaly status locally:", id, status);
    return { data: [{ id, status }], error: null };
  }
  return await supabase.from("anomalies").update({ status }).eq("id", id).select();
}
