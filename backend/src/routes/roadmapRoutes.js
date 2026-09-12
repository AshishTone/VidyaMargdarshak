const express = require("express");
const {
  getRoadmap10thController,
  getRoadmap12thController,
  getPublicRoadmapController,
  getPersonalizedRoadmapController,
} = require("../controllers/roadmapController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/10th", getRoadmap10thController);
router.get("/12th", getRoadmap12thController);
router.get("/public", getPublicRoadmapController);
router.get("/personalized", authenticate, getPersonalizedRoadmapController);

module.exports = router;
