import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "teacher" },
  bio: String,
  subjects: [String],
  qualifications: [String],
  hourlyRate: Number,
  location: String,
  latitude: Number,
  longitude: Number,
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  experience: Number,
  image: String,
});

export default mongoose.model("Teacher", teacherSchema);
