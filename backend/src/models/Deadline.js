const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    state: String,
    district: String,
    relatedCourse: String,
    relatedCollege: String,
    reminderRule: String,
    source: {
      label: String,
      url: String,
      lastVerifiedAt: Date,
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

module.exports = mongoose.model("Deadline", deadlineSchema);
