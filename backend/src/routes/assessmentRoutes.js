const express = require("express");
const {
  getQuestions,
  submitAssessment,
  getLatestAssessment,
} = require("../controllers/assessmentController");
const { authenticate } = require("../middlewares/auth");
const { assessmentValidator } = require("../validators/assessmentValidators");
const { validateRequest } = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/questions", getQuestions);
router.post("/", authenticate, assessmentValidator, validateRequest, submitAssessment);
router.get("/latest", authenticate, getLatestAssessment);

module.exports = router;
