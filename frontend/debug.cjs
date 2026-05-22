const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('PAGE RESPONSE ERROR:', response.status(), response.url());
    }
  });
  page.on('requestfailed', request => {
    console.log('PAGE REQUEST FAILED:', request.failure().errorText, request.url());
  });

  try {
    await page.goto('http://localhost:5173/rifa/potnuru-sai-sampath', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (err) {
    console.log('NAVIGATION ERROR:', err.message);
  }
  
  await browser.close();
})();
