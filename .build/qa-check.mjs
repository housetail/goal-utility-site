// Structural QA for the 12 tool pages. Run after builders finish:
//   node .build/qa-check.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TOOLS = join(process.cwd(), 'tools');
const files = readdirSync(TOOLS).filter(f => f.endsWith('.html'));

let pass = 0, fail = 0;
for (const f of files) {
  const html = readFileSync(join(TOOLS, f), 'utf8');
  const checks = {
    'adsense client': html.includes('ca-pub-8247564773527384'),
    'ad slot 8137669998': html.includes('8137669998'),
    'SoftwareApplication JSON-LD': html.includes('"SoftwareApplication"'),
    'FAQPage JSON-LD': html.includes('"FAQPage"'),
    'result div': html.includes('id="result"'),
    'relative css': html.includes('../assets/site.css'),
    'relative home': html.includes('../index.html'),
    'relative privacy': html.includes('../privacy.html'),
    'no absolute / path': !html.includes('href="/') && !html.includes('src="/'),
    'calculation script': html.includes('addEventListener') || html.includes('calc-form'),
  };
  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (failed.length === 0) { pass++; console.log(`PASS  ${f}`); }
  else { fail++; console.log(`FAIL  ${f} -> ${failed.join(', ')}`); }
}
console.log(`\n${pass} passed, ${fail} failed, ${files.length} total`);
process.exit(fail ? 1 : 0);
