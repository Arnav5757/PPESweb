const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
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
    rollNumber: {
      type: String
    },
    admissionNumber: {
      type: String
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Withdrawn"],
      default: "Active"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    remarks: {
      type: String
    }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, academicYear: 1 }, { unique: true });
enrollmentSchema.index({ class: 1, section: 1, academicYear: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
