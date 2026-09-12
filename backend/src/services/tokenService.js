const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenTtl }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function persistRefreshToken(userId, refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(payload.exp * 1000),
  });
}

async function revokeRefreshToken(refreshToken) {
  await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
}

async function isRefreshTokenActive(refreshToken) {
  const tokenDoc = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
  });

  return Boolean(tokenDoc && tokenDoc.expiresAt > new Date());
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
  isRefreshTokenActive,
};
