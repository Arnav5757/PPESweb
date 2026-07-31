const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "student", "teacher"],
      default: "student"
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active"
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },
    teacherProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
