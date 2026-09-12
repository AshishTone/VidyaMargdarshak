const mongoose = require("mongoose");

const careerRoadmapSchema = new mongoose.Schema(
  {
    metadata: {
      graphId: { type: String, required: true, index: true },
      title: { type: String, required: true },
      version: { type: String },
      lastUpdated: { type: String },
      country: { type: String },
      purpose: { type: String },
      scope: { type: String },
      importantNote: { type: String },
      reactFlowCompatible: { type: Boolean, default: true },
      rootNodeId: { type: String },
      nodeCount: { type: Number },
      edgeCount: { type: Number },
      sourceFiles: [{ type: String }],
      streamGateways: [{ type: String }],
      nodeTypes: [{ type: String }],
      edgeRelations: [{ type: String }],
      courseDirectoryReference: { type: mongoose.Schema.Types.Mixed },
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
        },
        data: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        type: { type: String, default: "smoothstep" },
        animated: { type: Boolean, default: false },
        data: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    collection: "career_roadmaps_10th",
    timestamps: true,
  }
);

module.exports = mongoose.model("CareerRoadmap10th", careerRoadmapSchema);
