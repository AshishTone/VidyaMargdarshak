const Assessment = require("../models/Assessment");
const Course = require("../models/Course");
const Resource = require("../models/Resource");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { buildRecommendation } = require("../services/recommendationService");
const { generateAiOverview } = require("../services/aiOverviewService");

async function getLatestForUser(userId) {
  const assessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });

  if (!assessment) {
    throw new ApiError(404, "Complete the assessment to unlock recommendations.");
  }

  return assessment;
}

const getStreamRecommendations = asyncHandler(async (req, res) => {
  const assessment = await getLatestForUser(req.user._id);
  const recommendation = buildRecommendation(assessment.scoreProfile, req.user);

  res.json({
    stream: recommendation.rankedStreams[0],
    rankedStreams: recommendation.rankedStreams,
    scores: recommendation.normalizedScores,
    explanation: recommendation.explanations,
  });
});

const getCourseRecommendations = asyncHandler(async (req, res) => {
  const assessment = await getLatestForUser(req.user._id);
  const recommendation = buildRecommendation(assessment.scoreProfile, req.user);
  const courses = await Course.find({
    eligibleStreams: { $in: recommendation.rankedStreams.slice(0, 2) },
  }).limit(8);

  res.json({ courses });
});

const getCareerRecommendations = asyncHandler(async (req, res) => {
  const assessment = await getLatestForUser(req.user._id);
  const recommendation = buildRecommendation(assessment.scoreProfile, req.user);
  const courses = await Course.find({
    eligibleStreams: { $in: recommendation.rankedStreams.slice(0, 2) },
  }).limit(8);

  const careers = Array.from(new Set(courses.flatMap((course) => course.careerOutcomes))).map(
    (title) => ({ title })
  );

  res.json({ careers });
});

const getResourceRecommendations = asyncHandler(async (req, res) => {
  const assessment = await getLatestForUser(req.user._id);
  const recommendation = buildRecommendation(assessment.scoreProfile, req.user);
  const matchedCourses = await Course.find({
    eligibleStreams: { $in: recommendation.rankedStreams.slice(0, 2) },
  }).select("_id");

  const resources = await Resource.find({
    courseMapping: { $in: matchedCourses.map((course) => course._id) },
  }).limit(8);

  res.json({ resources });
});

const getAiOverview = asyncHandler(async (req, res) => {
  let assessmentScores = {};
  try {
    const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (assessment) {
      assessmentScores = assessment.scoreProfile || {};
    }
  } catch {
    // optional assessment
  }

  const aiOverview = generateAiOverview(req.user, assessmentScores);
  res.json({ aiOverview });
});

const simulateAiOverview = asyncHandler(async (req, res) => {
  const customSubjects = req.body.subjectScores || {};
  let assessmentScores = {};
  try {
    const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (assessment) {
      assessmentScores = assessment.scoreProfile || {};
    }
  } catch {
    // optional assessment
  }

  const aiOverview = generateAiOverview(req.user, assessmentScores, customSubjects);
  res.json({ aiOverview });
});

module.exports = {
  getStreamRecommendations,
  getCourseRecommendations,
  getCareerRecommendations,
  getResourceRecommendations,
  getAiOverview,
  simulateAiOverview,
};

