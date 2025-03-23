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

export const uploadImages = async (req, res) => {
  console.log("Received files:", req.files);

  // Handle case where no files are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  let logId = uuidv4(); // Generate a new log_id
  let existingLog = await db("logs").where({ log_id: logId }).first();
  while (existingLog) {
    logId = uuidv4(); // Ensure unique log_id
    existingLog = await db("logs").where({ log_id: logId }).first();
  }

  const insertedImages = [];
  const timestamps = [];

  try {
    // First, extract all timestamps from files
    for (const file of req.files) {
      const buffer = await fs.promises.readFile(
        path.join(process.cwd(), "uploads", file.filename)
      );

      try {
        const parser = ExifParser.create(buffer);
        const metadata = parser.parse();

        const timestamp = metadata.tags?.DateTimeOriginal
          ? new Date(metadata.tags.DateTimeOriginal * 1000)
          : null;

        if (timestamp) {
          timestamps.push(timestamp);
        }
      } catch (exifError) {
        console.warn(
          `Could not extract EXIF from ${file.filename}:`,
          exifError
        );
        // Continue even if EXIF extraction fails for a file
      }
    }

    // Now generate the title with all available timestamps
    const title = generateLogTitle(timestamps);

    // Insert the log with the proper title
    await db("logs").insert({
      log_id: logId,
      title,
      cover_image: `/uploads/${req.files[0]?.filename}`,
    });

    // Now process each file and save image data
    for (const file of req.files) {
      const { filename, size, mimetype } = file;
      const filePath = `/uploads/${filename}`;

      // Re-extract metadata for each image (or you could store it from the first pass)
      const buffer = await fs.promises.readFile(
        path.join(process.cwd(), "uploads", filename)
      );

      let latitude = null;
      let longitude = null;
      let timestamp = null;

      try {
        const parser = ExifParser.create(buffer);
        const metadata = parser.parse();

        latitude = metadata.tags?.GPSLatitude ?? null;
        longitude = metadata.tags?.GPSLongitude ?? null;
        timestamp = metadata.tags?.DateTimeOriginal
          ? new Date(metadata.tags.DateTimeOriginal * 1000)
          : null;
      } catch (exifError) {
        console.warn(`Skipping metadata for ${filename}:`, exifError);
      }

      // Insert metadata into images table
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

    // Response after successful insertion
    res.json({
      message: "Upload successful",
      logId,
      title, // Include the generated title in the response
    });
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
