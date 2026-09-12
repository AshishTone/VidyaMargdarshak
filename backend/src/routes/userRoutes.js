const express = require("express");
const {
  getMe,
  updateMe,
  addSavedCourse,
  removeSavedCourse,
  addSavedCollege,
  removeSavedCollege,
} = require("../controllers/profileController");
const { authenticate } = require("../middlewares/auth");
const { profileValidator } = require("../validators/profileValidators");
const { validateRequest } = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/", authenticate, getMe);
router.put("/", authenticate, profileValidator, validateRequest, updateMe);
router.post("/saved/courses/:courseId", authenticate, addSavedCourse);
router.delete("/saved/courses/:courseId", authenticate, removeSavedCourse);
router.post("/saved/colleges/:collegeId", authenticate, addSavedCollege);
router.delete("/saved/colleges/:collegeId", authenticate, removeSavedCollege);

module.exports = router;
