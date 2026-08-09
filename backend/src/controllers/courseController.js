const Course = require("../models/Course");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");

const listCourses = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.stream) {
    filter.eligibleStreams = req.query.stream;
  }

  const courses = await Course.find(filter).sort({ name: 1 });
  res.json({ courses });
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  res.json({ course });
});

module.exports = { listCourses, getCourseById };
