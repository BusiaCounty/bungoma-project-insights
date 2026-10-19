import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { MAX_EVIDENCE_SIZE, validateEvidence } from './projectEvidence';

describe('evidence upload validation', () => {
  it('accepts a photograph within the 20 MB limit', () => {
    expect(() => validateEvidence(new File(['photo'], 'photo.png', { type: 'image/png' }))).not.toThrow();
  });
  it('rejects files exceeding 20 MB', () => {
    expect(MAX_EVIDENCE_SIZE).toBe(20971520);
    expect(() => validateEvidence(new File([new Uint8Array(20971521)], 'photo.png', { type: 'image/png' }))).toThrow();
  });
  it('rejects executable web documents', () => {
    expect(() => validateEvidence(new File(['<script>'], 'page.html', { type: 'text/html' }))).toThrow();
  });
});