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

// 2024 WHS round-count → differentials-used table
function numDifferentialsUsed(n) {
  if      (n <= 5)   return 1;
  else if (n <= 8)   return 2;
  else if (n <= 11)  return 3;
  else if (n <= 14)  return 4;
  else if (n <= 16)  return 5;
  else if (n <= 18)  return 6;
  else if (n === 19) return 7;
  else               return 8;
}

function handicapIndex(rounds) {
  const n = rounds.length;
  const diffs = rounds
    .map(r => handicapDifferential(r.score, r.rating, r.slope))
    .sort((a, b) => a - b);

  const numUsed = numDifferentialsUsed(n);
  const avgDiff = diffs.slice(0, numUsed).reduce((s, d) => s + d, 0) / numUsed;
  const raw = applyWhsFactor(avgDiff);
  return Math.min(54, Math.round(raw * 10) / 10);
}

// Helper: build N rounds with ascending differentials so slice(0, k) is predictable.
// Round i has differential = baseScore + i, rating 72, slope 113.
function makeRounds(n, baseScore = 75) {
  return Array.from({ length: n }, (_, i) => ({
    score: baseScore + i,
    rating: 72,
    slope: 113,
  }));
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

// ── WHS factor ──────────────────────────────────────────────────────────────

console.log('\nWHS factor');

test('applyWhsFactor constant is 0.93, not 0.96', () => {
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

// ── 2024 WHS round-count table ───────────────────────────────────────────────

console.log('\n2024 WHS round-count → differentials-used table');

const whs2024Table = [
  // [rounds, expectedNumUsed]
  [1,  1], [2,  1], [3,  1], [4,  1], [5,  1],
  [6,  2], [7,  2], [8,  2],
  [9,  3], [10, 3], [11, 3],
  [12, 4], [13, 4], [14, 4],
  [15, 5], [16, 5],
  [17, 6], [18, 6],
  [19, 7],
  [20, 8],
];

for (const [n, expected] of whs2024Table) {
  test(`n=${n} rounds → use lowest ${expected} differential(s)`, () => {
    assert.strictEqual(
      numDifferentialsUsed(n),
      expected,
      `n=${n}: expected ${expected}, got ${numDifferentialsUsed(n)}`
    );
  });
}

// ── No additive correction (only × 0.93 applied) ────────────────────────────

console.log('\nNo additive adjustment — only × 0.93');

test('result equals avgDiff × 0.93, no additive term, for n=1', () => {
  const rounds = [{ score: 85, rating: 72, slope: 113 }];
  const diff = handicapDifferential(85, 72, 113);
  const expected = Math.min(54, Math.round(diff * 0.93 * 10) / 10);
  assert.strictEqual(handicapIndex(rounds), expected);
});

test('result equals avgDiff × 0.93, no additive term, for n=6 (uses 2 diffs)', () => {
  const rounds = makeRounds(6);
  const diffs = rounds.map(r => handicapDifferential(r.score, r.rating, r.slope)).sort((a, b) => a - b);
  const avg = (diffs[0] + diffs[1]) / 2;
  const expected = Math.min(54, Math.round(avg * 0.93 * 10) / 10);
  assert.strictEqual(handicapIndex(rounds), expected);
});

test('result equals avgDiff × 0.93, no additive term, for n=20 (uses 8 diffs)', () => {
  const rounds = makeRounds(20);
  const diffs = rounds.map(r => handicapDifferential(r.score, r.rating, r.slope)).sort((a, b) => a - b);
  const avg = diffs.slice(0, 8).reduce((s, d) => s + d, 0) / 8;
  const expected = Math.min(54, Math.round(avg * 0.93 * 10) / 10);
  assert.strictEqual(handicapIndex(rounds), expected);
});

// ── Acceptance criteria test case ───────────────────────────────────────────

console.log('\nAcceptance criteria (El Saler 90 + Foressos 95, 2 rounds → 12.2)');

test('El Saler score 90 (Rating 74.2, Slope 136) + Foressos score 95 (Rating 74.1, Slope 140) = 12.2', () => {
  const result = handicapIndex([
    { score: 90, rating: 74.2, slope: 136 },
    { score: 95, rating: 74.1, slope: 140 },
  ]);
  assert.strictEqual(result, 12.2, `Expected 12.2, got ${result}`);
});

// ── Edge cases ───────────────────────────────────────────────────────────────

console.log('\nEdge cases');

test('capped at 54.0', () => {
  const result = handicapIndex([{ score: 200, rating: 72, slope: 113 }]);
  assert.ok(result <= 54, `Expected ≤54, got ${result}`);
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
