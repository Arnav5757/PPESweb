const CMS = require("../models/CMS");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

inMemoryStore.cms = inMemoryStore.cms || [];

const getCMS = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const items = await CMS.find();
      const cmsMap = {};
      items.forEach(item => {
        cmsMap[item.key] = item.value;
      });
      res.json({ success: true, cms: cmsMap });
    } else {
      const cmsMap = {};
      inMemoryStore.cms.forEach(item => {
        cmsMap[item.key] = item.value;
      });
      res.json({ success: true, cms: cmsMap });
    }
  } catch (error) {
    next(error);
  }
};

const saveCMS = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: "CMS key is required" });

    let updatedItem;

    if (dbStatus.isMongoConnected) {
      updatedItem = await CMS.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
    } else {
      const idx = inMemoryStore.cms.findIndex(item => item.key === key);
      if (idx !== -1) {
        inMemoryStore.cms[idx].value = value;
        updatedItem = inMemoryStore.cms[idx];
      } else {
        updatedItem = {
          _id: "mem-cms-" + Date.now(),
          key,
          value,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryStore.cms.push(updatedItem);
      }
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Edited Website CMS key: ${key}`,
      "CMS"
    );

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCMS,
  saveCMS
};
