import test from 'node:test';
import assert from 'node:assert/strict';
import { visualAuditPasses } from '../scripts/visual-gate.mjs';

test('visual quality gate rejects any flagged pair or incomplete rendered audit', () => {
  const full = { threshold: 0.97, subjects: 172, rendered: 25800, compared: 1922100, exact: 0, near: 0, subjectsReport: Array.from({ length: 172 }, (_, i) => ({ subject: String(i), rendered: 150, flaggedPairs: 0, identicalSignatures: 0 })) };
  assert.equal(visualAuditPasses(full), true);
  assert.equal(visualAuditPasses({ ...full, near: 1 }), false);
  assert.equal(visualAuditPasses({ ...full, exact: 1 }), false);
  assert.equal(visualAuditPasses({ ...full, subjects: 171 }), false);
  assert.equal(visualAuditPasses({ ...full, subjectsReport: [] }), false);
});
