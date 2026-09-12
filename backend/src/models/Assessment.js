const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizType: {
      type: String,
      default: "aptitude-interest",
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        optionValue: {
          type: String,
          required: true,
        },
      },
    ],
    scoreProfile: {
      science: { type: Number, default: 0 },
      commerce: { type: Number, default: 0 },
      arts: { type: Number, default: 0 },
      vocational: { type: Number, default: 0 },
    },
    suggestedStreams: {
      type: [String],
      default: [],
    },
    suggestedCareers: {
      type: [String],
      default: [],
    },
    explanation: {
      type: [String],
      default: [],
    },
    formId: { type: String, default: "AFTER10_V1" },
    interestResponses: [{ questionId: String, category: String, value: Number, isUnsure: Boolean }],
    profileResponses: [{ questionId: String, values: [String] }],
    interestProfile: [{ category: String, interestScore: Number, unsureCount: Number, uncertaintyRate: Number, needsExploration: Boolean }],
    preferenceProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    pathways: [{ name: String, match: String, explanation: String }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
