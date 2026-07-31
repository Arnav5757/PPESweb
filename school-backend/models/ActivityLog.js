const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: String, // Username or Name of administrator
      required: true
    },
    action: {
      type: String, // Description of operation, e.g. "Admission Approved: ADM-2026-1029"
      required: true
    },
    affectedResource: {
      type: String, // E.g., "Student", "Teacher", "CMS", "Notice"
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema, "activity_logs");
