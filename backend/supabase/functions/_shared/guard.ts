import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';

// 1. CORS allow-list (Never use '*')
const ALLOWED_ORIGINS = ['http://localhost:3000', Deno.env.get('NEXT_PUBLIC_SITE_URL') || ''];

export async function withGuard(
  req: Request, 
  schema: z.ZodTypeAny, 
  handler: (data: any, serviceClient: any, user: any) => Promise<Response>
) {
  const reqId = crypto.randomUUID();
  
  try {
    const origin = req.headers.get('origin') || '';
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
    const corsHeaders = isAllowedOrigin ? { 'Access-Control-Allow-Origin': origin } : {};

    // 1. Allow only POST
    if (req.method === 'OPTIONS') {
      if (isAllowedOrigin) {
        return new Response('ok', { 
          headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, content-type' } 
        });
      }
      return new Response('forbidden', { status: 403 });
    }
    if (req.method !== 'POST') throw new Error('Method not allowed');

    // 2. Reject bodies over 64 KB
    const clonedReq = req.clone();
    const textBody = await clonedReq.text();
    if (new TextEncoder().encode(textBody).length > 65536) throw new Error('Payload too large');

    // 3. Require 'Authorization: Bearer <token>'
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    // 4. Verify JWT / auth.getUser()
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 5. Parse body with strict Zod schema
    const body = await req.json();
    const parsedData = schema.parse(body);

    // 6. Check org membership with the USER client (RLS applies)
    if (parsedData.org_id) {
      const { data: member, error: memberError } = await userClient
        .from('org_members')
        .select('role')
        .eq('org_id', parsedData.org_id)
        .single();
      
      if (memberError || !member) throw new Error('Forbidden: Not a member');
    }

    // 7. Create the service-role client for approved writes
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const response = await handler(parsedData, serviceClient, user);
    
    for (const [k, v] of Object.entries(corsHeaders)) {
      response.headers.set(k, String(v));
    }
    return response;

  } catch (error) {
    // 8. Generic error messages to client, log details on server only
    console.error(`[${reqId}] Request failed:`, error);
    return new Response(
      JSON.stringify({ error: 'request_failed', id: reqId }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}