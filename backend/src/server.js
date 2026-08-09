const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { seedDatabase } = require("./utils/seedData");
const { startReminderJob } = require("./jobs/reminderJob");

async function startServer() {
  try {
    console.log(`[Server] Connecting to MongoDB...`);
    await connectDatabase();

    console.log(`[Server] Seeding database...`);
    await seedDatabase();

    console.log(`[Server] Starting reminder background job...`);
    startReminderJob();

    const server = app.listen(env.port, () => {
      console.log(`[Server] API running successfully on http://localhost:${env.port}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`[Server] Port ${env.port} is already in use. Please check other running applications.`);
      } else {
        console.error(`[Server] Server error:`, err);
      }
    });
  } catch (error) {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

