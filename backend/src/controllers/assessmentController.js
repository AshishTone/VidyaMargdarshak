const AssessmentForm = require("../models/AssessmentForm");
const ProfileQuestion = require("../models/AssessmentStudentProfileQuestion");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const AssessmentResponse = require("../models/AssessmentResponse");
const InterestResult = require("../models/InterestResult");
const ExplorationTopic = require("../models/ExplorationTopic");
const Recommendation = require("../models/Recommendation");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { buildStructuredRecommendations } = require("../services/after10MatchingService");
const { explainRecommendations } = require("../services/geminiExplanationService");

const activeForm = () => AssessmentForm.findOne({ formId: "AFTER10_V1", status: "ACTIVE" }).lean();
const questionKey = value => String(value);
const profileAnswers = responses => Object.fromEntries(responses.map(item => [questionKey(item.questionId).replace(/^PROFILE:/, ""), item.responseValues]));

const getQuestions = asyncHandler(async (req, res) => {
  const [form, profileQuestions, priorAttempt] = await Promise.all([activeForm(), ProfileQuestion.find({ active: true, version: 1 }).sort({ questionId: 1 }).lean(), AssessmentAttempt.findOne({ studentId: req.user._id, assessmentFormId: "AFTER10_V1", status: "COMPLETED" }).lean()]);
  if (!form) throw new ApiError(404, "The active After-10th assessment form was not found.");
  if (!Array.isArray(form.questions) || form.questions.length !== form.questionCount) throw new ApiError(500, "The configured assessment form does not contain its expected questions.");
  const priorResult = priorAttempt ? await InterestResult.exists({ attemptId: priorAttempt._id }) : null;
  res.json({ form: { ...form, responseScale: form.responseScale?.options || form.responseScale }, profileQuestions, alreadyAttempted: Boolean(priorResult) });
});

const submitAssessment = asyncHandler(async (req, res) => {
  const existing = await AssessmentAttempt.findOne({ studentId: req.user._id, assessmentFormId: "AFTER10_V1", status: "COMPLETED" });
  if (existing) {
    const existingResult = await InterestResult.exists({ attemptId: existing._id });
    if (existingResult) throw new ApiError(409, "You have already completed this assessment.");
    await AssessmentResponse.deleteMany({ attemptId: existing._id });
    await AssessmentAttempt.deleteOne({ _id: existing._id });
  }
  const [form, profileQuestions] = await Promise.all([activeForm(), ProfileQuestion.find({ active: true, version: 1 }).lean()]);
  if (!form) throw new ApiError(404, "The active After-10th assessment form was not found.");
  const questions = form.questions || [];
  const questionMap = new Map(questions.map(question => [questionKey(question.questionId), question]));
  if (questions.length !== form.questionCount || req.body.interestResponses.length !== questions.length) throw new ApiError(400, "Please answer every interest question.");
  const allowedValues = new Set((form.responseScale?.options || form.responseScale || []).map(option => Number(option.value)));
  const interest = req.body.interestResponses.map(answer => {
    const question = questionMap.get(questionKey(answer.questionId)); const responseValue = Number(answer.value);
    if (!question || !allowedValues.has(responseValue)) throw new ApiError(400, "An interest response is invalid.");
    return { questionId: question.questionId, categoryId: question.categoryId || question.category, responseValue, uncertaintyFlag: responseValue === 3, responseType: "INTEREST", answeredAt: new Date() };
  });
  if (new Set(interest.map(answer => questionKey(answer.questionId))).size !== questions.length) throw new ApiError(400, "Each interest question must be answered once.");
  const profileMap = new Map(profileQuestions.map(question => [questionKey(question.questionId), question]));
  if (req.body.profileResponses.length !== profileQuestions.length) throw new ApiError(400, "Please answer every profile question.");
  const profile = req.body.profileResponses.map(answer => {
    const question = profileMap.get(questionKey(answer.questionId)); const responseValues = answer.values || [];
    if (!question || !responseValues.length || responseValues.some(value => !question.options.some(option => option.value === value))) throw new ApiError(400, "A profile response is invalid.");
    if (question.questionType !== "MULTIPLE_SELECT" && responseValues.length !== 1) throw new ApiError(400, "This profile question accepts one answer.");
    return { questionId: `PROFILE:${question.questionId}`, responseValues, responseType: "PROFILE", answeredAt: new Date() };
  });
  const now = new Date();
  let attempt;
  try { attempt = await AssessmentAttempt.create({ studentId: req.user._id, assessmentFormId: form.formId, targetLevel: form.targetLevel, language: req.body.language || "en", status: "COMPLETED", startedAt: now, completedAt: now, questionCount: interest.length + profile.length, answeredCount: interest.length + profile.length, unsureCount: interest.filter(item => item.uncertaintyFlag).length, completionPercentage: 100 }); } catch (error) { if (error.code === 11000) throw new ApiError(409, "You have already completed this assessment."); throw error; }
  try {
    await AssessmentResponse.insertMany([...interest, ...profile].map(response => ({ ...response, attemptId: attempt._id })));
  } catch (error) {
    await AssessmentResponse.deleteMany({ attemptId: attempt._id });
    await AssessmentAttempt.deleteOne({ _id: attempt._id });
    throw error;
  }
  const min = Number(form.responseScale?.min || form.scoring?.minResponse || 1); const max = Number(form.responseScale?.max || form.scoring?.maxResponse || 5);
  const categoryResults = [...new Set(interest.map(item => item.categoryId))].map(categoryId => { const items = interest.filter(item => item.categoryId === categoryId); const rawScore = items.reduce((sum, item) => sum + item.responseValue, 0); const minScore = min * items.length; const maxScore = max * items.length; const unsureCount = items.filter(item => item.uncertaintyFlag).length; return { categoryId, rawScore, minScore, maxScore, interestIndex: ((rawScore - minScore) / (maxScore - minScore)) * 100, unsureCount, uncertaintyRate: (unsureCount / items.length) * 100 }; }).sort((a, b) => b.interestIndex - a.interestIndex).map((item, index) => ({ ...item, rank: index + 1 }));
  const result = await InterestResult.create({ attemptId: attempt._id, studentId: req.user._id, results: categoryResults, topCategories: categoryResults.slice(0, 3).map(item => item.categoryId), calculationVersion: "SCORE_V1", generatedAt: now });
  res.status(201).json({ attempt, result, profile: profileAnswers(profile) });
});

const getLatestAssessment = asyncHandler(async (req, res) => {
  const attempt = await AssessmentAttempt.findOne({ studentId: req.user._id, assessmentFormId: "AFTER10_V1", status: "COMPLETED" }).sort({ completedAt: -1 }).lean();
  if (!attempt) throw new ApiError(404, "No assessment found for this user.");
  const [result, responses] = await Promise.all([InterestResult.findOne({ attemptId: attempt._id }).lean(), AssessmentResponse.find({ attemptId: attempt._id, responseType: "PROFILE" }).lean()]);
  const topIds = result?.topCategories || [];
  const [explorationTopics, rules] = await Promise.all([ExplorationTopic.find({ active: true, categoryId: { $in: topIds } }).lean(), Recommendation.find({ active: true, categoryId: { $in: topIds } }).sort({ priority: 1 }).lean()]);
  const scores = new Map((result?.results || []).map(item => [item.categoryId, item.interestIndex]));
  const recommendations = rules.filter(rule => scores.get(rule.categoryId) >= Number(rule.conditions?.minimumInterestIndex || 0)).map(rule => ({ categoryId: rule.categoryId, pathways: rule.recommendedPathways, priority: rule.priority }));
  const profile = profileAnswers(responses);
  const structuredRecommendations = buildStructuredRecommendations({ user: req.user, interestResult: result, profile });
  let aiExplanation = null;
  let aiExplanationError = null;
  try { aiExplanation = await explainRecommendations(structuredRecommendations); } catch (error) { aiExplanationError = "AI explanation is temporarily unavailable; your calculated recommendations are still shown."; }
  res.json({ attempt, result, profile, explorationTopics, recommendations, structuredRecommendations, aiExplanation, aiExplanationError });
});
module.exports = { getQuestions, submitAssessment, getLatestAssessment };
