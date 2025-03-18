import fs from "fs";
import knex from "knex";
import knexConfig from "../knexfile.js";
import ExifParser from "exif-parser";

const db = knex(knexConfig);

export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "no files uploaded" });
  }

  try {
    const insertedImages = [];

    for (const file of req.files) {
      const { filename, size, mimetype } = file;
      const filePath = `./uploads/${filename}`;

      // Extract metadata needed
      const buffer = fs.readFileSync(`./uploads/${filename}`);
      const parser = ExifParser.create(buffer);
      const metadata = parser.parse();

      const latitude = metadata.tags.GPSLatitude || null;
      const longitude = metadata.tags.GPSLongitude || null;
      const timestamp = metadata.tags.DateTimeOriginal
        ? new Date(metadata.tags.DateTimeOriginal * 1000)
        : null;

      // Insert metadata into MySQL
      const [imageID] = await db("images").insert({
        file_path: filePath,
        file_name: filename,
        file_size: size,
        file_type: mimetype,
        latitude,
        longitude,
        timestamp,
      });

      insertedImages.push({
        id: imageID,
        filePath,
        latitude,
        longitude,
        timestamp,
      });
    }
    res.json({ message: "Upload successful", images: insertedImages });
  } catch (error) {
    console.error("Error inserting into database:", error);
    res.status(500).json({ error: "Database insertion failed" });
  }
};
