const mongoose = require("mongoose");

const subjectAssignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSubject",
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    weeklyHours: {
      type: Number,
      default: 0
    },
    isElective: {
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

subjectAssignmentSchema.index(
  { subject: 1, class: 1, section: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("SubjectAssignment", subjectAssignmentSchema);
