import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import uploadRoutes from "./routes/upload-routes.js";
import logsRoutes from "./routes/logs-routes.js";

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://focal-capstone.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statically uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/logs", logsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
