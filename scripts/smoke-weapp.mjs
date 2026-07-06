#!/usr/bin/env node
/* 微信小程序 smoke 校验（mock 阶段）：
 * 1. package.json 平台 pin 正确（无 github: / git+ssh: / file:）；
 * 2. 金额字段都是整数；
 * 3. 没有真实 AppID / 私钥；
 * 4. 10 个页面入口文件齐全；
 * 5. 6 大 AI 标签文案在代码里出现。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const errs = [];
const oks = [];

function ok(label) { oks.push(label); }
function bad(label) { errs.push(label); }

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const platformDep = pkg.dependencies?.['@rockcent/platform'];
if (platformDep?.startsWith('git+https://github.com/rockcent/rockcent-platform.git#platform-v')) ok('platform pin');
else bad('platform pin missing or wrong form: ' + platformDep);

const forbidden = ['github:rockcent/rockcent-platform', 'git+ssh://', 'file:/Volumes/Rock2/rockcent-platform'];
const raw = JSON.stringify(pkg);
for (const f of forbidden) {
  if (raw.includes(f)) bad('forbidden platform dep form: ' + f);
}
if (!errs.some((e) => e.startsWith('forbidden'))) ok('no forbidden platform dep form');

function walk(dir, cb) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, cb);
    else if (st.isFile()) cb(p);
  }
}
let scannedFiles = 0;
walk(path.join(ROOT, 'src'), (p) => {
  if (!/\.(ts|tsx)$/.test(p)) return;
  scannedFiles += 1;
  const body = fs.readFileSync(p, 'utf8');
  const fenAssigns = body.match(/_fen\s*[:=]\s*[^,\n}\)]+/g) || [];
  for (const expr of fenAssigns) {
    const rhs = expr.split(/[:=]/)[1]?.trim() || '';
    if (/^-?\d+\.\d+$/.test(rhs)) {
      bad('non-integer _fen assignment in ' + path.relative(ROOT, p) + ': ' + expr);
    }
  }
});
if (!errs.some((e) => e.startsWith('non-integer'))) ok(`scanned ${scannedFiles} ts/tsx files; all _fen are integers`);

const sensitiveFiles = ['.env', 'project.config.json', 'project.private.config.json'];
for (const f of sensitiveFiles) {
  if (fs.existsSync(path.join(ROOT, f))) bad('sensitive file tracked: ' + f);
}
if (!errs.some((e) => e.startsWith('sensitive'))) ok('no tracked sensitive files');

const pages = [
  'src/pages/index/index.tsx',
  'src/pages/recommend/index.tsx',
  'src/pages/content/index.tsx',
  'src/pages/cover/index.tsx',
  'src/pages/publish-confirm/index.tsx',
  'src/pages/publish-success/index.tsx',
  'src/pages/orders/index.tsx',
  'src/pages/review/index.tsx',
  'src/pages/next-plan/index.tsx',
  'src/pages/memory/index.tsx',
  'src/pages/week-plan/index.tsx'
];
for (const p of pages) {
  if (!fs.existsSync(path.join(ROOT, p))) bad('missing page entry: ' + p);
}
if (!errs.some((e) => e.startsWith('missing page'))) ok('all 11 page entries present (V0.6×10 + V0.8 PR-1 week-plan)');

const sixLabels = ['选对礼', '谈得好', '做得美', '发得准', '看得清', '改得好'];
const bannerPath = path.join(ROOT, 'src/components/ai-six-banner/ai-six-banner.tsx');
const bannerBody = fs.readFileSync(bannerPath, 'utf8');
for (const label of sixLabels) {
  if (!bannerBody.includes(label)) bad('AI 6 banner missing label: ' + label);
}
if (!errs.some((e) => e.startsWith('AI 6 banner'))) ok('AI 6 labels present in banner');

console.log('=== Smoke: gift-pilot-miniprogram ===');
for (const o of oks) console.log('  OK ' + o);
if (errs.length) {
  for (const e of errs) console.log('  FAIL ' + e);
  process.exit(1);
}
console.log('All checks PASSED.');
