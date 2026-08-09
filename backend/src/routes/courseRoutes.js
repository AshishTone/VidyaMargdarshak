const express = require("express");
const { listCourses, getCourseById } = require("../controllers/courseController");

const router = express.Router();

router.get("/", listCourses);
router.get("/:id", getCourseById);

module.exports = router;
