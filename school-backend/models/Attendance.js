const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    class: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Late"],
          required: true,
          default: "Present"
        }
      }
    ]
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance logs for same class, section, and date
attendanceSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
