// 小程序 H5 截图：用 puppeteer-core + 系统 Chrome 渲染 dist/
// Taro H5 用 hash 路由，URL 格式：http://host:port/#/pages/xxx/xxx
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8765;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'dist-screenshots');

const PAGES = [
  { name: 'home',             path: 'pages/index/index' },
  { name: 'recommend',        path: 'pages/recommend/index' },
  { name: 'content',          path: 'pages/content/index' },
  { name: 'cover',            path: 'pages/cover/index' },
  { name: 'publish-confirm',  path: 'pages/publish-confirm/index' },
  { name: 'publish-success',  path: 'pages/publish-success/index' },
  { name: 'orders',           path: 'pages/orders/index' },
  { name: 'review',           path: 'pages/review/index' },
  { name: 'next-plan',        path: 'pages/next-plan/index' },
  { name: 'memory',           path: 'pages/memory/index' },
  { name: 'week-plan',        path: 'pages/week-plan/index' }
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });

  let ok = 0;
  let fail = 0;
  // 首次访问根路径以触发 Taro 初始化（注入 runtime + 全局 history）
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));

  for (const p of PAGES) {
    const url = `${BASE}/#/${p.path}`;
    const out = path.join(OUT_DIR, `${p.name}.png`);
    console.log(`  → ${p.name}: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      // 给 Taro 路由 + 页面 onLoad + 数据 mock 渲染的时间
      await new Promise((r) => setTimeout(r, 2200));
      await page.screenshot({ path: out, fullPage: false });
      const sz = fs.statSync(out).size;
      console.log(`     OK (${sz} bytes)`);
      ok++;
    } catch (e) {
      console.error(`     FAIL: ${e.message}`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\nDone: ${ok} OK, ${fail} FAIL`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
