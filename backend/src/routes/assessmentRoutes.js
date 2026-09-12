const express = require("express");
const {
  getQuestions,
  submitAssessment,
  getLatestAssessment,
  getPersonalizedRoadmap,
} = require("../controllers/assessmentController");
const { authenticate } = require("../middlewares/auth");
const { assessmentValidator } = require("../validators/assessmentValidators");
const { validateRequest } = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/questions", authenticate, getQuestions);
router.post("/", authenticate, assessmentValidator, validateRequest, submitAssessment);
router.get("/latest", authenticate, getLatestAssessment);
router.get("/latest/roadmap", authenticate, getPersonalizedRoadmap);

module.exports = router;
