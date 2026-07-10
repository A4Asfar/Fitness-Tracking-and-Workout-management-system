const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      const headers = { 'Access-Control-Allow-Origin': '*' };
      if (request.method() === 'OPTIONS') {
        request.respond({ status: 200, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': '*' } });
        return;
      }
      
      if (url.includes('/api/')) {
        console.log('Intercepted API request:', url);
        if (url.includes('/workouts/analytics')) {
          request.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({ streak: 5, todaySteps: 1000, weeklyStats: [] }) });
        } else if (url.includes('/workouts')) {
          request.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify([{ exercise: 'Test', date: new Date().toISOString(), duration: 30, type: 'Strength' }]) });
        } else if (url.includes('/premium/my')) {
          request.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({ latestPurchase: null }) });
        } else if (url.includes('/auth/me') || url.includes('/me')) {
          request.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({ user: { id: '1', name: 'Test', email: 'test@test', membershipType: 'free' } }) });
        } else {
          request.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({}) });
        }
      } else {
        request.continue();
      }
    });

    console.log('Navigating to local URL...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Injecting auth state...');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test Athlete',
        email: 'test@test.com',
        membershipType: 'free'
      }));
    });

    console.log('Reloading with auth state...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Waiting to see what happens...');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Done!');
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Error:', err);
    process.exit(1);
  }
})();
