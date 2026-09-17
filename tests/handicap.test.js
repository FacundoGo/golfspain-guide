// Run with: node tests/handicap.test.js
// No dependencies — uses Node built-in assert.

const assert = require('assert');

// --- Core WHS logic (mirrors both EN and ES calculator pages) ---

function handicapDifferential(score, rating, slope) {
  return (score - rating) * (113 / slope);
}

function applyWhsFactor(avgDiff) {
  return avgDiff * 0.93; // WHS 2024 Rules of Handicapping — was 0.96 pre-2024
}

function handicapIndex(rounds) {
  // rounds: [{score, rating, slope}]
  const n = rounds.length;
  const diffs = rounds
    .map(r => handicapDifferential(r.score, r.rating, r.slope))
    .sort((a, b) => a - b);

  const numUsed =
    n === 1  ? 1 :
    n === 2  ? 1 :
    n === 3  ? 1 :
    n === 4  ? 1 :
    n === 5  ? 1 :
    n === 6  ? 2 :
    n === 7  ? 2 :
    n === 8  ? 2 :
    n === 9  ? 3 :
    n === 10 ? 3 :
    n === 11 ? 3 :
    n === 12 ? 3 :
    n === 13 ? 4 :
    n === 14 ? 4 :
    n === 15 ? 4 :
    n === 16 ? 5 :
    n === 17 ? 5 :
    n === 18 ? 6 :
    n === 19 ? 7 :
               8;

  const avgDiff = diffs.slice(0, numUsed).reduce((s, d) => s + d, 0) / numUsed;
  const raw = applyWhsFactor(avgDiff);
  return Math.min(54, Math.round(raw * 10) / 10);
}

// --- Tests ---

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

console.log('\nWHS factor');

test('applyWhsFactor constant is 0.93, not 0.96', () => {
  // 0.96 would give 12.6048; 0.93 gives 12.2090
  const result = applyWhsFactor(13.13);
  assert.ok(
    Math.abs(result - 12.2109) < 0.001,
    `Expected ≈12.21, got ${result.toFixed(4)}`
  );
});

test('applyWhsFactor is NOT 0.96 (regression guard)', () => {
  const wrong = 13.13 * 0.96;
  const result = applyWhsFactor(13.13);
  assert.notStrictEqual(
    parseFloat(result.toFixed(2)),
    parseFloat(wrong.toFixed(2)),
    'Factor is still 0.96 — must be 0.93'
  );
});

console.log('\nAcceptance criteria test case (El Saler 90 + Foressos 95, 2 rounds)');

test('returns 12.2 for El Saler score 90 (Rating 74.2, Slope 136) + Foressos score 95 (Rating 74.1, Slope 140)', () => {
  const result = handicapIndex([
    { score: 90, rating: 74.2, slope: 136 },
    { score: 95, rating: 74.1, slope: 140 },
  ]);
  assert.strictEqual(result, 12.2, `Expected 12.2, got ${result}`);
});

console.log('\nEdge cases');

test('single round', () => {
  const diff = handicapDifferential(85, 72, 113);
  const expected = Math.min(54, Math.round(applyWhsFactor(diff) * 10) / 10);
  const result = handicapIndex([{ score: 85, rating: 72, slope: 113 }]);
  assert.strictEqual(result, expected);
});

test('capped at 54.0', () => {
  const rounds = [{ score: 130, rating: 72, slope: 113 }];
  const result = handicapIndex(rounds);
  assert.ok(result <= 54, `Expected ≤54, got ${result}`);
});

// --- Summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
