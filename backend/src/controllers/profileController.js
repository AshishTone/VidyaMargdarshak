const User = require("../models/User");
const Course = require("../models/Course");
const College = require("../models/College");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { formatUser } = require("./authController");

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("savedCourses", "name slug duration eligibleStreams")
    .populate("savedColleges", "name slug location facilities feesRange");

  res.json({ user: formatUser(user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "phone",
    "classLevel",
    "board",
    "dateOfBirth",
    "gender",
    "tenthBoard",
    "tenthSchool",
    "tenthPassingYear",
    "tenthPassingDate",
    "tenthOverallPercentage",
    "subjectMarks",
    "twelfthBoard",
    "twelfthSchool",
    "twelfthPassingDate",
    "twelfthStream",
    "twelfthOverallPercentage",
    "twelfthSubjectMarks",
    "location",
    "language",
    "currentMarks",
    "resultStatus",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  res.json({ user: formatUser(req.user) });
});

const addSavedCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  if (!req.user.savedCourses.some((id) => id.toString() === course._id.toString())) {
    req.user.savedCourses.push(course._id);
    await req.user.save();
  }

  res.status(201).json({ message: "Course saved successfully." });
});

const removeSavedCourse = asyncHandler(async (req, res) => {
  req.user.savedCourses = req.user.savedCourses.filter(
    (id) => id.toString() !== req.params.courseId
  );
  await req.user.save();

  res.status(204).send();
});

const addSavedCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.collegeId);

  if (!college) {
    throw new ApiError(404, "College not found.");
  }

  if (!req.user.savedColleges.some((id) => id.toString() === college._id.toString())) {
    req.user.savedColleges.push(college._id);
    await req.user.save();
  }

  res.status(201).json({ message: "College saved successfully." });
});

const removeSavedCollege = asyncHandler(async (req, res) => {
  req.user.savedColleges = req.user.savedColleges.filter(
    (id) => id.toString() !== req.params.collegeId
  );
  await req.user.save();

  res.status(204).send();
});

module.exports = {
  getMe,
  updateMe,
  addSavedCourse,
  removeSavedCourse,
  addSavedCollege,
  removeSavedCollege,
};
