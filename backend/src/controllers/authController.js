const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
  isRefreshTokenActive,
} = require("../services/tokenService");
const { writeAuditLog } = require("../services/auditService");
const {
  getMissingProfileFields,
  isProfileComplete,
} = require("../utils/profileCompletion");

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    classLevel: user.classLevel,
    board: user.board,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    tenthBoard: user.tenthBoard,
    tenthSchool: user.tenthSchool,
    tenthPassingYear: user.tenthPassingYear,
    tenthPassingDate: user.tenthPassingDate,
    tenthOverallPercentage: user.tenthOverallPercentage,
    subjectMarks: user.subjectMarks,
    twelfthBoard: user.twelfthBoard,
    twelfthSchool: user.twelfthSchool,
    twelfthPassingDate: user.twelfthPassingDate,
    twelfthStream: user.twelfthStream,
    twelfthOverallPercentage: user.twelfthOverallPercentage,
    twelfthSubjectMarks: user.twelfthSubjectMarks,
    location: user.location,
    language: user.language,
    currentMarks: user.currentMarks,
    interests: user.interests,
    strengths: user.strengths,
    savedCourses: user.savedCourses,
    savedColleges: user.savedColleges,
    profileCompleted: isProfileComplete(user),
    missingProfileFields: getMissingProfileFields(user),
  };
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken };
}

const register = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    phone: req.body.phone,
    passwordHash,
    classLevel: req.body.classLevel || "10",
  });

  const tokens = await issueTokens(user);
  await writeAuditLog({ userId: user._id, action: "auth.register" });

  res.status(201).json({
    user: formatUser(user),
    ...tokens,
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokens = await issueTokens(user);
  await writeAuditLog({ userId: user._id, action: "auth.login" });

  res.json({
    user: formatUser(user),
    ...tokens,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "refreshToken is required.");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const isActive = await isRefreshTokenActive(refreshToken);

  if (!isActive) {
    throw new ApiError(401, "Refresh token is no longer active.");
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  const accessToken = signAccessToken(user);

  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.status(204).send();
});

module.exports = { register, login, refresh, logout, formatUser };
