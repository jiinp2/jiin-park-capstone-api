import express from "express";
import { getLogDetails, saveLog } from "../controllers/logs-controller.js";

const router = express.Router();

// Log details
router.get("/:logId", getLogDetails);

// Saving a new log
router.post("/", saveLog);

export default router;
