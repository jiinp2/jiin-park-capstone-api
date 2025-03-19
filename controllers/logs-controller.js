import knex from "knex";
import knexConfig from "../knexfile.js";

const db = knex(knexConfig);

export const getLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;
    console.log("Received logId:", logId);

    if (!logId) {
      return res.status(400).json({ error: "logId is missing" });
    }

    // Fetch log details
    const logDetails = await db("images").where({ log_id: logId }).first();
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
