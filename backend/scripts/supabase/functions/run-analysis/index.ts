import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3';
import { withGuard } from '../_shared/guard.ts';

const RunAnalysisSchema = z.object({
  org_id: z.string().uuid()
});

serve(async (req) => {
  return await withGuard(req, RunAnalysisSchema, async (data, serviceClient, user) => {
    const { org_id } = data;

    // 1. Enforce Rate Limit (6 runs per 10 minutes)
    const { data: isAllowed, error: rateError } = await serviceClient.rpc(
      'check_rate_limit',
      { p_key: `run:${user.id}`, p_limit: 6, p_window_seconds: 600 }
    );
    
    if (rateError || !isAllowed) {
      throw new Error('Rate limit exceeded. Please wait before running another analysis.');
    }

    // 2. Start Analysis to get the Run ID
    const { data: runId, error: startError } = await serviceClient.rpc(
      'start_analysis',
      { p_org: org_id }
    );
    
    if (startError || !runId) {
      throw new Error(startError?.message || 'Failed to start analysis');
    }

    // 3. Process the analysis steps in the background
    // This loop calls each detector (Anomalies -> Decomposition -> Verdict -> Idle).
    // Because each step commits individually, the frontend gets live Realtime updates!
    (async () => {
      let status = 'running';
      let guard = 0;
      
      while (status === 'running' && guard < 20) {
        const { data: stepStatus, error: stepError } = await serviceClient.rpc(
          'run_analysis_step', 
          { p_run: runId }
        );
        
        if (stepError) {
          console.error(`[${runId}] Step failed:`, stepError);
          break;
        }
        status = stepStatus;
        guard++;
      }
    })();

    // 4. Return the Run ID immediately so the UI can subscribe to Realtime updates
    return new Response(JSON.stringify({ run_id: runId }), {
      headers: { 'Content-Type': 'application/json' }
    });
  });
});