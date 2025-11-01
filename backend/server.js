import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "./middleware/auth.js"; // 👈 existing middleware import
import Request from "./models/Request.js"; // 👈 new model import

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["parent", "teacher"] },
});

const User = mongoose.model("User", userSchema);

// 🔹 Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Login
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Profile check
app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});


// ==============================
// 🔹 Request System Starts Here 🔹
// ==============================

// 🔹 Send Request (Parent → Teacher)
app.post("/api/requests", verifyToken, async (req, res) => {
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

// 🔹 Get Requests (Teacher → Dashboard)
app.get("/api/requests", verifyToken, async (req, res) => {
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
app.put("/api/requests/:id/accept", verifyToken, async (req, res) => {
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
app.put("/api/requests/:id/reject", verifyToken, async (req, res) => {
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


// ==============================
// 🔹 Server Start
// ==============================
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
