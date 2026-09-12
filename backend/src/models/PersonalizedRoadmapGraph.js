const mongoose = require("mongoose");

const personalizedRoadmapGraphSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentAttempt",
    },
    title: { type: String, default: "Personalized Career Roadmap" },
    summary: { type: String, default: "" },
    topInterests: [{ type: String }],
    topCourses: [{ type: String }],
    mermaidChart: { type: String },
    graph: { type: mongoose.Schema.Types.Mixed },
    generatedBy: { type: String, default: "gemini-2.5-flash" },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "personalized_roadmap_graphs",
  }
);

module.exports = mongoose.model(
  "PersonalizedRoadmapGraph",
  personalizedRoadmapGraphSchema
);
