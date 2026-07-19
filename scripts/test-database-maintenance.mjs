import assert from 'node:assert/strict';
import {
  calculateDatabaseGrowth,
  shouldWriteSessionLastSeen
} from '../src/worker.js';

const now = Date.parse('2026-07-19T03:15:00.000Z');

assert.equal(shouldWriteSessionLastSeen('2026-07-19T02:46:00.001Z', now), false, '29 minutes must not write');
assert.equal(shouldWriteSessionLastSeen('2026-07-19T02:45:00.000Z', now), true, '30 minutes must write');
assert.equal(shouldWriteSessionLastSeen('2026-07-19T02:44:00.000Z', now), true, '31 minutes must write');
assert.equal(shouldWriteSessionLastSeen('invalid', now), true, 'invalid timestamps must be repaired');
assert.equal(shouldWriteSessionLastSeen('2026-07-19T03:14:59.999Z', now), false, 'an immediate repeat must not write');

assert.deepEqual(
  calculateDatabaseGrowth(
    [{ database_size_bytes: 2_500_000 }, { database_size_bytes: 2_000_000 }],
    4_000_000
  ),
  {
    growthBytes: 1_500_000,
    growthRatio: 0.6,
    previousGrowthRatio: 0.25,
    alerts: ['database_growth_over_1mib', 'database_growth_over_20_percent_two_months']
  }
);

console.log(JSON.stringify({
  ok: true,
  cases: ['29-minute throttle', '30-minute boundary', '31-minute update', 'invalid timestamp repair', 'immediate repeat', 'growth alerts']
}));
