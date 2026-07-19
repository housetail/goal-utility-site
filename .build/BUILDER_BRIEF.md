# Builder Brief — China Finance Tools (12 tool pages)

You are one of 12 parallel builder agents. Each agent builds ONE tool page. Read this whole file, then build only the tool number you were assigned.

## Hard rules (apply to every page)
- Language: **English only**. Audience: English-speaking Westerners who want to understand Chinese-specific financial rules.
- Output file: `/Users/botforcsw/ai/ad-ai/goal-utility-site/tools/<SLUG>.html` (self-contained HTML).
- **Relative links only** (site lives at GitHub Pages subpath `/goal-utility-site/`):
  - CSS: `../assets/site.css`
  - JS: `../assets/site.js`
  - Home: `../index.html`
  - Privacy: `../privacy.html`
  - Never use absolute `/` paths.
- AdSense: head must include
  `<meta name="google-adsense-account" content="ca-pub-8247564773527384">` and
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8247564773527384" crossorigin="anonymous"></script>`.
  Page must contain exactly one `<ins class="adsbygoogle" ... data-ad-client="ca-pub-8247564773527384" data-ad-slot="8137669998" data-ad-format="auto" data-full-width-responsive="true">` inside a `<div class="ad-box">`.
- JSON-LD: include BOTH a `SoftwareApplication` block and an `FAQPage` block (with the FAQs listed in the spec).
- No external dependencies except the AdSense script and (for the two FX tools) a fetch to `https://open.er-api.com/v6/latest/USD`. No other CDNs, no frameworks.
- Responsive & mobile-first (CSS already handles this via `assets/site.css`).
- Calculation logic must run **in the browser** on form submit; render into `<div id="result" class="result">`. Numbers formatted with `Intl.NumberFormat` (CNY for RMB amounts, USD for $ amounts).
- Be accurate about Chinese rules; add a short `.note` clarifying assumptions/that rules change.

## Reusable HTML skeleton (fill the <...> placeholders; keep structure)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><PAGE TITLE> — China Finance Tools</title>
  <meta name="description" content="<META DESC>" />
  <meta name="google-adsense-account" content="ca-pub-8247564773527384" />
  <link rel="stylesheet" href="../assets/site.css" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8247564773527384" crossorigin="anonymous"></script>
  <script type="application/ld+json">{ "@context":"https://schema.org","@type":"SoftwareApplication","name":"<TOOL NAME>","applicationCategory":"FinanceApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"<META DESC>" }</script>
  <script type="application/ld+json">{ "@context":"https://schema.org","@type":"FAQPage","mainEntity":[ <FAQ JSON ITEMS> ] }</script>
</head>
<body>
  <header class="site-header">
    <div class="brand"><span class="dot"></span> China Finance Tools</div>
    <nav class="site-nav"><a href="../index.html">All tools</a></nav>
  </header>
  <main class="tool-main">
    <div class="tool-head"><h1><H1></h1><p class="lede"><LEDE></p></div>
    <section class="panel">
      <form id="calc-form" class="tool-form"> <FIELDS> </form>
      <div id="result" class="result" role="status" aria-live="polite"></div>
    </section>
    <div class="ad-box" aria-label="Advertisement">
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8247564773527384" data-ad-slot="8137669998" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>
    <section class="faq">
      <h2>Frequently asked questions</h2>
      <details><summary><Q1></summary><p><A1></p></details>
      ... (one <details> per FAQ from spec)
    </section>
  </main>
  <footer class="site-footer">
    <small>&copy; <span id="year">2026</span> China Finance Tools · <a href="../index.html">Home</a> · <a href="../privacy.html">Privacy</a></small>
  </footer>
  <script src="../assets/site.js"></script>
  <script> <CALC JS> </script>
</body>
</html>
```

## CSS classes available (from assets/site.css)
`.tool-main` `.tool-head h1` `.lede` `.panel` `.tool-form` `.field` (label wrapper; put input/select inside) `.hint` `.row` (two-column grid) `.btn` `.result` `.big` `.note` `.ad-box` `.faq` `details/summary` `.site-header` `.brand` `.dot` `.site-nav` `.site-footer`.
Form pattern: `<label class="field">Label <input ...></label>` or `<label class="field">Label <select>...</select></label>`.

---

# TOOL SPECS

## #1 China Mortgage Calculator (LPR) — slug: china-mortgage-calculator
- PAGE TITLE: China Mortgage Calculator (LPR)
- META: Free China mortgage calculator using the LPR benchmark. Compare equal-installment (等额本息) vs equal-principal (等额本金) repayment in RMB.
- H1: China Mortgage Calculator
- LEDE: Estimate your monthly payment on a Chinese home loan using the LPR benchmark, and compare the two standard repayment methods.
- FIELDS: Loan amount (CNY, number); Annual LPR rate % (number, default 3.95); Term (years, number, default 30); Repayment method (select: Equal installment 等额本息 / Equal principal 等额本金).
- CALC:
  - months n = years*12; r = rate/100/12.
  - Equal installment: M = P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1); if r==0 M=P/n. total=M*n; interest=total-P.
  - Equal principal: principalPerMonth = P/n; firstMonthInterest = P*r; firstPayment = principalPerMonth+firstMonthInterest; lastPayment = principalPerMonth + (P/n)*r (tiny); totalInterest = P*r*(n+1)/2; total = P+totalInterest.
  - Show for chosen method: monthly payment (or first/last for equal principal), total payment, total interest. Also show the OTHER method's total interest for comparison.
- FAQs:
  Q What is LPR? A The Loan Prime Rate is the benchmark reference rate set by the National Interbank Funding Center in China; most mortgages are priced as LPR plus a fixed spread.
  Q Equal installment vs equal principal? A Equal installment (等额本息) keeps the monthly payment constant; equal principal (等额本金) pays the same principal each month so payments start high and decrease, with less total interest.
  Q Can foreigners get a mortgage in China? A Yes, but banks typically require a valid work permit/residence permit, proof of income, and a higher down payment; policies vary by city.
  Q Are rates fixed? A Chinese mortgages usually use a floating rate reset periodically against LPR, not a long-term fixed rate like in the US.

## #2 China Forex Quota Calculator — slug: china-forex-quota-calculator
- PAGE TITLE: China Personal Forex Quota Calculator ($50,000)
- META: Check China's annual $50,000 per-person foreign-exchange quota. See how much you can still convert or remit this year.
- H1: China Forex Quota Calculator
- LEDE: China limits individuals to USD 50,000 of foreign-exchange purchase or remittance per calendar year. See what remains.
- FIELDS: Amount already used this year (USD, number, default 0); Planned conversion/remittance now (USD, number, default 10000).
- CALC: quota=50000; remaining=quota-used; if planned<=remaining -> ok, show remaining after; else show shortfall and a note: amounts above the quota generally require documentation of a legitimate purpose (study, medical, trade) and bank approval; large sums may need alternative channels.
- FAQs:
  Q What is the $50,000 quota? A Each individual may purchase or remit up to USD 50,000 of foreign currency per year under simplified procedures.
  Q Can I send more than $50,000? A Yes, with supporting documents proving a genuine purpose; the bank reviews and reports large transfers.
  Q Does it roll over? A No, the quota resets each calendar year and unused amounts are forfeited.
  Q Is this for RMB exchange or remittance? A Both purchasing foreign currency and outward remittance count toward the same annual quota.

## #3 A-Share Price Limit Calculator — slug: a-share-price-limit
- PAGE TITLE: A-Share Price Limit Calculator (涨停/跌停)
- META: Compute the daily limit-up and limit-down prices for Chinese A-shares, with T+1 settlement explained.
- H1: A-Share Price Limit Calculator
- LEDE: Chinese mainland stocks have daily price limits. Enter the previous close to see today's limit-up (涨停) and limit-down (跌停) prices.
- FIELDS: Previous close (CNY, number); Board (select: Main board ±10% / STAR Market & ChiNext ±20%).
- CALC: limit = board==='20'?0.20:0.10; up = prev*(1+limit); down = prev*(1-limit); round to 2 decimals. Show both, and a note: A-shares settle T+1 (you cannot sell shares bought the same day); limits are computed from the previous close.
- FAQs:
  Q What are 涨停 and 跌停? A Limit-up (涨停) and limit-down (跌停) are the maximum prices a stock may trade at on a given day, set as a percentage of the prior close.
  Q What is T+1? A Trades settle the next day; shares bought today cannot be sold until tomorrow.
  Q Which boards use 20%? A The STAR Market (科创板) and ChiNext (创业板) use a ±20% limit; the main board uses ±10%.
  Q Are there exceptions? A Newly listed stocks and some restructured stocks may trade without a limit for their first days.

## #4 China IIT Calculator for Expats — slug: china-iit-calculator
- PAGE TITLE: China Individual Income Tax Calculator for Expats
- META: Estimate monthly individual income tax in China for expats using the 7-tier progressive bracket and the RMB 5,000 threshold.
- H1: China Income Tax Calculator (Expats)
- LEDE: Estimate the individual income tax (IIT) withheld on a China-sourced salary using the standard RMB 5,000 monthly deduction.
- FIELDS: Monthly salary before tax (CNY, number); Monthly tax-exempt allowances (housing/meal etc., CNY, number, default 0).
- CALC: taxable = max(0, salary - 5000 - allowances). Monthly brackets (tax = rate*taxable - quickDeduction):
  <=3000:3%,0; 3000-12000:10%,210; 12000-25000:20%,1410; 25000-35000:25%,2660; 35000-55000:30%,4410; 55000-80000:35%,7160; >80000:45%,15160.
  Show monthly tax, effective rate, annual tax. Note: this is a simplified monthly estimate; actual withholding also deducts social insurance and special additional deductions.
- FAQs:
  Q Who must pay Chinese IIT? A Anyone earning China-sourced income who meets the tax-resident or source rules; expats working in China are generally taxed on China-sourced income.
  Q What is the RMB 5,000 threshold? A It is the standard monthly comprehensive deduction (RMB 60,000/year) applied before tax.
  Q Do tax treaties help? A Yes, China has treaties that may reduce or exempt tax for temporary visitors; the 183-day and 6-year rules matter.
  Q Is there a separate capital gains tax? A Individual gains from A-shares are currently exempt; other gains may be taxed.

## #5 China RMB Exchange Rate (PBOC Parity) — slug: china-rmb-exchange-rate
- PAGE TITLE: China RMB Exchange Rate with PBOC Central Parity
- META: Convert between RMB and other currencies and understand the PBOC central parity rate that anchors the daily RMB band.
- H1: China RMB Exchange Rate
- LEDE: Convert an amount and learn how the PBOC central parity rate (中间价) sets each day's reference for the onshore RMB.
- FIELDS: Amount (number, default 100); From (select major currencies: USD,EUR,GBP,JPY,HKD,CNY); To (same list).
- CALC: fetch('https://open.er-api.com/v6/latest/USD') -> rates object (base USD). Convert via USD: usd = amount/rates[from]; result = usd*rates[to]. Show result + rate + a note explaining the PBOC central parity (中间价) is the daily reference rate published by the People's Bank of China, and that onshore CNY and offshore CNH can differ slightly. On fetch error, show a friendly message.
- FAQs:
  Q What is the PBOC central parity? A The daily reference rate set by the People's Bank of China; the onshore RMB may move within a band around it.
  Q What is the difference between CNY and CNH? A CNY is onshore RMB (regulated band); CNH is offshore RMB traded outside mainland China with a freer price.
  Q Why does RMB have a daily band? A To limit intraday volatility; the band has widened over time to about ±2% around the parity.

## #6 CNY vs CNH Explained — slug: cny-vs-cnh
- PAGE TITLE: CNY vs CNH — Onshore vs Offshore RMB
- META: See the onshore/offshore RMB spread. Convert an amount into both CNY and CNH and understand why two rates exist.
- H1: CNY vs CNH (Onshore vs Offshore RMB)
- LEDE: China has two RMB markets. Enter an amount to see its value in onshore CNY and offshore CNH, and the spread between them.
- FIELDS: Amount in USD (number, default 10000).
- CALC: fetch rates for USD base; cny = amount*rates['CNY']; cnh = amount*rates['CNH'] (if CNH absent, note unavailable). Show both and the spread %. Note: the spread reflects onshore controls vs offshore free trading; usually small but widens in stress.
- FAQs:
  Q Why are there two RMB rates? A Onshore CNY is subject to PBOC controls and a daily band; offshore CNH trades freely in hubs like Hong Kong.
  Q Which rate should I use? A Use CNY for mainland transactions, CNH for offshore holdings; the difference is usually small.
  Q Does the spread matter? A For large transfers it can be meaningful; it also signals market stress or capital-flow pressure.

## #7 China Trading Calendar — slug: china-trading-calendar
- PAGE TITLE: China A-Share Trading Calendar (Next Trading Day)
- META: Find the next A-share trading day, accounting for Chinese public holidays and 调休 make-up workdays.
- H1: China Trading Calendar
- LEDE: Enter a date to find the next mainland A-share trading day, factoring in weekends, public holidays, and 调休 make-up workdays.
- FIELDS: From date (date input, default today).
- CALC: Use a 2026 holiday set (fixed in code): closed dates = New Year Jan 1; Spring Festival Feb 17-23; Qingming Apr 4-6; Labour May 1-5; Dragon Boat Jun 19-21; Mid-Autumn Oct 1 (combined National); National Day Oct 1-7 (note overlap with Mid-Autumn 2026 ~ Oct 1-7). Make-up workdays (treated as TRADING days even if weekend): Feb 15, May 9, Sep 27, Oct 10 (illustrative). Starting from the given date (if it's a trading day, return it; else advance day by day) skip Sat/Sun unless it's a make-up workday, and skip holiday dates. Return the next trading day (YYYY-MM-DD) and a note that this is illustrative and should be verified against the official SSE/SZSE calendar.
- FAQs:
  Q What is 调休? A China shifts rest days around holidays so workers get long breaks; some weekends become make-up workdays and remain trading days.
  Q When is the market closed? A Weekends plus the official public-holiday schedule published by the exchanges each year.
  Q What are the trading hours? A Morning 9:30-11:30 and afternoon 13:00-15:00 (Beijing time), Monday to Friday.

## #8 A-Share vs US Stocks — slug: a-share-vs-us-stocks
- PAGE TITLE: A-Share vs US Stock Rules (Interactive Comparison)
- META: Compare China A-shares and US stocks: price limits, T+1 vs T+0, settlement, and capital gains tax.
- H1: A-Share vs US Stock Rules
- LEDE: Understand the key differences between trading in China's A-share market and US stock markets.
- FIELDS: Stock price (CNY, number, default 100); Board (select Main board ±10% / STAR & ChiNext ±20%).
- CALC: Show for the given price and board: China daily limit range [down, up] = prev*(1-limit)..prev*(1+limit). Show a comparison table: Price limit (China ±10/20%, US none), Settlement (China T+1, US T+0/ T+2), Circuit breaker (China none currently, US LULD), Capital gains tax (China exempt for individuals on A-shares, US taxed). Provide the China range numerically; the rest is static comparison text.
- FAQs:
  Q Why no US-style circuit breaker in China now? A China removed its index circuit breaker in 2016 after it backfired; it relies on per-stock price limits instead.
  Q T+1 vs T+0? A China settles T+1 (no same-day selling); US allows same-day trading though settlement is T+2.
  Q Is Chinese capital gains tax lower? A Individual gains on A-shares are currently exempt, whereas US investors owe capital gains tax.

## #9 China Down Payment Calculator — slug: china-down-payment-calculator
- PAGE TITLE: China Down Payment Calculator (by City & Home Type)
- META: Estimate the required down payment for a home in China based on city tier and first vs second home.
- H1: China Down Payment Calculator
- LEDE: Chinese cities set different minimum down payments. Estimate yours by city tier and whether it is your first or second home.
- FIELDS: Property price (CNY, number); City tier (select: Tier 1 (Beijing/Shanghai/Shenzhen/Guangzhou) / Other cities); Home type (select: First home / Second home).
- CALC (state assumptions in a note): First home Tier1 -> 35%, other -> 20%; Second home Tier1 -> 70%, other -> 30%. downPct; down = price*downPct; loan = price-down. Show down payment %, amount, max mortgage.
- FAQs:
  Q What is the minimum down payment? A Commonly 20% for a first home outside tier-1 cities and 30-35% in tier-1; second homes require more.
  Q Does it vary by city? A Yes, local governments adjust ratios; always confirm with the current local policy.
  Q Can foreigners buy property in China? A Restrictions apply; foreigners generally may buy one self-use home and must meet residency/work conditions.

## #10 Housing Provident Fund Loan — slug: china-housing-fund-loan
- PAGE TITLE: China Housing Provident Fund (公积金) Loan Calculator
- META: Estimate your Housing Provident Fund loan eligibility and monthly payment at China's preferential rate.
- H1: Housing Provident Fund Loan Calculator
- LEDE: The 住房公积金 is a low-interest housing loan for contributors. Estimate your eligible amount and monthly payment.
- FIELDS: Monthly provident-fund contribution (CNY, number, default 2000); Months of continuous contribution (number, default 24); City cap (select: Beijing 1,200,000 / Shanghai 1,000,000 / Shenzhen 1,260,000 / Other 600,000); Term (years, number, default 30).
- CALC: Use a simplified eligibility: eligible = min(cityCap, contribution * 12 * (months/12) * 0.6) (illustrative; real formula uses balance & contribution history). rate = 3.1% (current preferential). n=term*12; r=rate/100/12; M = eligible*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1). Show eligible loan, monthly payment, total interest. Note real eligibility depends on balance and local rules.
- FAQs:
  Q What is the Housing Provident Fund? A A mandatory savings scheme where employers and employees contribute; members can borrow at a preferential rate for housing.
  Q Who qualifies? A Contributors with sufficient continuous payment history; rules vary by city.
  Q What is the interest rate? A Provident-fund loans carry a below-market rate (around 3.1% recently), lower than commercial LPR mortgages.

## #11 China Tax Resident Checker — slug: china-tax-resident-checker
- PAGE TITLE: China Tax Resident Checker (183-Day & 6-Year Rule)
- META: Check whether you are a Chinese tax resident under the 183-day rule and the 6-year worldwide-income rule.
- H1: China Tax Resident Checker
- LEDE: Determine your China tax-resident status using the 183-day presence test and the 6-year rule for worldwide income.
- FIELDS: Days present in China this tax year (number); Years out of the last 6 you were present ≥183 days (number, 0-6).
- CALC: resident = days>=183. worldwide = (years>=6) ? 'Your worldwide income becomes taxable in China once you have been a tax resident for 6 consecutive years (with no ≥30-day absence break).' : 'Only your China-sourced income is taxable this year; the 6-year clock is at N/6.' Show resident status (Yes/No) and the worldwide-income note.
- FAQs:
  Q What is the 183-day rule? A If you are physically present in China ≥183 days in a tax year, you are a tax resident for that year.
  Q What is the 6-year rule? A After 6 consecutive resident years (without a single ≥30-day absence in a year), your worldwide income is taxed in China.
  Q Does the clock reset? A A single year with a continuous absence of 30+ days resets the 6-year count.

## #12 China Social Insurance Estimator — slug: china-social-insurance
- PAGE TITLE: China Social Insurance & Housing Fund Estimator
- META: Estimate monthly five-insurance-plus-housing-fund (五险一金) contributions in China by city and salary base.
- H1: China Social Insurance Estimator
- LEDE: Estimate the monthly 五险一金 (pension, medical, unemployment, injury, maternity + housing fund) split between employee and employer.
- FIELDS: City (select: Beijing / Shanghai / Shenzhen / Generic); Monthly contribution base (CNY, number, default 20000).
- CALC: Use representative rates (employee%/employer%): Pension 8/16; Medical 2/9 (Beijing 10/9 employer varies—simplify 2/9); Unemployment 0.5/0.5; Injury 0/0.4; Maternity 0/0.8; Housing fund 7/7 (range 5-12, use 7). Compute employee total and employer total and grand total per month. Note rates and caps vary by city.
- FAQs:
  Q What is 五险一金? A The "five insurances and one fund": pension, medical, unemployment, work injury, maternity insurance, plus the housing provident fund.
  Q Who pays? A Both employee and employer contribute; the employee's share is withheld from salary.
  Q Do rates vary by city? A Yes, contribution rates and the wage base caps differ across cities.

---

When done, write the file and reply with ONE line: "BUILT <slug> — <one-line summary>". Do not modify any other files.
