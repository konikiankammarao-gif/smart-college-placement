const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dns = require('dns');
const mongoose = require('mongoose');

// On Windows, Node's default resolver may fail to resolve SRV records on some local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to default
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const tryConnect = async () => {
    try {
      const uri = process.env.MONGO_URI;
      if (!uri) {
        throw new Error('MONGO_URI is not defined in backend/.env');
      }
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`\n✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
      console.log(`\n⚠️  MongoDB Atlas Connection Pending:`);
      console.log(`   ${error.message}`);
      console.log(`👉 In MongoDB Atlas (cloud.mongodb.com) -> Security -> Network Access,`);
      console.log(`   click '+ Add IP Address' and choose 'Allow Access from Anywhere' (0.0.0.0/0).`);
      console.log(`🔄 Retrying database connection automatically in 8 seconds...\n`);
      setTimeout(tryConnect, 8000);
    }
  };

  await tryConnect();
};

module.exports = connectDB;
