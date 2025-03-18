import express from "express";
import { getLogDetails } from "../controllers/logs-controller.js";

const router = express.Router();

router.get("/:logId", getLogDetails);

export default router;
