const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    link: String,
    language: String,
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    eligibleStreams: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: true,
    },
    subjects: {
      type: [String],
      default: [],
    },
    careerOutcomes: {
      type: [String],
      default: [],
    },
    exams: {
      type: [String],
      default: [],
    },
    higherStudies: {
      type: [String],
      default: [],
    },
    skillsLearned: {
      type: [String],
      default: [],
    },
    studyMaterials: {
      type: [studyMaterialSchema],
      default: [],
    },
    verifiedStatus: {
      type: String,
      enum: ["verified", "unverified"],
      default: "verified",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Course", courseSchema);
