const mongoose = require("mongoose");

const topperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    class: {
      type: String,
      required: true
    },
    percentage: {
      type: String,
      required: true
    },
    rank: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "from-sky-400 to-blue-600"
    },
    avatarText: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topper", topperSchema);
