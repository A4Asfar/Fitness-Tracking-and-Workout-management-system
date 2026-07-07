const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://asfaramir790_db_user:asfaramir456@fitness013.hrkgejq.mongodb.net/test');
  console.log('Connected to DB');
  
  const db = mongoose.connection.db;
  const collection = db.collection('chats');
  
  const indexes = await collection.indexes();
  console.log('Current Indexes:', JSON.stringify(indexes, null, 2));
  
  // Find if there is a unique index on userId
  const userIdIndex = indexes.find(idx => idx.key && idx.key.userId === 1 && idx.unique);
  if (userIdIndex) {
    console.log('Found unique index on userId:', userIdIndex.name);
    await collection.dropIndex(userIdIndex.name);
    console.log('Dropped unique index:', userIdIndex.name);
  } else {
    console.log('No unique index on userId found. Checking index named "userId_1"...');
    try {
      await collection.dropIndex('userId_1');
      console.log('Dropped index userId_1');
    } catch (err) {
      console.log('Could not drop index userId_1 (may not exist or not unique):', err.message);
    }
  }

  // Let Mongoose recreate the correct non-unique indexes
  console.log('Done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
