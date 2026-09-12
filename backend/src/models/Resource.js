const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    courseMapping: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    description: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
