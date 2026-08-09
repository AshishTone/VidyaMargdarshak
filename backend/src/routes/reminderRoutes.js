const express = require("express");
const { createReminder, updateReminder } = require("../controllers/deadlineController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post("/", authenticate, createReminder);
router.patch("/:id", authenticate, updateReminder);

module.exports = router;
