const https = require('https');

const urlsToTest = [
  'https://fitness-tracking-and-workout-management-system-dtwom1lsd.vercel.app/api/auth/login',
  'https://fitness-tracking-and-workout-manage-backend.vercel.app/api/auth/login',
  'https://fitness-tracking-and-workout-manage.vercel.app/api/auth/login' // just in case they put both in one repo
];

const postData = JSON.stringify({ email: 'aamirasfar8@gmail.clm', password: 'admin123' });

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}`);
        console.log(`Body: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`URL: ${url} -> FAILED: ${e.message}\n`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  for (const url of urlsToTest) {
    await testUrl(url);
  }
}

run();
