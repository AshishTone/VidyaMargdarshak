const express = require("express");
const {
  createCourse,
  createCollege,
  createDeadline,
  createResource,
} = require("../controllers/adminController");
const { authenticate, authorizeRoles } = require("../middlewares/auth");
const {
  createCourseValidator,
  createCollegeValidator,
  createDeadlineValidator,
  createResourceValidator,
} = require("../validators/adminValidators");
const { validateRequest } = require("../middlewares/validateRequest");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));
router.post("/courses", createCourseValidator, validateRequest, createCourse);
router.post("/colleges", createCollegeValidator, validateRequest, createCollege);
router.post("/deadlines", createDeadlineValidator, validateRequest, createDeadline);
router.post("/resources", createResourceValidator, validateRequest, createResource);

module.exports = router;
