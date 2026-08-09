const express = require("express");
const {
  listDeadlines,
  createReminder,
  updateReminder,
} = require("../controllers/deadlineController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/", listDeadlines);
router.post("/reminders", authenticate, createReminder);
router.patch("/reminders/:id", authenticate, updateReminder);

module.exports = router;
