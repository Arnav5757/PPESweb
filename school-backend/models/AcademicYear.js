const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active"
    }
  },
  { timestamps: true }
);

// Only one document can have isActive: true
academicYearSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Each year name is unique within a session
academicYearSchema.index({ session: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
