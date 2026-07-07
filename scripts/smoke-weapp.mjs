#!/usr/bin/env node
/* 微信小程序 smoke 校验（mock 阶段）：
 * 1. package.json 平台 pin 正确（无 github: / git+ssh: / file:）；
 * 2. 金额字段都是整数；
 * 3. 没有真实 AppID / 私钥；
 * 4. 11 个页面入口文件齐全；
 * 5. 6 大 AI 标签文案在代码里出现。
 * 6. V0.8 PR-2: 6 风格 chip 数据完整性
 * 7. V0.8 PR-3: 3 档发布时间 + 3 平台 ID
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const errs = [];
const oks = [];

function ok(label) { oks.push(label); }
function bad(label) { errs.push(label); }

/* ---------- 1. 平台 pin ---------- */
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

/* ---------- 2. 金额字段都是整数 ---------- */
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

/* ---------- 3. 没有敏感文件 ---------- */
const sensitiveFiles = ['.env', 'project.config.json', 'project.private.config.json'];
for (const f of sensitiveFiles) {
  if (fs.existsSync(path.join(ROOT, f))) bad('sensitive file tracked: ' + f);
}
if (!errs.some((e) => e.startsWith('sensitive'))) ok('no tracked sensitive files');

/* ---------- 4. 页面入口齐全 ---------- */
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
  'src/pages/week-plan/index.tsx',
  'src/pages/multimodal/index.tsx',
  'src/pages/batch/index.tsx',
  'src/pages/admin/index.tsx'
];
for (const p of pages) {
  if (!fs.existsSync(path.join(ROOT, p))) bad('missing page entry: ' + p);
}
if (!errs.some((e) => e.startsWith('missing page'))) ok('all 14 page entries present (V0.6×10 + V0.8 PR-1 + V1.0 PR-16/17/18)');

/* ---------- 5. AI 6 标签 ---------- */
const sixLabels = ['选对礼', '谈得好', '做得美', '发得准', '看得清', '改得好'];
const bannerPath = path.join(ROOT, 'src/components/ai-six-banner/ai-six-banner.tsx');
const bannerBody = fs.readFileSync(bannerPath, 'utf8');
for (const label of sixLabels) {
  if (!bannerBody.includes(label)) bad('AI 6 banner missing label: ' + label);
}
if (!errs.some((e) => e.startsWith('AI 6 banner'))) ok('AI 6 labels present in banner');

/* ---------- 6. V0.8 PR-2: 6 风格 chip ---------- */
const styleChipPath = path.join(ROOT, 'src/services/ai/style.ts');
if (fs.existsSync(styleChipPath)) {
  const sc = fs.readFileSync(styleChipPath, 'utf8');
  const styleIds = ['share', 'review', 'emotion', 'personal', 'professional', 'funny'];
  for (const id of styleIds) {
    if (!sc.includes(`id: '${id}'`)) bad('V0.8 PR-2 style chip missing: ' + id);
  }
  if (!errs.some((e) => e.startsWith('V0.8 PR-2'))) ok('all 6 V0.8 PR-2 style chips present in services/ai/style.ts');
} else {
  bad('V0.8 PR-2 style service missing');
}

/* ---------- 7. V0.8 PR-3: 3 档发布时间 + 3 平台 ID ---------- */
const pr3TypePath = path.join(ROOT, 'src/types/index.ts');
const pr3TypeBody = fs.readFileSync(pr3TypePath, 'utf8');
const slotIds = ['tomorrow-morning', 'tonight-evening', 'day-after-noon'];
const platformIds = ['moments', 'xiaohongshu', 'shipinhao'];
for (const id of slotIds) {
  if (!pr3TypeBody.includes(`'${id}'`)) bad('V0.8 PR-3 publish time slot id missing in types: ' + id);
}
if (!pr3TypeBody.includes('PUBLISH_TIME_SLOT_IDS')) bad('V0.8 PR-3 PUBLISH_TIME_SLOT_IDS export missing');
if (!pr3TypeBody.includes('PLATFORM_IDS')) bad('V0.8 PR-3 PLATFORM_IDS export missing');
if (!errs.some((e) => e.startsWith('V0.8 PR-3 publish time'))) ok('all 3 V0.8 PR-3 publish time slots present in types/index.ts');

const pr3ServiceDir = path.join(ROOT, 'src/services/ai');
const pr3SvcFiles = ['publish-time.ts', 'multi-platform.ts'];
for (const f of pr3SvcFiles) {
  if (!fs.existsSync(path.join(pr3ServiceDir, f))) bad('V0.8 PR-3 service file missing: ' + f);
}
if (!errs.some((e) => e.startsWith('V0.8 PR-3 service'))) ok('V0.8 PR-3 service files present (publish-time + multi-platform)');
for (const id of platformIds) {
  if (!pr3TypeBody.includes(`'${id}'`)) bad('V0.8 PR-3 platform id missing in types: ' + id);
}
if (!errs.some((e) => e.startsWith('V0.8 PR-3 platform'))) ok('all 3 V0.8 PR-3 platform ids present in types/index.ts');

/* ---------- 打印结果放文件末尾 ---------- */

/* ---------- 8. V0.8 PR-4: 3 档健康度 + service 文件 ---------- */
const pr4TypeBody = pr3TypeBody;  // 复用上方已读入的 types/index.ts
const healthStatuses = ['healthy', 'cooling', 'fading'];
for (const s of healthStatuses) {
  if (!pr4TypeBody.includes(`'${s}'`)) bad('V0.8 PR-4 health status missing in types: ' + s);
}
if (!pr4TypeBody.includes('GIFT_HEALTH_STATUSES')) bad('V0.8 PR-4 GIFT_HEALTH_STATUSES export missing');
if (!pr4TypeBody.includes('GiftHealthFlag')) bad('V0.8 PR-4 GiftHealthFlag type missing');
if (!errs.some((e) => e.startsWith('V0.8 PR-4 health'))) ok('all 3 V0.8 PR-4 gift health statuses present in types/index.ts');

const pr4ServicePath = path.join(ROOT, 'src/services/ai/gift-health.ts');
if (!fs.existsSync(pr4ServicePath)) bad('V0.8 PR-4 gift-health service file missing');
if (!errs.some((e) => e.startsWith('V0.8 PR-4 gift-health'))) ok('V0.8 PR-4 gift-health service file present (src/services/ai/gift-health.ts)');

/* ---------- 打印结果放末尾 ---------- */

/* ---------- 9. V1.0 + 阶段二：platform adapter + 6 新 service ---------- */
const platformAdapterPath = path.join(ROOT, 'src/platform/adapter.ts');
if (!fs.existsSync(platformAdapterPath)) bad('V1.0 platform adapter missing: ' + platformAdapterPath);
if (!errs.some((e) => e.startsWith('V1.0 platform'))) ok('V1.0 platform adapter present (src/platform/adapter.ts)');

const v1Services = [
  'src/services/ai/recommend-engine.ts',     // V1.0 PR-15
  'src/services/ai/multimodal.ts',          // V1.0 PR-16
  'src/services/ai/batch.ts',               // V1.0 PR-17
  'src/services/ai/product-supply.ts',       // V1.0 PR-18
  'src/services/payment/wechat-pay.ts',     // 阶段二-D
  'src/services/product/cps.ts',            // 阶段二-C
  'src/services/api/server.ts'              // 阶段二-E
];
for (const f of v1Services) {
  if (!fs.existsSync(path.join(ROOT, f))) bad('V1.0 service file missing: ' + f);
}
if (!errs.some((e) => e.startsWith('V1.0 service'))) ok('all 7 V1.0 + 阶段二 service files present');

/* 阶段二-D SECURITY gate 校验：支付文件必须含 idempotency / verifyCallback */
const payPath = path.join(ROOT, 'src/services/payment/wechat-pay.ts');
if (fs.existsSync(payPath)) {
  const payBody = fs.readFileSync(payPath, 'utf8');
  if (!payBody.includes('idempotencyKey')) bad('V1.0 阶段二-D: wechat-pay missing idempotencyKey');
  if (!payBody.includes('verifyCallback')) bad('V1.0 阶段二-D: wechat-pay missing verifyCallback');
  if (!payBody.includes('signature')) bad('V1.0 阶段二-D: wechat-pay missing signature');
}
if (!errs.some((e) => e.startsWith('V1.0 阶段二-D'))) ok('阶段二-D SECURITY gate: idempotency + verifyCallback + signature present');

/* 阶段二-C: cps.ts 必须含 source: taobao/jd/pdd/mock */
const cpsPath = path.join(ROOT, 'src/services/product/cps.ts');
if (fs.existsSync(cpsPath)) {
  const cpsBody = fs.readFileSync(cpsPath, 'utf8');
  if (!cpsBody.includes("'taobao'") || !cpsBody.includes("'jd'") || !cpsBody.includes("'pdd'")) {
    bad('V1.0 阶段二-C: cps.ts missing source enums (taobao/jd/pdd)');
  }
}
if (!errs.some((e) => e.startsWith('V1.0 阶段二-C'))) ok('阶段二-C CPS source enums (taobao/jd/pdd/mock) present');

/* 阶段二-B: platform adapter 必须 import @rockcent/platform/ai-gateway */
const adapterBody = fs.existsSync(platformAdapterPath) ? fs.readFileSync(platformAdapterPath, 'utf8') : '';
if (!adapterBody.includes('@rockcent/platform/ai-gateway')) bad('V1.0 阶段二-B: platform adapter missing ai-gateway import');
if (!adapterBody.includes('@rockcent/platform/ai-metering')) bad('V1.0 阶段二-B: platform adapter missing ai-metering import');
if (!adapterBody.includes('@rockcent/platform/identity')) bad('V1.0 阶段二-B: platform adapter missing identity import');
if (!adapterBody.includes('@rockcent/platform/usage')) bad('V1.0 阶段二-B: platform adapter missing usage import');
if (!adapterBody.includes('@rockcent/platform/web-client')) bad('V1.0 阶段二-B: platform adapter missing web-client import');
if (!errs.some((e) => e.startsWith('V1.0 阶段二-B'))) ok('阶段二-B 5 platform packages wired in adapter (ai-gateway/ai-metering/identity/usage/web-client)');

/* V1.0 PR-15: recommend-engine 必须含 PRD §6.2 7 项加权 */
const recPath = path.join(ROOT, 'src/services/ai/recommend-engine.ts');
if (fs.existsSync(recPath)) {
  const recBody = fs.readFileSync(recPath, 'utf8');
  const required = ['sceneMatch', 'relationSafety', 'peopleMatch', 'historyConversion', 'productReputation', 'commissionYield', 'inventoryStability'];
  for (const k of required) {
    if (!recBody.includes(k)) bad('V1.0 PR-15 recommend-engine missing factor: ' + k);
  }
  // 7 项权重 25 + 20 + 15 + 15 + 10 + 10 + 5 = 100
  if (!recBody.includes('0.25') || !recBody.includes('0.20') || !recBody.includes('0.15') ||
      !recBody.includes('0.10') || !recBody.includes('0.05')) {
    bad('V1.0 PR-15 recommend-engine missing weights (0.25/0.20/0.15/0.10/0.05)');
  }
}
if (!errs.some((e) => e.startsWith('V1.0 PR-15'))) ok('V1.0 PR-15 recommend-engine: 7 factors + PRD §6.2 weights present');

/* ---------- 打印结果（唯一） ---------- */
console.log('=== Smoke: gift-pilot-miniprogram ===');
for (const o of oks) console.log('  OK ' + o);
if (errs.length) {
  for (const e of errs) console.log('  FAIL ' + e);
  process.exit(1);
}
console.log('All checks PASSED.');
