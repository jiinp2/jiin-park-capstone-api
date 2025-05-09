import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import uploadRoutes from "./routes/upload-routes.js";
import logsRoutes from "./routes/logs-routes.js";

const app = express();
const PORT = process.env.PORT || 5050;

// CORS Middleware (MUST be placed at the top)
const allowedOrigins = [
  "http://localhost:5173",
  "https://focal-capstone.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to verify deployment and CORS header
app.get("/api/test", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send("✅ Backend test route is live");
});

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/logs", logsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
