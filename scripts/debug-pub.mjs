import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--ignore-certificate-errors']
});
const page = await browser.newPage();
page.on('console', msg => console.log(`[console.${msg.type()}]`, msg.text()));
page.on('pageerror', err => console.log('[pageerror]', err.message));
page.on('requestfailed', req => console.log('[requestfailed]', req.url(), req.failure()?.errorText));
await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 1 });
await page.goto('https://gift.rockcent.com/h5/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));
const html = await page.content();
console.log('---HTML head---');
console.log(html.slice(0, 2000));
console.log('---DOM body length---');
const bodyLen = await page.evaluate(() => document.body.innerHTML.length);
console.log('body.innerHTML length =', bodyLen);
const appLen = await page.evaluate(() => document.getElementById('app')?.innerHTML?.length ?? 'no #app');
console.log('#app.innerHTML length =', appLen);
await browser.close();
