const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  const mongoUri = env.mongoUri || "mongodb://127.0.0.1:27017/vidyamargdarshak";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
}

module.exports = { connectDatabase };

