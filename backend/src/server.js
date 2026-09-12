const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { seedDatabase } = require("./utils/seedData");
const { startReminderJob } = require("./jobs/reminderJob");

async function startServer() {
  await connectDatabase();
  await seedDatabase();
  startReminderJob();

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
