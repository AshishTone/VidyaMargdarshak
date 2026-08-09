const express = require("express");
const {
  listColleges,
  getCollegeById,
  getCollegeCourses,
} = require("../controllers/collegeController");

const router = express.Router();

router.get("/", listColleges);
router.get("/:id", getCollegeById);
router.get("/:id/courses", getCollegeCourses);

module.exports = router;
