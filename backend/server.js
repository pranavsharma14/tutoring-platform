// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ Missing MONGO_URI or JWT_SECRET in .env");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors());

// ===== DATABASE CONNECTION =====
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ===== MODELS =====
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ["parent", "teacher"], required: true },
    avatar: String,
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const teacherSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    bio: { type: String, default: "" },
    subjects: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    location: { type: String, default: "" },
    image: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Teacher = mongoose.model("Teacher", teacherSchema);

const reviewSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);
const Review = mongoose.model("Review", reviewSchema);

// ===== HELPERS =====
function makeUserSafe(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    id: u._id?.toString ? u._id.toString() : u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || null,
  };
}

// ===== MIDDLEWARE =====
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ===== AUTH ROUTES =====
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    if (role === "teacher") {
      await Teacher.create({ name, email });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user: makeUserSafe(user) });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: makeUserSafe(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TEACHER ROUTES =====

// ✅ List all teachers (for search page)
app.get("/api/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find().lean();
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Public single teacher (for View Profile)
app.get("/api/public/teacher/:id", async (req, res) => {
  try {
    const t = await Teacher.findById(req.params.id).lean();
    if (!t) return res.status(404).json({ error: "Teacher not found" });
    t.id = t._id;
    t.subjects = t.subjects || [];
    t.qualifications = t.qualifications || [];
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== REVIEWS =====
app.get("/api/reviews/:teacherId", async (req, res) => {
  try {
    const reviews = await Review.find({ teacherId: req.params.teacherId })
      .populate("parentId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
