const { body } = require("express-validator");

const assessmentValidator = [
  body("interestResponses").isArray({ min: 1 }),
  body("interestResponses.*.questionId").exists(),
  body("interestResponses.*.value").isInt({ min: 1, max: 5 }),
  body("profileResponses").optional().isArray(),
  body("profileResponses.*.questionId").optional().exists(),
  body("profileResponses.*.values").optional().isArray({ min: 1 }),
];

module.exports = { assessmentValidator };
