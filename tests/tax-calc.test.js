/*
 * tax-calc.test.js — unit tests for assets/tax-calc.js
 * Run with:  node --test tests/
 */
const test = require('node:test');
const assert = require('node:assert');
const T = require('../assets/tax-calc.js');

const approx = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

test('clampBase: clamps below/above/within', () => {
  const c = T.getCity('Beijing').social;
  assert.strictEqual(T.clamp(1000, c.baseLower, c.baseUpper), c.baseLower);   // below -> lower
  assert.strictEqual(T.clamp(999999, c.baseLower, c.baseUpper), c.baseUpper); // above -> upper
  assert.strictEqual(T.clamp(20000, c.baseLower, c.baseUpper), 20000);        // within
});

test('calcSocial Beijing @ base 20000', () => {
  const r = T.calcSocial('Beijing', 20000);
  assert.strictEqual(r.base, 20000);
  assert.strictEqual(r.items.pension.emp, 1600);
  assert.strictEqual(r.items.pension.er, 3200);
  assert.ok(approx(r.items.medical.emp, 403));   // 20000*2% + 3 大病
  assert.strictEqual(r.items.medical.er, 1800);
  assert.strictEqual(r.items.unemployment.emp, 100);
  assert.strictEqual(r.items.unemployment.er, 100);
  assert.strictEqual(r.items.injury.er, 80);     // 20000*0.4%
  assert.strictEqual(r.items.maternity.er, 160); // 20000*0.8%
  assert.ok(approx(r.empTotal, 2103));           // 1600+403+100
  assert.ok(approx(r.erTotal, 5340));            // 3200+1800+100+80+160
});

test('calcHousing Beijing @ base 20000 rate 12%', () => {
  const h = T.calcHousing('Beijing', 20000, 12);
  assert.strictEqual(h.base, 20000);
  assert.ok(approx(h.emp, 2400));
  assert.ok(approx(h.er, 2400));
});

test('calcSAD: childEducation(1) + elderlyCare(only child) = 4000', () => {
  const sel = {
    childEducation: { on: true, count: 1 },
    elderlyCare: { on: true, onlyChild: true }
  };
  assert.strictEqual(T.calcSAD(sel), 4000);
});

test('calcSAD: housingRent tier + infantCare(2 kids)', () => {
  const sel = {
    housingRent: { on: true, amount: 1500 },
    infantCare: { on: true, count: 2 }
  };
  assert.strictEqual(T.calcSAD(sel), 1500 + 2000);
});

test('computeSchedule resident: constant income, take-home identity & annual tax', () => {
  const monthly = [];
  for (let i = 0; i < 12; i++) monthly.push({ base: 30000, bonus: 0 });
  const res = T.computeSchedule({
    resident: true, city: 'Beijing',
    socialBase: 30000, housingBase: 30000, housingRate: 12,
    monthly, sadMonthly: 0
  });
  // identity: takeHome == gross - socialEmp - tax  for every month
  res.months.forEach(m => {
    assert.ok(approx(m.takeHome, m.gross - m.socialEmp - m.tax, 1e-6),
      `month ${m.month} take-home identity failed`);
  });
  // monthly tax is non-decreasing (cumulative withholding)
  for (let i = 1; i < res.months.length; i++) {
    assert.ok(res.months[i].tax >= res.months[i - 1].tax - 1e-6,
      `month ${i + 1} tax dropped`);
  }
  // annual IIT equals annual progressive tax on the full-year cumulative taxable
  const yearCumTaxable = res.summary.yearGross - 5000 * 12 - res.socialEmpMonthly * 12;
  const expectedAnnual = T.annualTaxFromCumulative(yearCumTaxable);
  assert.ok(approx(res.summary.yearTax, expectedAnnual, 1e-4),
    `annual tax ${res.summary.yearTax} != expected ${expectedAnnual}`);
});

test('computeSchedule non-resident: constant income, equal monthly tax', () => {
  const monthly = [];
  for (let i = 0; i < 12; i++) monthly.push({ base: 30000, bonus: 0 });
  const res = T.computeSchedule({
    resident: false, city: 'Beijing',
    socialBase: 30000, housingBase: 30000, housingRate: 12,
    monthly, sadMonthly: 0
  });
  const first = res.months[0].tax;
  res.months.forEach(m => assert.ok(approx(m.tax, first, 1e-6), 'non-resident months differ'));
  // resident month-1 tax is lower than non-resident month-1 tax (cumulative benefit)
  const resR = T.computeSchedule({
    resident: true, city: 'Beijing', socialBase: 30000, housingBase: 30000, housingRate: 12, monthly, sadMonthly: 0
  });
  assert.ok(resR.months[0].tax < res.months[0].tax, 'resident month-1 should be lower');
  // for constant income, both methods yield the same annual total
  assert.ok(approx(resR.summary.yearTax, res.summary.yearTax, 1e-4));
});

test('computeSchedule edge: zero wage (Generic) -> no tax, no take-home', () => {
  const monthly = [];
  for (let i = 0; i < 12; i++) monthly.push({ base: 0, bonus: 0 });
  const res = T.computeSchedule({
    resident: true, city: 'Generic',
    socialBase: 0, housingBase: 0, housingRate: 12, monthly, sadMonthly: 0
  });
  assert.strictEqual(res.summary.yearTax, 0);
  res.months.forEach(m => {
    assert.strictEqual(m.tax, 0);
    assert.strictEqual(m.takeHome, 0);
  });
});

test('computeSchedule edge: below threshold (gross < 5000, no social) -> tax 0', () => {
  const monthly = [];
  for (let i = 0; i < 12; i++) monthly.push({ base: 1000, bonus: 0 });
  const res = T.computeSchedule({
    resident: true, city: 'Generic',
    socialBase: 0, housingBase: 0, housingRate: 12, monthly, sadMonthly: 0
  });
  res.months.forEach(m => {
    assert.strictEqual(m.tax, 0);
    assert.ok(approx(m.takeHome, 1000, 1e-6));
  });
});
