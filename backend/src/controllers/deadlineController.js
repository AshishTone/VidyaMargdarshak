const Deadline = require("../models/Deadline");
const Reminder = require("../models/Reminder");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");

const listDeadlines = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.state) {
    filter.state = req.query.state;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const deadlines = await Deadline.find(filter).sort({ date: 1 });

  res.json({ deadlines });
});

const createReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.create({
    userId: req.user._id,
    deadlineId: req.body.deadlineId,
    title: req.body.title,
    remindAt: req.body.remindAt,
  });

  res.status(201).json({ reminder });
});

const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!reminder) {
    throw new ApiError(404, "Reminder not found.");
  }

  if (req.body.title !== undefined) reminder.title = req.body.title;
  if (req.body.remindAt !== undefined) reminder.remindAt = req.body.remindAt;
  if (req.body.status !== undefined) reminder.status = req.body.status;

  await reminder.save();

  res.json({ reminder });
});

module.exports = { listDeadlines, createReminder, updateReminder };
