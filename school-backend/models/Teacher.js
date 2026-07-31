const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    qualification: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true,
      default: 0
    },
    photo: {
      type: String // base64 encoded photo or image URL
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    subjects: [
      {
        type: String
      }
    ],
    classes: [
      {
        type: String
      }
    ],
    salary: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
