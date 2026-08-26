const mongoose = require("mongoose");
const schema = new mongoose.Schema({ studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, assessmentFormId: { type: String, required: true }, targetLevel: String, language: String, status: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS" }, startedAt: Date, completedAt: Date, questionCount: Number, answeredCount: Number, unsureCount: Number, completionPercentage: Number }, { timestamps: true, versionKey: false, collection: "assessment_attempts" });
schema.index({ studentId: 1, assessmentFormId: 1 }, { unique: true });
module.exports = mongoose.model("AssessmentAttempt", schema);
