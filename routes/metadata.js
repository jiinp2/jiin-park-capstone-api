import express from "express";
import fs from "fs";
import path from "path";
import ExifParser from "exif-parser";

const router = express.Router();

router.post("/", async (req, res) => {
  const { imagePaths } = req.body;

  if (!imagePaths || imagePaths.length === 0) {
    return res.status(400).json({ error: "No image paths provided" });
  }
});

export default router;
