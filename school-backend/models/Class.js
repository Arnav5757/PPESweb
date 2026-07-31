const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    description: {
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

classSchema.index({ academicYear: 1, name: 1 }, { unique: true });
classSchema.index({ academicYear: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
