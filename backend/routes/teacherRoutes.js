import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

// ✅ Teacher Schema
const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "teacher" },
  bio: String,
  subjects: [String],
  qualifications: [String],
  hourlyRate: Number,
  experience: Number,
  location: String,
  image: String,
});

const Teacher = mongoose.model("Teacher", teacherSchema);

// ✅ Middleware: Verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ✅ Get Teacher Profile
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("-password");
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Teacher Profile
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: "Unauthorized update" });

    const updates = req.body;
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json({ message: "Profile updated successfully", teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
