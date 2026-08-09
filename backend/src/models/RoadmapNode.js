const mongoose = require("mongoose");

const roadmapNodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["stage", "stream", "course", "exam", "career", "milestone"],
    },
    depth: {
      type: Number,
      default: 0,
    },
    stage: String,
    summary: String,
    duration: String,
    fees: String,
    requiredStream: String,
    entranceExams: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    careerOptions: {
      type: [String],
      default: [],
    },
    visibleIn: {
      type: [String],
      default: ["public"],
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("RoadmapNode", roadmapNodeSchema);
