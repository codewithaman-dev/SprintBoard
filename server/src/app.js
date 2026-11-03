import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

// Attach the Socket.IO server to each request before API routes run.
app.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SprintBoard API is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }), authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
