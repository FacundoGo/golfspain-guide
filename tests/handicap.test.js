// Run with: node tests/handicap.test.js
// No dependencies — uses Node built-in assert.

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// --- Core WHS logic (mirrors both EN and ES calculator pages) ---

function handicapDifferential(score, rating, slope) {
  return (score - rating) * (113 / slope);
}

// WHS Rule 5.2a: differentials used + adjustment by number of rounds.
// WHS needs 3+ rounds; for 1–2 the calculator shows a rough indication from the best one.
function whsTable(n) {
  if      (n <= 2)   return { numUsed: 1, adjustment: 0 };
  else if (n === 3)  return { numUsed: 1, adjustment: -2.0 };
  else if (n === 4)  return { numUsed: 1, adjustment: -1.0 };
  else if (n === 5)  return { numUsed: 1, adjustment: 0 };
  else if (n === 6)  return { numUsed: 2, adjustment: -1.0 };
  else if (n <= 8)   return { numUsed: 2, adjustment: 0 };
  else if (n <= 11)  return { numUsed: 3, adjustment: 0 };
  else if (n <= 14)  return { numUsed: 4, adjustment: 0 };
  else if (n <= 16)  return { numUsed: 5, adjustment: 0 };
  else if (n <= 18)  return { numUsed: 6, adjustment: 0 };
  else if (n === 19) return { numUsed: 7, adjustment: 0 };
  else               return { numUsed: 8, adjustment: 0 };
}

function handicapIndex(rounds) {
  const n = rounds.length;
  const diffs = rounds
    .map(r => {
      const d = handicapDifferential(r.score, r.rating, r.slope);
      return r.holes === 9 ? d * 2 : d; // 9-hole rounds: rough ×2 estimate
    })
    .sort((a, b) => a - b);

  const { numUsed, adjustment } = whsTable(n);
  const avgDiff = diffs.slice(0, numUsed).reduce((s, d) => s + d, 0) / numUsed;
  return Math.min(54, Math.round((avgDiff + adjustment) * 10) / 10);
}

// Round i has differential = (baseScore + i) − 72 on a slope-113 course.
function makeRounds(n, baseScore = 75) {
  return Array.from({ length: n }, (_, i) => ({ score: baseScore + i, rating: 72, slope: 113 }));
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

// ── WHS round-count table ───────────────────────────────────────────────────

console.log('\nWHS Rule 5.2a table (differentials used, adjustment)');

const table = [
  [1, 1, 0], [2, 1, 0], [3, 1, -2], [4, 1, -1], [5, 1, 0],
  [6, 2, -1], [7, 2, 0], [8, 2, 0],
  [9, 3, 0], [10, 3, 0], [11, 3, 0],
  [12, 4, 0], [13, 4, 0], [14, 4, 0],
  [15, 5, 0], [16, 5, 0],
  [17, 6, 0], [18, 6, 0],
  [19, 7, 0],
  [20, 8, 0],
];

for (const [n, numUsed, adjustment] of table) {
  test(`n=${n} rounds → lowest ${numUsed}, adjustment ${adjustment}`, () => {
    assert.deepStrictEqual(whsTable(n), { numUsed, adjustment });
  });
}

// ── No multiplier ───────────────────────────────────────────────────────────

console.log('\nNo multiplier (0.96 was dropped in 2020; 0.93 never existed)');

test('n=20: index is the plain average of the best 8', () => {
  // differentials 3..22 → best 8 = 3..10 → average 6.5
  assert.strictEqual(handicapIndex(makeRounds(20)), 6.5);
});

test('n=5: index is the single best differential, unadjusted', () => {
  assert.strictEqual(handicapIndex(makeRounds(5)), 3.0);
});

// ── Small-sample adjustments ────────────────────────────────────────────────

console.log('\nSmall-sample adjustments');

test('n=3: best differential − 2.0', () => {
  assert.strictEqual(handicapIndex(makeRounds(3)), 1.0); // 3 − 2
});

test('n=4: best differential − 1.0', () => {
  assert.strictEqual(handicapIndex(makeRounds(4)), 2.0); // 3 − 1
});

test('n=6: average of best 2 − 1.0', () => {
  assert.strictEqual(handicapIndex(makeRounds(6)), 2.5); // (3 + 4) / 2 − 1
});

// ── Real courses ────────────────────────────────────────────────────────────

console.log('\nReal courses');

test('El Saler 90 (74.2/136) + Foressos 95 (74.1/140), 2 rounds → 13.1 (best one)', () => {
  const result = handicapIndex([
    { score: 90, rating: 74.2, slope: 136 },
    { score: 95, rating: 74.1, slope: 140 },
  ]);
  assert.strictEqual(result, 13.1);
});

// ── 9-hole rough estimate ───────────────────────────────────────────────────

console.log('\n9-hole rounds (rough ×2 estimate)');

test('9-hole differential is doubled', () => {
  // (40 − 35) × 113/113 = 5 → ×2 = 10
  assert.strictEqual(handicapIndex([{ score: 40, rating: 35, slope: 113, holes: 9 }]), 10.0);
});

// ── Edge cases ──────────────────────────────────────────────────────────────

console.log('\nEdge cases');

test('capped at 54.0', () => {
  assert.ok(handicapIndex([{ score: 200, rating: 72, slope: 113 }]) <= 54);
});

// ── Pages use the same logic ────────────────────────────────────────────────

console.log('\nCalculator pages');

for (const lang of ['en', 'es']) {
  const html = fs.readFileSync(path.join(__dirname, '..', lang, 'handicap-calculator', 'index.html'), 'utf8');
  test(`${lang}: no 0.93 / 0.96 multiplier in the page`, () => {
    assert.ok(!/avgDiff \* 0\.9[36]/.test(html), 'multiplier found');
  });
  test(`${lang}: index = average + WHS adjustment`, () => {
    assert.ok(html.includes('const rawIndex  = avgDiff + adjustment;'));
    assert.ok(html.includes("else if (n === 3)  { numUsed = 1; adjustment = -2.0; }"));
    assert.ok(html.includes("else if (n === 6)  { numUsed = 2; adjustment = -1.0; }"));
  });
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
