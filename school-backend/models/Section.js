const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
    },
    capacity: {
      type: Number,
      default: 40
    },
    roomNumber: {
      type: String
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

sectionSchema.index({ class: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);
