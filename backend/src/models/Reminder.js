const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deadlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deadline",
    },
    title: {
      type: String,
      required: true,
    },
    remindAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "done"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Reminder", reminderSchema);
