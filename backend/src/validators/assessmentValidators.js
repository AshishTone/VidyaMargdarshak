const { body } = require("express-validator");

const assessmentValidator = [
  body("answers").isArray({ min: 1 }).withMessage("Answers are required."),
  body("answers.*.questionId").isString().withMessage("questionId is required."),
  body("answers.*.optionValue").isString().withMessage("optionValue is required."),
];

module.exports = { assessmentValidator };
