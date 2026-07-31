const Topper = require("../models/Topper");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

inMemoryStore.toppers = inMemoryStore.toppers || [];

const getToppers = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const toppers = await Topper.find().sort({ createdAt: 1 });
      res.json(toppers);
    } else {
      res.json(inMemoryStore.toppers);
    }
  } catch (error) {
    next(error);
  }
};

const createTopper = async (req, res, next) => {
  try {
    const topperData = { ...req.body };

    // Calculate initials if not provided
    if (!topperData.avatarText && topperData.name) {
      topperData.avatarText = topperData.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3);
    }

    let savedTopper;
    if (dbStatus.isMongoConnected) {
      const topper = new Topper(topperData);
      savedTopper = await topper.save();
    } else {
      savedTopper = {
        _id: "mem-tpr-" + Date.now(),
        ...topperData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.toppers.push(savedTopper);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Topper entry: ${savedTopper.name}`, "Topper");
    res.status(201).json({ success: true, message: "Topper added successfully ✅", topper: savedTopper });
  } catch (error) {
    next(error);
  }
};

const updateTopper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topperData = { ...req.body };

    if (topperData.name) {
      topperData.avatarText = topperData.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3);
    }

    let updatedTopper;
    if (dbStatus.isMongoConnected) {
      updatedTopper = await Topper.findByIdAndUpdate(id, topperData, { new: true });
      if (!updatedTopper) return res.status(404).json({ success: false, message: "Topper not found" });
    } else {
      const idx = inMemoryStore.toppers.findIndex(t => String(t._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Topper not found" });

      updatedTopper = {
        ...inMemoryStore.toppers[idx],
        ...topperData,
        updatedAt: new Date()
      };
      inMemoryStore.toppers[idx] = updatedTopper;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Topper details: ${updatedTopper.name}`, "Topper");
    res.json({ success: true, message: "Topper updated successfully ✅", topper: updatedTopper });
  } catch (error) {
    next(error);
  }
};

const deleteTopper = async (req, res, next) => {
  try {
    const { id } = req.params;
    let topperName = "Unknown";

    if (dbStatus.isMongoConnected) {
      const topper = await Topper.findByIdAndDelete(id);
      if (!topper) return res.status(404).json({ success: false, message: "Topper not found" });
      topperName = topper.name;
    } else {
      const idx = inMemoryStore.toppers.findIndex(t => String(t._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Topper not found" });

      topperName = inMemoryStore.toppers[idx].name;
      inMemoryStore.toppers = inMemoryStore.toppers.filter(t => String(t._id) !== String(id));
    }

    await logActivity(req.user ? req.user.username : "Admin", `Deleted Topper: ${topperName}`, "Topper");
    res.json({ success: true, message: "Topper deleted successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getToppers,
  createTopper,
  updateTopper,
  deleteTopper
};
