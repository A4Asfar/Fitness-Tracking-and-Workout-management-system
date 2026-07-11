require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanupAudit() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Unused/Empty collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("=== Collections ===");
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }

    // 2. Duplicate users (by email)
    console.log("\n=== Duplicates ===");
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    const emails = {};
    let hasDuplicates = false;
    users.forEach(u => {
      if(emails[u.email]) {
        console.log(`DUPLICATE EMAIL FOUND: ${u.email}`);
        hasDuplicates = true;
      }
      emails[u.email] = true;
    });
    if (!hasDuplicates) console.log("No duplicate emails found.");

  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

cleanupAudit();
