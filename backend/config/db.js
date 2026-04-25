const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('[DB] Attempting MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[DB] Connected successfully: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('[DB] Tip: Check if MongoDB Atlas is accessible from your network.');
      if (error.syscall === 'querySrv') {
        console.error('[DB] SRV DNS lookup failed. Use the standard (non-srv) connection string from MongoDB Atlas.');
        console.error('[DB] Atlas > Cluster > Connect > Drivers > Node.js > copy string WITHOUT +srv');
      }
    }
    if (error.message.includes('bad auth')) {
      console.error('[DB] Tip: Verify your MongoDB username/password in MONGO_URI.');
    }
    throw error;
  }
};

module.exports = connectDB;
