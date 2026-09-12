const { body } = require("express-validator");

const createCourseValidator = [
  body("name").trim().notEmpty(),
  body("slug").trim().notEmpty(),
  body("level").trim().notEmpty(),
  body("duration").trim().notEmpty(),
  body("overview").trim().notEmpty(),
];

const createCollegeValidator = [
  body("name").trim().notEmpty(),
  body("slug").trim().notEmpty(),
];

const createDeadlineValidator = [
  body("title").trim().notEmpty(),
  body("category").trim().notEmpty(),
  body("date").isISO8601(),
];

const createResourceValidator = [
  body("title").trim().notEmpty(),
  body("subject").trim().notEmpty(),
  body("format").trim().notEmpty(),
  body("link").isURL(),
];

module.exports = {
  createCourseValidator,
  createCollegeValidator,
  createDeadlineValidator,
  createResourceValidator,
};
