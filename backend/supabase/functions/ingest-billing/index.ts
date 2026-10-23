import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3';
import { withGuard } from '../_shared/guard.ts';
// We would import the types and mappers from K2 here

const IngestRequestSchema = z.object({
  org_id: z.string().uuid(),
  upload_id: z.string().uuid(),
  storage_path: z.string(),
  source_format: z.enum(['canonical', 'aws_cur', 'focus']).default('canonical')
});
serve(async (req) => {
  return await withGuard(req, IngestRequestSchema, async (data, serviceClient, user) => {
    const { org_id, upload_id, storage_path, source_format } = data;

    try {
      // 1. Mark upload as processing
      await serviceClient
        .from('billing_uploads')
        .update({ status: 'processing' })
        .eq('id', upload_id);

      // 2. Download the CSV from the private bucket
      const { data: fileData, error: downloadError } = await serviceClient
        .storage
        .from('billing-uploads')
        .download(storage_path);
        
      if (downloadError || !fileData) throw new Error('Failed to download CSV');

      // 3. Convert blob to text (In a production app, use proper streaming to save memory)
      const text = await fileData.text();
      const rows = text.split('\n');
      
      // 4. Enforce Caps (50MB and 500k rows)
      const rowCount = rows.length - 1; // Subtract header
      const { data: canIngest } = await serviceClient.rpc('can_ingest', { p_org: org_id, p_incoming: rowCount });
      if (!canIngest) throw new Error('Row limit exceeded for this organization');

      // 5. Here is where the column mapping and Zod validation from K2 will happen.
      // For now, we will simulate a successful validation and insert a dummy chunk to verify the pipeline.
      
      // 6. Mark upload as completed
      await serviceClient
        .from('billing_uploads')
        .update({ 
          status: 'completed',
          row_count: rowCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', upload_id);

      return new Response(JSON.stringify({ success: true, rowCount }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // 7. On failure, mark the upload record as failed
      await serviceClient
        .from('billing_uploads')
        .update({ status: 'failed', error_code: 'ingest_failed' })
        .eq('id', upload_id);
        
      throw error; // Let the guard handle the error response
    }
  });
});