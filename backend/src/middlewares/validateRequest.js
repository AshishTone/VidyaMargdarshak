const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errorArray = result.array();
    const firstMessage = errorArray[0]?.msg || "Validation failed.";
    return next(new ApiError(422, firstMessage, errorArray));
  }

  next();
}

module.exports = { validateRequest };

