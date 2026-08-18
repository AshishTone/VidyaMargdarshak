const { body } = require("express-validator");

const profileValidator = [
  body("name").optional().trim().isLength({ min: 2 }),
  body("classLevel").optional().isIn(["10", "12", "graduate"]),
  body("language").optional().isString(),
  body("currentMarks").optional().isFloat({ min: 0, max: 100 }),
  body("dateOfBirth").optional().isISO8601(),
  body("gender").optional().isIn(["female", "male"]),
  body("tenthBoard").optional().trim().isLength({ min: 2 }),
  body("tenthSchool").optional().trim().isLength({ min: 2 }),
  body("tenthPassingYear").optional().isInt({ min: 1950, max: 2100 }),
  body("tenthPassingDate").optional().isISO8601(),
  body("tenthOverallPercentage").optional().isFloat({ min: 0, max: 100 }),
  body("subjectMarks.mathematics").optional().isFloat({ min: 0, max: 100 }),
  body("subjectMarks.science").optional().isFloat({ min: 0, max: 100 }),
  body("subjectMarks.english").optional().isFloat({ min: 0, max: 100 }),
  body("subjectMarks.socialScience").optional().isFloat({ min: 0, max: 100 }),
  body("twelfthBoard").optional().trim().isLength({ min: 2 }),
  body("twelfthSchool").optional().trim().isLength({ min: 2 }),
  body("twelfthPassingDate").optional().isISO8601(),
  body("twelfthStream").optional().isIn(["PCM", "PCB"]),
  body("twelfthOverallPercentage").optional().isFloat({ min: 0, max: 100 }),
  body("twelfthSubjectMarks.physics").optional().isFloat({ min: 0, max: 100 }),
  body("twelfthSubjectMarks.chemistry").optional().isFloat({ min: 0, max: 100 }),
  body("twelfthSubjectMarks.mathematics").optional().isFloat({ min: 0, max: 100 }),
  body("twelfthSubjectMarks.biology").optional().isFloat({ min: 0, max: 100 }),
];

module.exports = { profileValidator };
