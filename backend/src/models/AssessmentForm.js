const mongoose = require("mongoose");

const assessmentFormSchema = new mongoose.Schema({
  formId: { type: String, unique: true },
  targetLevel: String,
  version: Number,
  questionCount: Number,
  questions: [{ questionId: mongoose.Schema.Types.Mixed, category: String, order: Number, text: { en: String, mr: String } }],
  questionsPerCategory: mongoose.Schema.Types.Mixed,
  questionIds: [mongoose.Schema.Types.Mixed],
  responseScale: mongoose.Schema.Types.Mixed,
  scoring: mongoose.Schema.Types.Mixed,
  status: String,
}, { timestamps: true, versionKey: false, collection: "assessment_forms" });

module.exports = mongoose.model("AssessmentForm", assessmentFormSchema);
