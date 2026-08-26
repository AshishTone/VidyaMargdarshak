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
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["female", "male"],
    },
    tenthBoard: {
      type: String,
      trim: true,
    },
    tenthSchool: {
      type: String,
      trim: true,
    },
    tenthPassingYear: Number,
    tenthPassingDate: Date,
    tenthOverallPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    subjectMarks: {
      mathematics: { type: Number, min: 0, max: 100 },
      science: { type: Number, min: 0, max: 100 },
      english: { type: Number, min: 0, max: 100 },
      socialScience: { type: Number, min: 0, max: 100 },
    },
    twelfthBoard: { type: String, trim: true },
    twelfthSchool: { type: String, trim: true },
    twelfthPassingDate: Date,
    twelfthStream: { type: String, enum: ["PCM", "PCB"] },
    twelfthOverallPercentage: { type: Number, min: 0, max: 100 },
    twelfthSubjectMarks: {
      physics: { type: Number, min: 0, max: 100 },
      chemistry: { type: Number, min: 0, max: 100 },
      mathematics: { type: Number, min: 0, max: 100 },
      biology: { type: Number, min: 0, max: 100 },
    },
    location: {
      state: String,
      district: String,
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
    resultStatus: {
      type: String,
      enum: ["DECLARED", "NOT_DECLARED"],
      default: "DECLARED",
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
