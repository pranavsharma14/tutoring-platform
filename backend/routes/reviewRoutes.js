import express from "express";
import Review from "../models/reviewModel.js"; // create if not exist
const router = express.Router();

// ✅ Get all reviews for a teacher
router.get("/:teacherId", async (req, res) => {
  try {
    const reviews = await Review.find({ teacherId: req.params.teacherId });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

export default router;
