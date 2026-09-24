const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '.impeccable/review/desktop.png' });
  
  // Mobile
  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: '.impeccable/review/mobile.png' });
  
  await browser.close();
})();
