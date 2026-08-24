import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import registerHandler from "../api/auth/register.js";
import loginHandler from "../api/auth/login.js";
import materialsHandler from "../api/materials/index.js";
import materialByIdHandler from "../api/materials/[id].js";
import uploadMaterialHandler from "../api/materials/upload.js";
import generateLessonHandler from "../api/lessons/generate.js";
import lessonByIdHandler from "../api/lessons/[id].js";
import progressHandler from "../api/progress/index.js";
import generateQuizHandler from "../api/quiz/generate.js";
import submitQuizHandler from "../api/quiz/submit.js";
import tutorHandler from "../api/tutor/ask.js";

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND_URL supports one or more comma-separated origins, e.g.
// "https://learnify-ai.vercel.app,https://learnify.app". Trailing slashes
// are stripped because "https://site.com/" !== "https://site.com" as far
// as the browser's Origin header / CORS matching is concerned — a trailing
// slash left in the env var is a very common cause of registration/login
// silently failing in production with no visible error beyond "Network
// Error" in the browser console.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    "⚠️  FRONTEND_URL is not set — allowing all origins (*). " +
      "Set FRONTEND_URL in your environment to your deployed frontend URL " +
      "(e.g. https://your-app.vercel.app) to restrict this in production."
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, server-to-server, health checks)
      // which have no Origin header at all.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic health checks
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Learnify AI Backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Learnify AI API is working",
  });
});

// Adapter for the existing Vercel-style handlers.
// The same handlers can therefore run on Render/Express.
const runHandler = (handler, mapQuery) => async (req, res, next) => {
  try {
    if (mapQuery) mapQuery(req);
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

// Authentication
app.all("/api/auth/register", runHandler(registerHandler));
app.all("/api/auth/login", runHandler(loginHandler));

// Materials
app.all("/api/materials", runHandler(materialsHandler));
app.all(
  "/api/materials/upload",
  runHandler(uploadMaterialHandler)
);
app.all(
  "/api/materials/:id",
  runHandler(materialByIdHandler, (req) => {
    req.query.id = req.params.id;
  })
);

// Lessons
app.all(
  "/api/lessons/generate",
  runHandler(generateLessonHandler)
);
app.all(
  "/api/lessons/:id",
  runHandler(lessonByIdHandler, (req) => {
    req.query.id = req.params.id;
  })
);

// Progress
app.all("/api/progress", runHandler(progressHandler));

// Quiz
app.all(
  "/api/quiz/generate",
  runHandler(generateQuizHandler)
);
app.all("/api/quiz/submit", runHandler(submitQuizHandler));

// AI Tutor
app.all("/api/tutor/ask", runHandler(tutorHandler));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect MongoDB before accepting requests.
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not configured. Set it in Render → Environment."
      );
    }
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not configured. Set it in Render → Environment " +
          "(any long random string works)."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Learnify AI backend running on port ${PORT}`);
      console.log(`🔗 Health: /api/health`);
      console.log(
        allowedOrigins.length
          ? `🔒 CORS allowed origins: ${allowedOrigins.join(", ")}`
          : "🔓 CORS allowing all origins (FRONTEND_URL not set)"
      );
    });
  } catch (error) {
    console.error("❌ Failed to start Learnify AI backend:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();

export default app;
