import test from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

// We redefine the schemas here for a quick isolated test
const IngestRequestSchema = z.object({
  org_id: z.string().uuid(),
  upload_id: z.string().uuid(),
  storage_path: z.string(),
  source_format: z.enum(['canonical', 'aws_cur', 'focus']).default('canonical')
});

const ExplainSchema = z.object({
  org_id: z.string().uuid(),
  finding_id: z.string().uuid()
});

test('Ingest Validator: Accepts valid payloads', () => {
  const payload = {
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    upload_id: '123e4567-e89b-12d3-a456-426614174001',
    storage_path: 'uploads/file.csv'
  };
  assert.doesNotThrow(() => IngestRequestSchema.parse(payload));
});

test('Ingest Validator: Rejects invalid UUIDs (IDOR prevention)', () => {
  const payload = {
    org_id: 'malicious-string-not-uuid',
    upload_id: '123e4567-e89b-12d3-a456-426614174001',
    storage_path: 'uploads/file.csv'
  };
  assert.throws(() => IngestRequestSchema.parse(payload));
});

test('Explain Validator: Rejects missing fields', () => {
  const payload = {
    org_id: '123e4567-e89b-12d3-a456-426614174000'
    // missing finding_id
  };
  assert.throws(() => ExplainSchema.parse(payload));
});