const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../src/models/database.cjs');
const mongoose = require('mongoose');

async function check() {
  await connectDB();
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in DB:', collections.map(c => c.name));
  
  const colName = 'portal_admin_users';
  const docs = await mongoose.connection.db.collection(colName).find({}).toArray();
  console.log(`Found ${docs.length} docs in ${colName}:`, docs.map(d => ({
    username: d.username,
    hashPrefix: (d.password_hash || '').substring(0, 10),
    must_change_password: d.must_change_password,
    failed_login_attempts: d.failed_login_attempts,
    updated_at: d.updated_at
  })));

  const bCount = await mongoose.connection.db.collection('portal_builder_companies').countDocuments();
  console.log('Builder companies in MongoDB (portal_builder_companies):', bCount);

  const eCount = await mongoose.connection.db.collection('portal_education_institutions').countDocuments();
  console.log('Education institutions in MongoDB (portal_education_institutions):', eCount);

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
