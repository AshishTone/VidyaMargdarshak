const { asyncHandler } = require("../utils/asyncHandler");
const Assessment = require("../models/Assessment");
const Course = require("../models/Course");
const Resource = require("../models/Resource");
const { buildRecommendation } = require("../services/recommendationService");
const { generateAiOverview } = require("../services/aiOverviewService");

const getStreamRecommendations = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  const rawScores = assessment?.scoreProfile || { science: 0, commerce: 0, arts: 0, vocational: 0 };
  const recommendation = buildRecommendation(rawScores, req.user);
  res.json({ recommendation });
});

const getCourseRecommendations = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  let stream = req.query.stream;
  if (!stream && assessment) {
    const rec = buildRecommendation(assessment.scoreProfile || {}, req.user);
    stream = rec.rankedStreams[0];
  }
  if (!stream) stream = "Science";

  const courses = await Course.find({
    $or: [{ targetStream: stream }, { targetStream: "All" }],
  }).limit(12);

  res.json({ stream, courses });
});

const getCareerRecommendations = asyncHandler(async (req, res) => {
  let assessmentData = {};
  try {
    const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (assessment) {
      const rec = buildRecommendation(assessment.scoreProfile || {}, req.user);
      assessmentData = {
        scoreProfile: assessment.scoreProfile || {},
        answers: assessment.answers || [],
        suggestedStreams: assessment.suggestedStreams || [],
        suggestedCareers: assessment.suggestedCareers || [],
        explanation: assessment.explanation || [],
        createdAt: assessment.createdAt,
        normalizedScores: rec.normalizedScores || {},
        rankedStreams: rec.rankedStreams || [],
      };
    }
  } catch (err) {
    console.error("Error fetching assessment in getCareerRecommendations:", err);
  }

  const aiOverview = generateAiOverview(req.user, assessmentData);
  const streamFilter = req.query.stream;
  const filteredCareers = streamFilter
    ? aiOverview.predictions.filter((c) => c.stream.toLowerCase() === streamFilter.toLowerCase())
    : aiOverview.predictions;

  res.json({ stream: streamFilter || "All", careers: filteredCareers, topCareer: aiOverview.topCareer });
});

const getResourceRecommendations = asyncHandler(async (req, res) => {
  const resources = await Resource.find().limit(12);
  res.json({ resources });
});

const getAiOverview = asyncHandler(async (req, res) => {
  let assessmentData = {};
  try {
    const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (assessment) {
      const recommendation = buildRecommendation(assessment.scoreProfile || {}, req.user);
      assessmentData = {
        scoreProfile: assessment.scoreProfile || {},
        answers: assessment.answers || [],
        suggestedStreams: assessment.suggestedStreams || [],
        suggestedCareers: assessment.suggestedCareers || [],
        explanation: assessment.explanation || [],
        createdAt: assessment.createdAt,
        normalizedScores: recommendation.normalizedScores || {},
        rankedStreams: recommendation.rankedStreams || [],
      };
    }
  } catch (err) {
    console.error("Error fetching recent assessment for AI overview:", err);
  }

  const aiOverview = generateAiOverview(req.user, assessmentData);
  res.json({ aiOverview });
});

const simulateAiOverview = asyncHandler(async (req, res) => {
  const customSubjects = req.body.subjectScores || {};
  const customInterests = req.body.interestScores || {};
  let assessmentData = {};
  try {
    const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (assessment) {
      const recommendation = buildRecommendation(assessment.scoreProfile || {}, req.user);
      assessmentData = {
        scoreProfile: assessment.scoreProfile || {},
        answers: assessment.answers || [],
        suggestedStreams: assessment.suggestedStreams || [],
        suggestedCareers: assessment.suggestedCareers || [],
        explanation: assessment.explanation || [],
        createdAt: assessment.createdAt,
        normalizedScores: recommendation.normalizedScores || {},
        rankedStreams: recommendation.rankedStreams || [],
      };
    }
  } catch (err) {
    console.error("Error fetching recent assessment for simulation:", err);
  }

  const aiOverview = generateAiOverview(req.user, assessmentData, customSubjects, customInterests);
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
