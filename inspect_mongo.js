const fs = require('fs');
const { MongoClient } = require('mongodb');
(async () => {
  require('dotenv').config();
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('NO_URI');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const adminDb = client.db().admin();
  const dbs = await adminDb.listDatabases();
  console.log('DATABASES:');
  for (const dbInfo of dbs.databases) {
    console.log(`- ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
  }
  const targetDb = process.env.DB_NAME || 'brotherhood';
  const db = client.db(targetDb);
  const collections = await db.listCollections().toArray();
  console.log(`\nTARGET DB: ${targetDb}`);
  console.log('COLLECTIONS:');
  for (const coll of collections) {
    const c = db.collection(coll.name);
    const count = await c.countDocuments();
    console.log(`- ${coll.name}: ${count}`);
    if (count > 0) {
      const docs = await c.find().limit(3).toArray();
      console.log(JSON.stringify(docs, null, 2));
    }
  }
  await client.close();
})();
