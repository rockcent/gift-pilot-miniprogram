import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--ignore-certificate-errors']
});
const page = await browser.newPage();
page.on('pageerror', err => {
  console.log('[pageerror]', err.message);
  console.log('[stack]', err.stack);
});
// Hook JS errors more aggressively
const cdp = await page.createCDPSession();
await cdp.send('Runtime.enable');
cdp.on('Runtime.exceptionThrown', e => {
  console.log('[Runtime.exceptionThrown]');
  console.log(JSON.stringify(e.exceptionDetails, null, 2).slice(0, 3000));
});
await page.goto('https://gift.rockcent.com/h5/', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 3000));
await browser.close();
