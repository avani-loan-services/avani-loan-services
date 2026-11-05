const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const status = await conn.connection.db.command({ connectionStatus: 1 });
    console.log('DB_NAME:', conn.connection.name);
    console.log('USERS:', JSON.stringify(status.authInfo.authenticatedUsers));
    console.log('ROLES:', JSON.stringify(status.authInfo.authenticatedUserRoles));
    await mongoose.disconnect();
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}

check();
