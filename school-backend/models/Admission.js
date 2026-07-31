const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    // Application tracking
    applicationNumber: {
      type: String,
      unique: true
    },

    // Applicant info (minimal — what a parent would provide)
    studentName: {
      type: String,
      required: true
    },
    desiredGrade: {
      type: String,
      required: true
    },
    age: {
      type: Number
    },
    email: {
      type: String,
      required: true
    },
    parentName: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    previousSchool: {
      type: String
    },
    remarks: {
      type: String
    },

    // Workflow status
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "enrolled"],
      default: "pending"
    },

    // Admin notes (filled during review)
    adminRemarks: {
      type: String
    },
    reviewedBy: {
      type: String
    },
    reviewedAt: {
      type: Date
    },

    // Link to created student record (populated after approval & enrollment)
    studentRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  },
  { timestamps: true }
);

// Auto-generate application number
admissionSchema.pre("validate", function () {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.applicationNumber = `APP-${year}-${rand}`;
  }
});

// Indexes
admissionSchema.index({ status: 1 });
admissionSchema.index({ email: 1 });

module.exports = mongoose.model("AdmissionApplication", admissionSchema, "admission_applications");
