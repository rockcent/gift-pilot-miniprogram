import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--ignore-certificate-errors']
});
const page = await browser.newPage();
page.on('pageerror', err => console.log('[pageerror]', err.message, '\n[stack]', err.stack));
await page.goto('https://gift.rockcent.com/h5/', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));
await browser.close();
