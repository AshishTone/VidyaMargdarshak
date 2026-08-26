const { body } = require("express-validator");

const assessmentValidator = [
  body("interestResponses").isArray({ min: 1 }),
  body("interestResponses.*.questionId").exists(),
  body("interestResponses.*.value").isInt({ min: 1, max: 5 }),
  body("profileResponses").isArray({ min: 1 }),
  body("profileResponses.*.questionId").exists(),
  body("profileResponses.*.values").isArray({ min: 1 }),
];

module.exports = { assessmentValidator };
