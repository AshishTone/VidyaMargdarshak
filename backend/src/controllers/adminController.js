const Course = require("../models/Course");
const College = require("../models/College");
const Deadline = require("../models/Deadline");
const Resource = require("../models/Resource");
const { asyncHandler } = require("../utils/asyncHandler");

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ course });
});

const createCollege = asyncHandler(async (req, res) => {
  const college = await College.create(req.body);
  res.status(201).json({ college });
});

const createDeadline = asyncHandler(async (req, res) => {
  const deadline = await Deadline.create(req.body);
  res.status(201).json({ deadline });
});

const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create(req.body);
  res.status(201).json({ resource });
});

module.exports = {
  createCourse,
  createCollege,
  createDeadline,
  createResource,
};
