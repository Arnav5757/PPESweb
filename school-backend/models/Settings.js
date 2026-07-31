const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      default: "Pareek Public English School"
    },
    logo: {
      type: String // base64 logo
    },
    address: {
      type: String,
      default: "Maruti Nagar, Ralayata-Guradiya road, Mandsaur, M.P. - 458002"
    },
    phone: {
      type: String,
      default: "+91 9926677011"
    },
    email: {
      type: String,
      default: "admissions@pareek.edu"
    },
    academicYear: {
      type: String,
      default: "2025-2026"
    },
    classes: [
      {
        type: String
      }
    ],
    sections: [
      {
        type: String
      }
    ],
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      user: { type: String, default: "" },
      pass: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema, "settings");
