async function test() {
  try {
    const backendUrl = 'https://fitness-tracking-and-workout-management-system-production.up.railway.app/api';
    console.log('📡 Registering user...');
    
    const email = `diet_test_${Math.floor(Math.random() * 1000000)}@example.com`;
    const regRes = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Diet Test User',
        email,
        password: 'password123',
        membershipType: 'free'
      })
    });
    
    const regData = await regRes.json();
    const token = regData.token;
    
    console.log('🔑 Querying trainers...');
    const trainersRes = await fetch(`${backendUrl}/content/trainers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const trainersData = await trainersRes.json();
    console.log('📊 Trainers count:', trainersData.length);
    
    console.log('🔑 Querying nutrition suggestions with goal=None...');
    const suggestionsRes = await fetch(`${backendUrl}/content/nutrition-suggestions?goal=None`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const suggestionsData = await suggestionsRes.json();
    console.log('📊 Suggestions count:', suggestionsData.length);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

test();
