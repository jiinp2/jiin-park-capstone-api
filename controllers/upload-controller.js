import fs from "fs";
import path from "path";
import knex from "knex";
import knexConfig from "../knexfile.js";
import ExifParser from "exif-parser";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

const db = knex(knexConfig);

// Log title based on timestamps
const generateLogTitle = (timestamps) => {
  if (timestamps.length === 0) return "Untitled Log";

  const startDate = new Date(timestamps[0]);
  const endDate = new Date(timestamps[timestamps.length - 1]);

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${format(startDate, "MMM d, yyyy")}`;
  } else if (sameMonth) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  } else if (sameYear) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  } else {
    return `${format(startDate, "MMM d, yyyy")} - ${format(
      endDate,
      "MMM d, yyyy"
    )}`;
  }
};

// Upload images and store metadata
export const uploadImages = async (req, res) => {
  console.log("Received files:", req.files);

  // Handle case where no files are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const logId = uuidv4();
  const insertedImages = [];
  const timestamps = [];

  try {
    // Iterate through files and extract metadata
    for (const file of req.files) {
      const { filename, size, mimetype } = file;
      const filePath = `/uploads/${filename}`;

      // Extract EXIF metadata
      const buffer = await fs.promises.readFile(
        path.join(process.cwd(), "uploads", filename)
      );
      const parser = ExifParser.create(buffer);
      const metadata = parser.parse();

      const latitude = metadata.tags?.GPSLatitude ?? null;
      const longitude = metadata.tags?.GPSLongitude ?? null;
      const timestamp = metadata.tags?.DateTimeOriginal
        ? new Date(metadata.tags.DateTimeOriginal * 1000)
        : null;

      if (timestamp) {
        timestamps.push(timestamp);
      }

      // Insert metadata
      const [imageID] = await db("images").insert({
        log_id: logId,
        file_path: filePath,
        file_name: filename,
        file_size: size,
        file_type: mimetype,
        latitude,
        longitude,
        timestamp,
      });

      insertedImages.push({
        imageID,
        logId,
        filePath,
        latitude,
        longitude,
        timestamp,
      });
    }

    // Generate log title from timestamps
    const title = generateLogTitle(timestamps);

    // Insert the log entry (with the title and cover image)
    await db("logs").insert({
      log_id: logId,
      title,
      cover_image: `/uploads/${req.files[0]?.filename}`,
    });

    // Response
    res.json({ message: "Upload successful", logId });
  } catch (error) {
    console.error("Error inserting into database:", error);
    res.status(500).json({ error: "Database insertion failed" });
  }
};

// Retrieve images by logId
export const getImagesByLogId = async (req, res) => {
  const { logId } = req.params;

  try {
    const images = await db("images").where({ log_id: logId });

    if (!images.length) {
      return res.status(404).json({ error: "no images found for this log." });
    }

    res.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Database query failed" });
  }
};
