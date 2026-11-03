import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters.");
}

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((value) => value.trim());

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});
app.set("io", io);

io.on("connection", (socket) => {
  socket.on("project:join", (projectId) => {
    if (typeof projectId === "string" && /^[a-f\d]{24}$/i.test(projectId)) {
      socket.join(`project:${projectId}`);
    }
  });
  socket.on("project:leave", (projectId) => {
    if (typeof projectId === "string") socket.leave(`project:${projectId}`);
  });
});

async function start() {
  await connectDatabase();
  server.listen(port, () => {
    console.log(`SprintBoard API listening on http://localhost:${port}`);
  });
}

async function shutdown() {
  console.log("Shutting down SprintBoard...");
  io.close();
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
