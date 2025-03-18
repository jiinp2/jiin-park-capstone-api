import express from "express";
import fs from "fs";
import path from "path";
import ExifParser from "exif-parser";

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

      // Reading and parsing image file
      const buffer = fs.readFileSync(filePath);
      const parser = ExifParser.create(buffer);
      const metadata = parser.parse();

      // Store metadata
      metadataArray.push({
        imagePath,
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
