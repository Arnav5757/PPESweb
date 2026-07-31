const mongoose = require("mongoose");

const promotionHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    fromEnrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true
    },
    toEnrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true
    },
    promotedBy: {
      type: String,
      required: true
    },
    promotionDate: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String
    }
  },
  { timestamps: true }
);

promotionHistorySchema.index({ student: 1, promotionDate: -1 });

module.exports = mongoose.model("PromotionHistory", promotionHistorySchema);
