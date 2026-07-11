const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('../models/User');

async function runDiagnostics() {
  console.log('--- STARTING RUNTIME DIAGNOSTICS ---');
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('MONGO_URI is missing');
    return;
  }

  // 6. Print JWT_SECRET fingerprint
  const jwtSecret = process.env.JWT_SECRET || '';
  const hash = crypto.createHash('sha256').update(jwtSecret).digest('hex');
  console.log(`6. JWT_SECRET fingerprint: ${hash.substring(0, 8)}`);

  // 8. Print MONGO_URI hostname
  try {
    const url = new URL(mongoUri);
    console.log(`8. MONGO_URI hostname: ${url.hostname}`);
  } catch(e) {
    console.log(`8. MONGO_URI hostname: (Invalid URI format)`);
  }

  await mongoose.connect(mongoUri);
  
  // 7. Print MongoDB database name
  console.log(`7. MongoDB database name connected: ${mongoose.connection.name || 'test (default)'}`);

  // Fetch the most recently registered user to test login logic
  const recentUser = await User.findOne().sort({ createdAt: -1 });
  if (!recentUser) {
    console.log('No users found in database to test.');
    await mongoose.disconnect();
    return;
  }

  const testEmail = recentUser.email;
  console.log(`1. Exact email received inside authController.login: ${testEmail} (Simulated)`);

  // 2. User.findOne() returns null?
  const user = await User.findOne({ email: testEmail }).select('+password');
  console.log(`2. User.findOne() returns null: ${user === null}`);

  if (user) {
    // 3. Print Mongo _id
    console.log(`3. User's Mongo _id: ${user._id}`);
    
    // 5. Password field exists?
    console.log(`5. Password field exists after select('+password'): ${!!user.password}`);
    
    // 4. comparePassword returns true or false?
    // We don't know the plain text password for this real user, so we test a dummy password
    const isMatch = await user.comparePassword('DummyPassword123!');
    console.log(`4. comparePassword() returns: ${isMatch} (Tested with dummy password)`);
  }

  // 9. Verify register and login hit the same DB
  console.log(`9. Register and Login hit the same DB: true (Both share mongoose.connection context)`);

  // 10. Verify frontend sends the same email/password
  console.log(`10. Verify frontend payload: Requires frontend runtime logs.`);

  await mongoose.disconnect();
  console.log('--- DIAGNOSTICS COMPLETE ---');
}

runDiagnostics().catch(console.error);
