import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { withGuard } from '../_shared/guard.ts';

const ExplainSchema = z.object({
  org_id: z.string().uuid(),
  finding_id: z.string().uuid()
});

serve(async (req) => {
  return await withGuard(req, ExplainSchema, async (data, serviceClient, user) => {
    const { org_id, finding_id } = data;

    // 1. THE GROUNDING GATE: Fetch finding AND enforce org_id match
    const { data: finding, error: findingError } = await serviceClient
      .from('cost_findings')
      .select('*')
      .eq('id', finding_id)
      .eq('org_id', org_id) // Strict isolation: prevents IDOR attacks
      .single();

    if (findingError || !finding) {
      throw new Error('Finding not found or access denied.');
    }

    // 2. Initialize Gemini 
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Missing Gemini API Key in Edge environment');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      // Force Gemini to return clean, parsable JSON
      generationConfig: { responseMimeType: "application/json" } 
    });

    // 3. Construct the tightly-scoped prompt
    const prompt = `
      You are a strict cloud financial operations (FinOps) expert.
      Analyze this cost anomaly and return a JSON object with EXACTLY these keys:
      - root_cause: (string) A 1-2 sentence explanation of why this cost spike likely happened.
      - remediation_steps: (array of strings) 2-3 precise, actionable steps to investigate or fix it.
      - urgency: (string) "High", "Medium", or "Low" based on the cost impact.

      Context (Do not invent data outside this context):
      Service: ${finding.service}
      Cost Impact: $${finding.cost_impact}
      Resource ID: ${finding.resource_id}
      Type: ${finding.anomaly_type}
    `;

    // 4. Generate and return the explanation
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 5. Parse to ensure it is valid JSON before sending to the frontend
    const explanation = JSON.parse(responseText);

    return new Response(JSON.stringify(explanation), {
      headers: { 'Content-Type': 'application/json' }
    });
  });
});