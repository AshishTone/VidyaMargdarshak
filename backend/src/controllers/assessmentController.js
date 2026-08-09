const Assessment = require("../models/Assessment");
const Question = require("../models/Question");
const Course = require("../models/Course");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { buildRecommendation } = require("../services/recommendationService");

const getQuestions = asyncHandler(async (req, res) => {
  const userClass = req.query.classLevel || req.user?.classLevel || "10";
  let filter = {};

  if (userClass === "10") {
    filter = { classLevel: { $in: ["10", "all"] } };
  } else if (userClass === "12") {
    filter = { classLevel: { $in: ["12", "all"] } };
  }

  let questions = await Question.find(filter).sort({ order: 1 });
  if (!questions.length) {
    questions = await Question.find().sort({ order: 1 });
  }

  res.json({ questions });
});


const submitAssessment = asyncHandler(async (req, res) => {
  const questions = await Question.find({
    _id: { $in: req.body.answers.map((answer) => answer.questionId) },
  });

  const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
  const baseScores = {
    science: 0,
    commerce: 0,
    arts: 0,
    vocational: 0,
  };

  req.body.answers.forEach((answer) => {
    const question = questionMap.get(answer.questionId);

    if (!question) {
      throw new ApiError(400, "One or more questionIds are invalid.");
    }

    const option = question.options.find((item) => item.value === answer.optionValue);

    if (!option) {
      throw new ApiError(400, "One or more option values are invalid.");
    }

    baseScores.science += option.weights.science || 0;
    baseScores.commerce += option.weights.commerce || 0;
    baseScores.arts += option.weights.arts || 0;
    baseScores.vocational += option.weights.vocational || 0;
  });

  const recommendation = buildRecommendation(baseScores, req.user);
  const courses = await Course.find({
    eligibleStreams: { $in: recommendation.rankedStreams.slice(0, 2) },
  }).limit(6);

  const assessment = await Assessment.create({
    userId: req.user._id,
    answers: req.body.answers,
    scoreProfile: recommendation.rawScores,
    suggestedStreams: recommendation.rankedStreams.slice(0, 3),
    suggestedCareers: courses.flatMap((course) => course.careerOutcomes).slice(0, 6),
    explanation: recommendation.explanations,
  });

  res.status(201).json({
    assessment,
    recommendation: {
      stream: recommendation.rankedStreams[0],
      rankedStreams: recommendation.rankedStreams,
      scores: recommendation.normalizedScores,
      explanation: recommendation.explanations,
    },
  });
});

const getLatestAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  if (!assessment) {
    throw new ApiError(404, "No assessment found for this user.");
  }

  res.json({ assessment });
});

module.exports = { getQuestions, submitAssessment, getLatestAssessment };
