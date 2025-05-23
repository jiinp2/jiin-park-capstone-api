import { v4 as uuidv4 } from "uuid";
import knex from "knex";
import knexConfig from "../knexfile.js";

const db = knex(knexConfig);

// Log details
export const getLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;
    console.log("Received logId:", logId);

    if (!logId) {
      return res.status(400).json({ error: "logId is missing" });
    }

    // Fetch log details
    const logDetails = await db("logs").where({ log_id: logId }).first();
    console.log("Fetched logDetails:", logDetails);

    // Fetch images with logId
    const images = await db("images").where({ log_id: logId });
    console.log("Fetched images:", images);

    res.json({ log: logDetails, images });
  } catch (error) {
    console.error("Error fetching log:", error);
    res.status(500).json({ error: "failed to fetch log details" });
  }
};

// Save log
export const saveLog = async (req, res) => {
  const { logId, title, coverImagePath } = req.body;

  try {
    // Check if log already exists
    const existingLog = await db("logs").where({ log_id: logId }).first();

    if (existingLog) {
      // Update existing log
      await db("logs").where({ log_id: logId }).update({
        title,
        cover_image: coverImagePath,
      });

      res.json({ message: "Log updated successfully", logId });
    } else {
      // Create new log
      await db("logs").insert({
        log_id: logId,
        title,
        cover_image: coverImagePath,
      });

      res.json({ message: "Log created successfully", logId });
    }
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ error: "Failed to save log" });
  }
};

// Get logs
export const getAllLogs = async (req, res) => {
  try {
    const logs = await db("logs").select("*");
    if (!logs.length) {
      return res.status(404).json({ error: "No logs found" });
    }

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Database query failed" });
  }
};

// Delete log & photos
export const deleteLog = async (req, res) => {
  const { logId } = req.params;

  try {
    // Delete images
    await db("images").where({ log_id: logId }).del();
    // Delete log
    await db("logs").where({ log_id: logId }).del();

    res.status(200).json({ message: "Log and images deleted" });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ error: "Failed to delete log" });
  }
};
