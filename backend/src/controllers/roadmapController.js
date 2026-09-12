const { asyncHandler } = require("../utils/asyncHandler");
const {
  getRoadmap10th,
  getRoadmap12th,
  getPublicRoadmap,
  getPersonalizedRoadmap,
} = require("../services/roadmapService");

const getRoadmap10thController = asyncHandler(async (req, res) => {
  const roadmap = await getRoadmap10th();
  res.json(roadmap);
});

const getRoadmap12thController = asyncHandler(async (req, res) => {
  const roadmap = await getRoadmap12th();
  res.json(roadmap);
});

const getPublicRoadmapController = asyncHandler(async (req, res) => {
  const level = req.query.level || "12";
  const roadmap = await getPublicRoadmap(level);
  res.json(roadmap);
});

const getPersonalizedRoadmapController = asyncHandler(async (req, res) => {
  const roadmap = await getPersonalizedRoadmap(req.user);
  res.json(roadmap);
});

module.exports = {
  getRoadmap10thController,
  getRoadmap12thController,
  getPublicRoadmapController,
  getPersonalizedRoadmapController,
};
