async function testProductionPlan() {
  const backendUrl = 'https://fitness-tracking-and-workout-management-system-production.up.railway.app/api';
  console.log('📡 Registering test user in production...');

  const email = `plan_test_${Math.floor(Math.random() * 1000000)}@example.com`;
  const regRes = await fetch(`${backendUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Production Plan Tester',
      email,
      password: 'password123',
      membershipType: 'free'
    })
  });

  const regData = await regRes.json();
  const token = regData.token;
  if (!token) {
    console.error('❌ Failed to register user. Response:', regData);
    process.exit(1);
  }
  console.log('🔑 Registered successfully. Token obtained.');

  console.log('✉️ Calling GET /content/daily-plan (triggers Gemini plan generation)...');
  const planRes = await fetch(`${backendUrl}/content/daily-plan`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const planData = await planRes.json();
  console.log('\n🤖 AI DAILY PLAN RECEIVED:');
  console.log('--------------------------------------------------');
  console.log(JSON.stringify(planData, null, 2));
  console.log('--------------------------------------------------');

  if (planData.exercises && planData.exercises.length > 0) {
    console.log('\n✅ TEST PASSED: Real Gemini AI daily plan received and parsed successfully.');
    process.exit(0);
  } else {
    console.error('\n❌ TEST FAILED: Response did not contain a valid daily plan.');
    process.exit(1);
  }
}

testProductionPlan().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
