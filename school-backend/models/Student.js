const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      unique: true,
      required: true
    },
    rollNumber: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    bloodGroup: {
      type: String,
      required: true
    },
    aadhaarNumber: {
      type: String
    },
    category: {
      type: String,
      required: true
    },
    religion: {
      type: String
    },
    photo: {
      type: String // base64 encoded photo
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    academicYear: {
      type: String,
      required: true
    },
    class: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    house: {
      type: String
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "pending", "approved", "rejected"],
      default: "Active"
    },

    // Parent details
    fatherName: {
      type: String,
      required: true
    },
    motherName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternateContact: {
      type: String
    },
    parentEmail: {
      type: String
    },
    occupation: {
      type: String
    },
    address: {
      type: String,
      required: true
    },

    // Academic indicators
    attendance: {
      type: Number,
      default: 85
    },
    results: [
      {
        subject: { type: String, required: true },
        marks: { type: Number, required: true },
        maxMarks: { type: Number, required: true }
      }
    ],
    assignments: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: String, required: true },
        status: { type: String, enum: ["assigned", "submitted", "graded"], default: "assigned" },
        grade: { type: String, default: "" }
      }
    ]
  },
  { timestamps: true }
);

// Pre-validate hook to compute full name and auto-generate admission number
studentSchema.pre("validate", function () {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }

  if (!this.admissionNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.admissionNumber = `ADM-${year}-${rand}`;
  }
});

// Virtual age computed from dob
studentSchema.virtual("age").get(function () {
  if (!this.dob) return 16;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

const Student = mongoose.model("Student", studentSchema, "admissions");
const Admission = mongoose.model("Admission", studentSchema, "admissions");

module.exports = {
  Student,
  Admission
};
