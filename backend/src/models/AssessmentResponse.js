const mongoose = require("mongoose");
const schema = new mongoose.Schema({ attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentAttempt", required: true, index: true }, questionId: mongoose.Schema.Types.Mixed, categoryId: String, responseValue: Number, responseValues: [String], uncertaintyFlag: Boolean, responseType: { type: String, enum: ["INTEREST", "PROFILE"] }, answeredAt: Date }, { timestamps: true, versionKey: false, collection: "assessment_responses" });
schema.index({ attemptId: 1, questionId: 1, responseType: 1 }, { unique: true });
module.exports = mongoose.model("AssessmentResponse", schema);
