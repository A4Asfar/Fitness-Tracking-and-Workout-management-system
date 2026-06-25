require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

async function run() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to Atlas cluster!');
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\n📊 DATABASES IN THE CLUSTER:');
    for (const dbInfo of dbs.databases) {
      console.log(`\n🗄️ Database: ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
