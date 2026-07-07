// 公网 H5 截图：截 https://gift.rockcent.com/h5/#/...
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve(import.meta.dirname, '..', 'dist-screenshots-public');
const URLS = [
  { name: 'home',       url: 'https://gift.rockcent.com/h5/#/pages/index/index' },
  { name: 'recommend',  url: 'https://gift.rockcent.com/h5/#/pages/recommend/index' },
  { name: 'content',    url: 'https://gift.rockcent.com/h5/#/pages/content/index' },
  { name: 'memory',     url: 'https://gift.rockcent.com/h5/#/pages/memory/index' },
  { name: 'multimodal', url: 'https://gift.rockcent.com/h5/#/pages/multimodal/index' },
  { name: 'batch',      url: 'https://gift.rockcent.com/h5/#/pages/batch/index' },
  { name: 'admin',      url: 'https://gift.rockcent.com/h5/#/pages/admin/index' }
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage', '--ignore-certificate-errors']
});
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });

let ok = 0, fail = 0;
// 先访问根触发 Taro runtime 初始化
await page.goto('https://gift.rockcent.com/h5/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));

for (const { name, url } of URLS) {
  const out = path.join(OUT, `${name}.png`);
  console.log(`  → ${name}: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 3500));
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
process.exit(fail > 0 ? 1 : 0);
