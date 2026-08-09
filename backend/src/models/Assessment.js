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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
