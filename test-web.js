const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to Vercel URL...');
    await page.goto('https://fitness-tracking-and-workout-management-system-dtwom1lsd.vercel.app/', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Done!');
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Error:', err);
    process.exit(1);
  }
})();
