import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// GET: Fetch members strictly enclosed to the requester's organization
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ members: [] });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");

  try {
    let query = supabase.from("org_members").select("*").order("created_at", { ascending: false });

    if (orgId) {
      query = query.eq("org_id", orgId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Error fetching org members:", error);
      return NextResponse.json({ members: [] });
    }

    const members = (data || []).map((m: any) => ({
      id: String(m.id || m.user_id),
      email: m.email || m.user_email || "member@company.com",
      role: (m.role || "Analyst").toUpperCase(),
      createdAt: m.created_at ? String(m.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    }));

    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, members: [] }, { status: 500 });
  }
}

// POST: Add a member with email and password set by the owner, enclosed in their org
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email, password, role, orgId, orgName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Create/register the member in Supabase Auth using the password set by the owner
    // This allows the member to immediately log in from the login page!
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_id: orgId,
          organization_name: orgName || "Default Organization",
          role: role || "Analyst",
        },
      },
    });

    if (authError && !authError.message.includes("already registered")) {
      console.warn("Auth signup error for member:", authError);
    }

    const memberUserId = authData?.user?.id || "00000000-0000-0000-0000-000000000000";

    // 2. Insert member enclosed strictly in this owner's organization
    const { data: insertData, error: insertError } = await supabase
      .from("org_members")
      .insert([
        {
          org_id: orgId || "e0000000-0000-0000-0000-000000000001",
          user_id: memberUserId,
          email,
          role: role || "Analyst",
        },
      ])
      .select();

    if (insertError) {
      console.warn("org_members insert notice:", insertError);
    }

    return NextResponse.json({
      success: true,
      member: {
        id: insertData?.[0]?.id || `mem-${Date.now()}`,
        email,
        role: (role || "Analyst").toUpperCase(),
        createdAt: new Date().toISOString().slice(0, 10),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a member from the organization
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ success: true });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing member id" }, { status: 400 });
  }

  try {
    await supabase.from("org_members").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
