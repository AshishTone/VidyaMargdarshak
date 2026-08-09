const express = require("express");
const {
  getStreamRecommendations,
  getCourseRecommendations,
  getCareerRecommendations,
  getResourceRecommendations,
} = require("../controllers/recommendationController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);
router.get("/streams", getStreamRecommendations);
router.get("/courses", getCourseRecommendations);
router.get("/careers", getCareerRecommendations);
router.get("/resources", getResourceRecommendations);

module.exports = router;
