require("dotenv").config();

const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const testRoutes = require("./routes/testRoutes");
const presentationRoutes = require("./routes/presentationRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CampusPlan API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/timetable", timetableRoutes);

app.use((error, req, res, next) => {
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ success: false, message: "Frontend origin is not allowed." });
  }
  console.error("Server error:", error);
  return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
});

app.listen(port, () => {
  console.log(`CampusPlan API listening on http://localhost:${port}`);
});
