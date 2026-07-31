const ActivityLog = require("../models/ActivityLog");
const { dbStatus, inMemoryStore } = require("../config/db");

inMemoryStore.activityLogs = inMemoryStore.activityLogs || [];

const getActivityLogs = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
      res.json({ success: true, logs });
    } else {
      const sorted = [...inMemoryStore.activityLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json({ success: true, logs: sorted.slice(0, 100) });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs
};
