import express from "express";
import multer from "multer";
import path from "path";
import { uploadImages } from "../controllers/upload-controller.js";
import { getImagesByLogId } from "../controllers/upload-controller.js";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

// Multer upload
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, and WebP images are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

// Upload route
router.post("/", upload.array("images", 8), uploadImages);

// Fetch images for a specific log
router.get("/:logId", getImagesByLogId);

export default router;
