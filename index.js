import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import uploadRoutes from "./routes/upload.js";
import metadataRoutes from "./routes/metadata.js";

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.jpin("uploads")));

// Routes
app.use("api/upload", uploadRoutes);
app.use("/api/metadata", metadataRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
