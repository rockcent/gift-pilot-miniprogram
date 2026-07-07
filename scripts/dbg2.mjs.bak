import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--ignore-certificate-errors']
});
const page = await browser.newPage();
page.on('console', msg => console.log(`[${msg.type()}]`, msg.text().slice(0, 200)));
page.on('pageerror', err => console.log('[pageerror]', err.message.slice(0, 300)));
page.on('requestfailed', req => console.log('[fail]', req.url(), '|', req.failure()?.errorText));
await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 1 });
await page.goto('https://gift.rockcent.com/h5/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 5000));
const appHtml = await page.evaluate(() => document.getElementById('app')?.innerHTML?.length ?? 'none');
console.log('#app inner length:', appHtml);
await browser.close();
