const { body } = require("express-validator");

const profileValidator = [
  body("name").optional().trim().isLength({ min: 2 }),
  body("classLevel").optional().isIn(["10", "12", "graduate"]),
  body("language").optional().isString(),
  body("currentMarks").optional().isFloat({ min: 0, max: 100 }),
  body("interests").optional().isArray(),
  body("strengths").optional().isArray(),
];

module.exports = { profileValidator };
