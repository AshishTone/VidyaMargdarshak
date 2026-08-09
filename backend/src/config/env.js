const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const backendEnvPath = path.resolve(__dirname, "../../.env");
const rootEnvPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vidyamargdarshak",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};


