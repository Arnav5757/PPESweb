const mongoose = require("mongoose");

const academicSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isCurrent: {
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

// Only one document can have isCurrent: true
academicSessionSchema.index(
  { isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true } }
);

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
