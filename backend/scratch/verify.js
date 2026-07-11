const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

async function runTests() {
  console.log('--- STARTING FORENSIC VERIFICATION ---');
  await require('../config/db')();

  const health = await request(app).get('/');
  console.log(`[Health Check] ${health.status} - ${health.body.status}`);

  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  let token = '';

  const register = await request(app).post('/api/auth/register').send({
    name: 'Forensic Tester',
    email,
    password,
    membershipType: 'free'
  });
  console.log(`[Register] ${register.status}`);
  if (register.status === 201) {
    token = register.body.token;
  }

  const login = await request(app).post('/api/auth/login').send({
    email,
    password
  });
  console.log(`[Login] ${login.status}`);

  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  console.log(`[Session Restore] ${me.status}`);

  const workouts = await request(app).get('/api/workouts').set('Authorization', `Bearer ${token}`);
  console.log(`[Workouts] ${workouts.status}`);

  const trainers = await request(app).get('/api/trainers');
  console.log(`[Trainers] ${trainers.status}`);

  const profile = await request(app).get('/api/profile/progress').set('Authorization', `Bearer ${token}`);
  console.log(`[Profile] ${profile.status}`);

  const notifs = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
  console.log(`[Notifications] ${notifs.status}`);

  await mongoose.disconnect();
  console.log('--- FORENSIC VERIFICATION COMPLETE ---');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
