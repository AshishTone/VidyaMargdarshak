const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  version: Number,
  questionId: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
  active: { type: Boolean, default: true },
  order: Number,
  section: String,
  text: { en: String, mr: String },
  questionType: String,
  required: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  options: [{ value: String, label: { en: String, mr: String } }],
}, { timestamps: true, versionKey: false, collection: "assessment_student_profile_questions" });

module.exports = mongoose.model("AssessmentStudentProfileQuestion", schema);
