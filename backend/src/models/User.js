const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "counselor", "admin"],
      default: "student",
    },
    classLevel: {
      type: String,
      enum: ["10", "12", "graduate"],
      default: "10",
    },
    board: {
      type: String,
      trim: true,
    },
    location: {
      state: String,
      city: String,
    },
    language: {
      type: String,
      default: "English",
    },
    currentMarks: {
      type: Number,
      min: 0,
      max: 100,
    },
    interests: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    savedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    savedColleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
