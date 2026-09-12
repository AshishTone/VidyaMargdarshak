const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtAccessSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token.");
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  req.user = user;
  next();
});

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have access to this resource."));
    }

    next();
  };
}

module.exports = { authenticate, authorizeRoles };
