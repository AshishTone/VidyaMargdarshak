const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
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
    location: {
      state: String,
      city: String,
      address: String,
      lat: Number,
      lng: Number,
    },
    type: {
      type: String,
      default: "Private",
    },
    mediumOfInstruction: {
      type: [String],
      default: ["English"],
    },
    coursesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    facilities: {
      type: [String],
      default: [],
    },
    hostel: {
      type: Boolean,
      default: false,
    },
    library: {
      type: Boolean,
      default: true,
    },
    lab: {
      type: Boolean,
      default: true,
    },
    internet: {
      type: Boolean,
      default: true,
    },
    feesRange: {
      type: String,
      default: "",
    },
    cutoffInfo: {
      type: String,
      default: "",
    },
    contact: {
      website: String,
      phone: String,
      email: String,
    },
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

module.exports = mongoose.model("College", collegeSchema);
