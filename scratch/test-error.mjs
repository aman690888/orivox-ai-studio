import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('pageerror', err => {
    console.error('Page Error:', err.toString());
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Console Error:', msg.text());
  });

  await page.goto('http://localhost:8080/workspace/new?prompt=test', { waitUntil: 'networkidle2' });
  await browser.close();
})();
