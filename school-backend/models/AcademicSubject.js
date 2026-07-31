const mongoose = require("mongoose");

const academicSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    description: {
      type: String
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

academicSubjectSchema.index({ class: 1, code: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model("AcademicSubject", academicSubjectSchema);
