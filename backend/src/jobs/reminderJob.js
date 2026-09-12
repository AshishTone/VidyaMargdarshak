const cron = require("node-cron");
const Reminder = require("../models/Reminder");

function startReminderJob() {
  cron.schedule("*/30 * * * *", async () => {
    const upcomingReminders = await Reminder.find({
      status: "active",
      remindAt: { $lte: new Date(Date.now() + 30 * 60 * 1000) },
    }).limit(5);

    if (upcomingReminders.length) {
      console.log(`Reminder job found ${upcomingReminders.length} upcoming reminders.`);
    }
  });
}

module.exports = { startReminderJob };
