const mongoose = require("mongoose");

const roadmapEdgeSchema = new mongoose.Schema(
  {
    edgeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    label: String,
    pathTags: {
      type: [String],
      default: [],
    },
    visibleIn: {
      type: [String],
      default: ["public"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("RoadmapEdge", roadmapEdgeSchema);
