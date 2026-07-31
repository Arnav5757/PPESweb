const ActivityLog = require("../models/ActivityLog");
const { dbStatus, inMemoryStore } = require("../config/db");

const logActivity = async (username, action, affectedResource) => {
  try {
    const logData = {
      user: username || "System",
      action,
      affectedResource,
      timestamp: new Date()
    };

    if (dbStatus.isMongoConnected) {
      const log = new ActivityLog(logData);
      await log.save();
    } else {
      inMemoryStore.activityLogs = inMemoryStore.activityLogs || [];
      inMemoryStore.activityLogs.push({
        _id: "mem-log-" + Date.now() + Math.floor(Math.random() * 1000),
        ...logData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`[AUDIT LOG]: ${username} -> ${action} (${affectedResource})`);
  } catch (err) {
    console.error("Error logging activity audit log:", err);
  }
};

module.exports = {
  logActivity
};
