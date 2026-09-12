const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["logic", "science", "commerce", "creativity", "social", "practical"],
    },
    order: {
      type: Number,
      required: true,
    },
    options: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        weights: {
          science: { type: Number, default: 0 },
          commerce: { type: Number, default: 0 },
          arts: { type: Number, default: 0 },
          vocational: { type: Number, default: 0 },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Question", questionSchema);
