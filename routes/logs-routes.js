import express from "express";
import {
  getAllLogs,
  getLogDetails,
  saveLog,
  deleteLog,
} from "../controllers/logs-controller.js";

const router = express.Router();

// Log details
router.get("/:logId", getLogDetails);

// Saving a new log
router.post("/", saveLog);

// Get logs
router.get("/", getAllLogs);

// Delete logs and images
router.delete("/:logId", deleteLog);

export default router;
