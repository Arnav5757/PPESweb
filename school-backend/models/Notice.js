const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General"
    },
    content: {
      type: String,
      default: ""
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
