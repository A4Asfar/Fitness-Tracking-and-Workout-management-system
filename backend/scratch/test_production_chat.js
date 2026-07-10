async function testProductionChat() {
  const backendUrl = 'http://localhost:5000/api';
  console.log('📡 Registering test user in production...');

  const email = `chat_test_${Math.floor(Math.random() * 1000000)}@example.com`;
  const regRes = await fetch(`${backendUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Production Chat Tester',
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

  console.log('✉️ Sending message "plan for strength" to AI chat...');
  const chatRes = await fetch(`${backendUrl}/chat/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'plan for strength'
    })
  });

  const chatData = await chatRes.json();
  console.log('\n🤖 AI RESPONSE RECEIVED:');
  console.log('--------------------------------------------------');
  console.log(JSON.stringify(chatData, null, 2));
  console.log('--------------------------------------------------');

  if (chatData.reply) {
    console.log('\n✅ TEST PASSED: Real Gemini AI response received successfully.');
    process.exit(0);
  } else {
    console.error('\n❌ TEST FAILED: Response did not contain a reply.');
    process.exit(1);
  }
}

testProductionChat().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
