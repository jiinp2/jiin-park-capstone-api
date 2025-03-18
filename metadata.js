import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Metadata extraction not implemented yet" });
});

export default router;
