const Settings = require("../models/Settings");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

inMemoryStore.settings = inMemoryStore.settings || null;

const defaultSettings = {
  schoolName: "Pareek Public English School",
  logo: "",
  address: "Maruti Nagar, Ralayata-Guradiya road, Mandsaur, M.P. - 458002",
  phone: "+91 9926677011",
  email: "admissions@pareek.edu",
  academicYear: "2025-2026",
  classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  sections: ["A", "B", "C"],
  smtp: { host: "", port: 587, user: "", pass: "" }
};

const getSettings = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(defaultSettings);
        await settings.save();
      }
      res.json({ success: true, settings });
    } else {
      if (!inMemoryStore.settings) {
        inMemoryStore.settings = { _id: "mem-settings-1", ...defaultSettings };
      }
      res.json({ success: true, settings: inMemoryStore.settings });
    }
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      const existing = await Settings.findOne();
      if (existing) {
        Object.assign(existing, settingsData);
        updated = await existing.save();
      } else {
        const settings = new Settings({ ...defaultSettings, ...settingsData });
        updated = await settings.save();
      }
    } else {
      if (!inMemoryStore.settings) {
        inMemoryStore.settings = { _id: "mem-settings-1", ...defaultSettings };
      }
      Object.assign(inMemoryStore.settings, settingsData, { updatedAt: new Date() });
      updated = inMemoryStore.settings;
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      "Modified global settings preferences",
      "Settings"
    );

    res.json({ success: true, settings: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
