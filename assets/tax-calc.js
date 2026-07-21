/*
 * tax-calc.js — China expat income-tax & take-home calculation logic.
 * Pure, environment-agnostic module: works in the browser (window.TaxCalc)
 * and under Node (module.exports) so the same logic can be unit-tested.
 *
 * Scope: estimate monthly individual income tax (IIT) for foreign individuals
 * in China, net of 五险一金 (social insurance + housing fund) and 专项附加扣除
 * (special additional deductions). All figures are estimates — verify with the
 * local tax / social-insurance bureau.
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.TaxCalc = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // ---- 2026 published social-insurance & housing-fund presets (researched) ----
  // social.items use [employee%, employer%]; medical.empFixed = fixed monthly CNY (大病统筹).
  // baseLower/baseUpper = 社保缴费基数 range; housing.* = 公积金 range + rate band.
  // verify = government page to核对 the numbers.
  var CITIES = {
    Beijing: {
      label: 'Beijing (北京)',
      social: {
        baseLower: 7162, baseUpper: 35811,
        items: {
          pension:      { emp: 8,   er: 16,  lower: 7162,  upper: 35811 },
          medical:      { emp: 2,   er: 9,   empFixed: 3, lower: 7162, upper: 35811 },
          unemployment: { emp: 0.5, er: 0.5, lower: 7162,  upper: 35811 },
          injury:       { emp: 0,   er: 0.4, lower: 7162,  upper: 35811 },
          maternity:    { emp: 0,   er: 0.8, lower: 7162,  upper: 35811 } // merged into medical in Beijing
        },
        verify: 'https://rsj.beijing.gov.cn/'
      },
      housing: {
        baseLower: 2420, baseUpper: 35283, rateMin: 5, rateMax: 12, rateDefault: 12,
        verify: 'https://gjj.beijing.gov.cn/'
      }
    },
    Shanghai: {
      label: 'Shanghai (上海)',
      social: {
        baseLower: 7460, baseUpper: 37302,
        items: {
          pension:      { emp: 8,   er: 16,  lower: 7460, upper: 37302 },
          medical:      { emp: 2,   er: 9,   lower: 7460, upper: 37302 }, // inclusive of maternity
          unemployment: { emp: 0.5, er: 0.5, lower: 7460, upper: 37302 },
          injury:       { emp: 0,   er: 0.16, lower: 7460, upper: 37302 },
          maternity:    { emp: 0,   er: 0,   lower: 7460, upper: 37302 }
        },
        verify: 'https://rsj.sh.gov.cn/'
      },
      housing: {
        baseLower: 2740, baseUpper: 37302, rateMin: 5, rateMax: 7, rateDefault: 7,
        verify: 'https://www.shgjj.com/'
      }
    },
    Shenzhen: {
      label: 'Shenzhen (深圳)',
      social: {
        baseLower: 2520, baseUpper: 33633, // representative: pension cap 27549, medical 33633, unemployment 44265
        items: {
          pension:      { emp: 8,   er: 16, lower: 4775, upper: 27549 },
          medical:      { emp: 2,   er: 6,  lower: 6727, upper: 33633 }, // 2026 unit medical restored to 6% (incl. maternity)
          unemployment: { emp: 0.3, er: 0.7, lower: 2520, upper: 44265 },
          injury:       { emp: 0,   er: 0.2, lower: 2520, upper: 44265 },
          maternity:    { emp: 0,   er: 0,   lower: 2520, upper: 44265 }
        },
        verify: 'https://hrss.sz.gov.cn/'
      },
      housing: {
        baseLower: 2520, baseUpper: 44265, rateMin: 5, rateMax: 12, rateDefault: 12,
        verify: 'https://gjj.sz.gov.cn/'
      }
    },
    Guangzhou: {
      label: 'Guangzhou (广州)',
      social: {
        baseLower: 2500, baseUpper: 41112, // representative: pension 27549, medical 31170, unemployment 41112
        items: {
          pension:      { emp: 8,    er: 16,   lower: 5510, upper: 27549 },
          medical:      { emp: 2,    er: 6.85, lower: 6234, upper: 31170 }, // incl. maternity
          unemployment: { emp: 0.2,  er: 0.8,  lower: 2500, upper: 41112 },
          injury:       { emp: 0,    er: 0.2,  lower: 2500, upper: 41112 },
          maternity:    { emp: 0,    er: 0,    lower: 2500, upper: 41112 }
        },
        verify: 'https://guangzhou.chinatax.gov.cn/'
      },
      housing: {
        baseLower: 2500, baseUpper: 41697, rateMin: 5, rateMax: 12, rateDefault: 12,
        verify: 'https://gjj.gz.gov.cn/'
      }
    },
    Generic: {
      label: 'Generic (全国代表值)',
      social: {
        baseLower: 0, baseUpper: 999999,
        items: {
          pension:      { emp: 8,   er: 16,  lower: 0, upper: 999999 },
          medical:      { emp: 2,   er: 9,   empFixed: 3, lower: 0, upper: 999999 },
          unemployment: { emp: 0.5, er: 0.5, lower: 0, upper: 999999 },
          injury:       { emp: 0,   er: 0.4, lower: 0, upper: 999999 },
          maternity:    { emp: 0,   er: 0.8, lower: 0, upper: 999999 }
        },
        verify: 'https://www.chinatax.gov.cn/'
      },
      housing: {
        baseLower: 0, baseUpper: 999999, rateMin: 5, rateMax: 12, rateDefault: 12,
        verify: 'https://www.chinatax.gov.cn/'
      }
    }
  };

  // Authoritative source pages for the two contribution-base fields (user-supplied).
  var SOCIAL_BASE_SRC = 'https://znhd.neimenggu.chinatax.gov.cn:8443/znhdzsknsrd/detail?id=649313';
  var HOUSING_BASE_SRC = 'https://gjj.beijing.gov.cn/web/zwgk61/2024zcwj/436433461/743765441/index.html';

  // ---- 专项附加扣除 (Special Additional Deductions), 2026 standard monthly ----
  // Labels are English-first with Chinese in parentheses; notes follow the same rule.
  // hasCount: multiply by number of children; onlyChild: 3000 vs 1500; tiers: rent by city;
  // custom: free monthly estimate (大病医疗 is actual, not fixed).
  var SAD = {
    childEducation: { label: 'Child education (子女教育)', perMonth: 1000, hasCount: true, defaultCount: 1, note: 'Per child 1,000/month (每孩 1000/月)' },
    continuingEdu:  { label: 'Continuing education (继续教育)', perMonth: 400, hasCount: false, note: 'Vocational qualification 3,600/year (职业资格 3600/年)' },
    seriousIllness: { label: 'Serious-illness medical (大病医疗)', perMonth: 0, custom: true, note: 'Actual amount above 15,000; annual cap 80,000 (超15000部分，年上限80000)' },
    housingLoan:    { label: 'Housing loan interest (住房贷款利息)', perMonth: 1000, hasCount: false, note: '1,000/month (与租金二选一 / choose one of loan or rent)' },
    housingRent:    { label: 'Housing rent (住房租金)', perMonth: 1500, tiers: [1500, 1100, 800], note: 'Municipality 1,500 / district>1M 1,100 / other 800' },
    elderlyCare:    { label: 'Elderly care (赡养老人)', perMonth: 3000, onlyChild: true, note: 'Only child 3,000 / non-only 1,500 (独生3000 / 非独1500)' },
    infantCare:     { label: 'Infant care under 3 (3岁以下婴幼儿照护)', perMonth: 1000, hasCount: true, defaultCount: 1, note: 'Per child 1,000/month (每孩 1000/月)' }
  };

  // ---- Tax brackets ----
  // Annual progressive table (累计预扣法 for residents).
  var ANNUAL_BRACKETS = [
    { up: 36000,   rate: 0.03, qd: 0 },
    { up: 144000,  rate: 0.10, qd: 2520 },
    { up: 300000,  rate: 0.20, qd: 16920 },
    { up: 420000,  rate: 0.25, qd: 31920 },
    { up: 660000,  rate: 0.30, qd: 52920 },
    { up: 960000,  rate: 0.35, qd: 85920 },
    { up: Infinity, rate: 0.45, qd: 181920 }
  ];
  // Monthly table (非居民 simplified method) = annual ÷ 12.
  var MONTHLY_BRACKETS = [
    { up: 3000,   rate: 0.03, qd: 0 },
    { up: 12000,  rate: 0.10, qd: 210 },
    { up: 25000,  rate: 0.20, qd: 1410 },
    { up: 35000,  rate: 0.25, qd: 2660 },
    { up: 55000,  rate: 0.30, qd: 4410 },
    { up: 80000,  rate: 0.35, qd: 7160 },
    { up: Infinity, rate: 0.45, qd: 15160 }
  ];

  var BASIC_DEDUCTION = 5000; // 基本减除费用 /月

  // ---- Pure helpers ----
  function clamp(v, lo, hi) {
    v = Number(v);
    if (isNaN(v)) v = 0;
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
  }

  function bracketTax(taxable, brackets) {
    if (taxable <= 0) return 0;
    for (var i = 0; i < brackets.length; i++) {
      if (taxable <= brackets[i].up) return taxable * brackets[i].rate - brackets[i].qd;
    }
    return 0;
  }

  function annualTaxFromCumulative(cumTaxable) {
    return bracketTax(cumTaxable, ANNUAL_BRACKETS);
  }

  function monthlyTaxSimple(taxable) {
    return bracketTax(taxable, MONTHLY_BRACKETS);
  }

  function getCity(key) {
    return CITIES[key] || CITIES.Generic;
  }

  // Social insurance for one (constant) contribution base.
  // rateOverrides: { pension:{emp,er}, ... } to override city defaults.
  function calcSocial(cityKey, base, rateOverrides) {
    var city = getCity(cityKey);
    var defs = city.social.items;
    var baseClamped = clamp(base, city.social.baseLower, city.social.baseUpper);
    var items = {};
    var empTotal = 0, erTotal = 0;
    for (var k in defs) {
      var d = defs[k];
      var empRate = (rateOverrides && rateOverrides[k]) ? rateOverrides[k].emp : d.emp;
      var erRate = (rateOverrides && rateOverrides[k]) ? rateOverrides[k].er : d.er;
      var fixed = (d.empFixed || 0);
      if (baseClamped <= 0) fixed = 0; // not enrolled when base is zero
      var emp = baseClamped * empRate / 100 + fixed;
      var er = baseClamped * erRate / 100;
      empTotal += emp;
      erTotal += er;
      items[k] = { emp: emp, er: er, empRate: empRate, erRate: erRate, empFixed: d.empFixed || 0 };
    }
    return { base: baseClamped, items: items, empTotal: empTotal, erTotal: erTotal };
  }

  // Housing fund: employee & employer contribute the same rate on the same base.
  function calcHousing(cityKey, base, rate) {
    var city = getCity(cityKey);
    var baseClamped = clamp(base, city.housing.baseLower, city.housing.baseUpper);
    var r = clamp(rate == null ? city.housing.rateDefault : rate, city.housing.rateMin, city.housing.rateMax) / 100;
    var emp = baseClamped * r;
    return { base: baseClamped, rate: r * 100, emp: emp, er: emp };
  }

  // Monthly special-additional-deduction total from a selections object:
  // { childEducation:{on:true,count:1}, housingRent:{on:true,amount:1500}, ... }
  function calcSAD(selections) {
    selections = selections || {};
    var total = 0;
    for (var k in SAD) {
      var sel = selections[k];
      if (!sel || !sel.on) continue;
      var def = SAD[k];
      if (def.custom) {
        total += Number(sel.amount) || 0;
      } else if (def.tiers) {
        total += Number(sel.amount) || def.perMonth;
      } else if (def.onlyChild) {
        total += sel.onlyChild ? def.perMonth : def.perMonth / 2; // 3000 vs 1500
      } else if (def.hasCount) {
        total += def.perMonth * (Number(sel.count) || def.defaultCount);
      } else {
        total += def.perMonth;
      }
    }
    return total;
  }

  // Full 12-month schedule.
  // inputs = {
  //   resident: bool, city: string, socialBase, housingBase, housingRate,
  //   rateOverrides, monthly: [{base,bonus} x12], sadMonthly: number
  // }
  function computeSchedule(inputs) {
    inputs = inputs || {};
    var cityKey = inputs.city || 'Generic';
    var social = calcSocial(cityKey, inputs.socialBase, inputs.rateOverrides);
    var housing = calcHousing(cityKey, inputs.housingBase, inputs.housingRate);
    var socialEmpMonthly = social.empTotal + housing.emp;
    var sadMonthly = inputs.sadMonthly || 0;
    var resident = inputs.resident !== false;
    var months = [];
    var cumGross = 0, cumSocialEmp = 0, cumTaxPaid = 0, cumTakeHome = 0;

    for (var m = 1; m <= 12; m++) {
      var row = (inputs.monthly && inputs.monthly[m - 1]) || { base: 0, bonus: 0 };
      var gross = (Number(row.base) || 0) + (Number(row.bonus) || 0);
      var tax, taxable;
      if (resident) {
        cumGross += gross;
        cumSocialEmp += socialEmpMonthly;
        var cumTaxable = cumGross - BASIC_DEDUCTION * m - cumSocialEmp - sadMonthly * m;
        var cumTax = annualTaxFromCumulative(cumTaxable);
        tax = Math.max(0, cumTax - cumTaxPaid);
        cumTaxPaid += tax;
        taxable = cumTaxable;
      } else {
        taxable = gross - BASIC_DEDUCTION - socialEmpMonthly - sadMonthly;
        tax = Math.max(0, monthlyTaxSimple(taxable));
      }
      var takeHome = gross - socialEmpMonthly - tax;
      months.push({
        month: m,
        gross: gross,
        socialEmp: socialEmpMonthly,
        housingEmp: housing.emp,
        socialItems: social.items,
        taxable: taxable,
        tax: tax,
        takeHome: takeHome
      });
      cumTakeHome += takeHome;
    }

    var yearGross = months.reduce(function (s, x) { return s + x.gross; }, 0);
    var yearTax = months.reduce(function (s, x) { return s + x.tax; }, 0);
    var yearSocialEmp = socialEmpMonthly * 12;
    var yearTakeHome = cumTakeHome;
    var yearEmployer = social.erTotal * 12 + housing.er * 12;

    return {
      city: cityKey,
      resident: resident,
      social: social,
      housing: housing,
      socialEmpMonthly: socialEmpMonthly,
      sadMonthly: sadMonthly,
      months: months,
      summary: {
        yearGross: yearGross,
        yearSocialEmp: yearSocialEmp,
        yearTax: yearTax,
        yearTakeHome: yearTakeHome,
        yearEmployer: yearEmployer,
        avgMonthlyTakeHome: yearTakeHome / 12
      }
    };
  }

  return {
    CITIES: CITIES,
    SAD: SAD,
    SOCIAL_BASE_SRC: SOCIAL_BASE_SRC,
    HOUSING_BASE_SRC: HOUSING_BASE_SRC,
    ANNUAL_BRACKETS: ANNUAL_BRACKETS,
    MONTHLY_BRACKETS: MONTHLY_BRACKETS,
    BASIC_DEDUCTION: BASIC_DEDUCTION,
    clamp: clamp,
    getCity: getCity,
    calcSocial: calcSocial,
    calcHousing: calcHousing,
    calcSAD: calcSAD,
    annualTaxFromCumulative: annualTaxFromCumulative,
    monthlyTaxSimple: monthlyTaxSimple,
    computeSchedule: computeSchedule
  };
});
