const mongoose = require("mongoose");

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    subjectAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectAssignment",
      required: true
    },
    workload: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

teacherAssignmentSchema.index({ teacher: 1, subjectAssignment: 1 }, { unique: true });

module.exports = mongoose.model("TeacherAssignment", teacherAssignmentSchema);
