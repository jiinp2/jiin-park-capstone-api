import knex from "knex";
import knexConfig from "../knexfile.js";

const db = knex(knexConfig);

export const getLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;

    // Fetch log details
    const logDetails = await db("logs").where({ id: logId }).first();

    // Fetch images with logId
    const images = await db("images").where({ log_id: logId });

    res.json({ log: logDetails, images });
  } catch (error) {
    console.error("Error fetching log:", error);
    res.status(500).json({ error: "failed to fetch log details" });
  }
};
