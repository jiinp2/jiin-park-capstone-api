import express from "express";
import fs from "fs";
import path from "path";
import ExifParser from "exif-parser";
import sharp from "sharp";

const router = express.Router();

// API route for metadata
router.post("/", async (req, res) => {
  const { imagePaths } = req.body;

  if (!imagePaths || imagePaths.length === 0) {
    return res.status(400).json({ error: "No image paths provided" });
  }

  // Extract metadata, array to store

  try {
    const metadataArray = [];

    for (const imagePath of imagePaths) {
      const filePath = path.join(process.cwd(), imagePath);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      // Convert heic to jpeg before processing
      let convertedPath = filePath;
      if (filePath.endsWith(".HEIC") || filePath.endsWith(".heif")) {
        convertedPath = filePath.replace(/\.\w+$/, ".jpg");
        await sharp(filePath).toFormat("jpeg").toFile(convertedPath);
      }

      // Reading and parsing image file
      const buffer = fs.readFileSync(convertedPath);
      const parser = ExifParser.create(buffer);
      const metadata = parser.parse();

      // Push metadata to array
      metadataArray.push({
        originalPath: imagePath,
        processedPath: convertedPath,
        metadata: metadata.tags,
      });
    }
    // Send metadata to front-end
    res.json({ metadata: metadataArray });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    res.status(500).json({ error: "Failed to extract metadata" });
  }
});

export default router;
