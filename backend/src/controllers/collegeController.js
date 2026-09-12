const College = require("../models/College");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");

const listColleges = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.state) {
    filter["location.state"] = new RegExp(req.query.state, "i");
  }

  if (req.query.city) {
    filter["location.city"] = new RegExp(req.query.city, "i");
  }
  if (req.query.name) {
    filter.name = new RegExp(req.query.name.trim(), "i");
  }

  if (req.query.hostel === "true") {
    filter.hostel = true;
  }

  const colleges = await College.find(filter)
    .populate("coursesOffered", "name slug level duration eligibleStreams")
    .sort({ name: 1 });

  const filteredColleges = req.query.course
    ? colleges.filter((college) =>
        college.coursesOffered.some((course) =>
          course.name.toLowerCase().includes(req.query.course.toLowerCase())
        )
      )
    : colleges;

  res.json({ colleges: filteredColleges });
});

const getCollegeById = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id).populate("coursesOffered");

  if (!college) {
    throw new ApiError(404, "College not found.");
  }

  res.json({ college });
});

const getCollegeCourses = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id).populate("coursesOffered");

  if (!college) {
    throw new ApiError(404, "College not found.");
  }

  res.json({ courses: college.coursesOffered });
});

module.exports = { listColleges, getCollegeById, getCollegeCourses };
