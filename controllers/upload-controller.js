import fs from "fs";
import path from "path";
import knex from "knex";
import knexConfig from "../knexfile.js";
import ExifParser from "exif-parser";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

const db = knex(knexConfig);

// Upload images and store metadata
export const uploadImages = async (req, res) => {
  console.log("Received files:", req.files);
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "no files uploaded" });
  }

  try {
    const logId = uuidv4();
    const insertedImages = [];

    const timestamps = insertedImages
      .map((img) => img.timestamp)
      .filter(Boolean)
      .sort((a, b) => a - b);

    let title = "Untitled log";

    // Title extracting timestamps from images
    if (timestamps.length) {
      const startDate = new Date(timestamps[0]);
      const endDate = new Date(timestamps[timestamps.length - 1]);

      const sameYear = startDate.getFullYear() === endDate.getFullYear();
      const sameMonth = startDate.getMonth() === endDate.getMonth();

      if (sameMonth) {
        title = `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
      } else if (sameYear) {
        title = `${format(startDate, "MMM d")} - ${format(
          endDate,
          "MMM d, yyyy"
        )}`;
      } else {
        title = `${format(startDate, "MMM d, yyyy")} - ${format(
          endDate,
          "MMM d, yyyy"
        )}`;
      }
    }

    for (const file of req.files) {
      const { filename, size, mimetype } = file;
      const filePath = `/uploads/${filename}`;

      // Extract metadata needed & ensure it doesn't block upload
      const buffer = await fs.promises.readFile(
        path.join(process.cwd(), "uploads", filename)
      );
      const parser = ExifParser.create(buffer);
      const metadata = parser.parse();
      console.log(
        "EXIF GPS:",
        metadata.tags?.GPSLatitude,
        metadata.tags?.GPSLongitude
      );

      const latitude = metadata.tags?.GPSLatitude ?? null;
      const longitude = metadata.tags?.GPSLongitude ?? null;
      const timestamp = metadata.tags?.DateTimeOriginal
        ? new Date(metadata.tags.DateTimeOriginal * 1000)
        : null;

      // Insert metadata into MySQL
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
