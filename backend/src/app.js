const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const courseRoutes = require("./routes/courseRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", userRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/roadmaps", roadmapRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/colleges", collegeRoutes);
app.use("/api/v1/deadlines", deadlineRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
