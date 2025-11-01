import express from "express";
import Request from "../models/Request.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Send Request (Parent → Teacher)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { teacherId, message } = req.body;
    if (req.user.role !== "parent")
      return res.status(403).json({ error: "Only parents can send requests" });

    const newReq = await Request.create({
      parentId: req.user.id,
      teacherId,
      message,
    });

    res.json({ message: "Request sent successfully", request: newReq });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Get Requests (Teacher → Their Dashboard)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ error: "Only teachers can view requests" });

    const requests = await Request.find({ teacherId: req.user.id })
      .populate("parentId", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Accept Request
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ error: "Only teachers can update requests" });

    const updated = await Request.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      { status: "accepted" },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Reject Request
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ error: "Only teachers can update requests" });

    const updated = await Request.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      { status: "rejected" },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
