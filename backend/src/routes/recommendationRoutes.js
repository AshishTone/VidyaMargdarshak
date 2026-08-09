const express = require("express");
const {
  getStreamRecommendations,
  getCourseRecommendations,
  getCareerRecommendations,
  getResourceRecommendations,
  getAiOverview,
  simulateAiOverview,
} = require("../controllers/recommendationController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);
router.get("/streams", getStreamRecommendations);
router.get("/courses", getCourseRecommendations);
router.get("/careers", getCareerRecommendations);
router.get("/resources", getResourceRecommendations);
router.get("/ai-overview", getAiOverview);
router.post("/ai-overview/simulate", simulateAiOverview);

module.exports = router;

