const { asyncHandler } = require("../utils/asyncHandler");
const {
  getPublicRoadmap,
  getPersonalizedRoadmap,
} = require("../services/roadmapService");

const getPublicRoadmapController = asyncHandler(async (req, res) => {
  const roadmap = await getPublicRoadmap();
  res.json(roadmap);
});

const getPersonalizedRoadmapController = asyncHandler(async (req, res) => {
  const roadmap = await getPersonalizedRoadmap(req.user);
  res.json(roadmap);
});

module.exports = {
  getPublicRoadmapController,
  getPersonalizedRoadmapController,
};
