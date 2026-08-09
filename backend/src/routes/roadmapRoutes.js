const express = require("express");
const {
  getPublicRoadmapController,
  getPersonalizedRoadmapController,
} = require("../controllers/roadmapController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/public", getPublicRoadmapController);
router.get("/personalized", authenticate, getPersonalizedRoadmapController);

module.exports = router;
