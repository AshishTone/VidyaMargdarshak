const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = { connectDatabase };
