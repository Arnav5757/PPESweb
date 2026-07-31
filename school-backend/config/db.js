const mongoose = require("mongoose");
const dbConfig = require("./database");

const dbStatus = {
  isMongoConnected: false
};

const inMemoryStore = {
  users: [],
  notices: [],
  gallery: [],
  students: [], // Stores student profile records
  academicSessions: [],
  academicYears: [],
  classes: [],
  sections: [],
  academicSubjects: [],
  subjectAssignments: [],
  teacherAssignments: [],
  enrollments: [],
  promotionHistory: [],
  admissions: [],
  teachers: [],
  attendance: [],
  fees: [],
  cms: [],
  settings: [],
  activityLogs: [],
  toppers: []
};

// Mask connection credentials in error logs
const sanitizeMongoError = (error) => {
  if (!error) return "Unknown database error";
  const msg = error.message || String(error);
  return msg.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
};

const connectDB = async () => {
  const mongoURI = dbConfig.uri;
  if (!mongoURI || mongoURI === "offline") {
    console.log("Database Mode: Offline in-memory fallback enabled 💾");
    dbStatus.isMongoConnected = false;
    return;
  }

  // Listen for connection lifecycle events
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established ✅");
    dbStatus.isMongoConnected = true;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB connection lost ⚠️. Falling back to in-memory store.");
    dbStatus.isMongoConnected = false;
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error ❌:", sanitizeMongoError(err));
    dbStatus.isMongoConnected = false;
  });

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully ✅");
    dbStatus.isMongoConnected = true;
  } catch (err) {
    console.log("MongoDB Connection Failure ❌:", sanitizeMongoError(err));
    console.log("Defaulting to high-performance in-memory database fallback.");
    dbStatus.isMongoConnected = false;
  }
};

// Graceful exit handlers
const gracefulShutdown = async (signal) => {
  console.log(`\nClosing MongoDB connections on ${signal}...`);
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed gracefully. 🛑");
  } catch (err) {
    console.error("Error during MongoDB disconnection:", err.message);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = {
  connectDB,
  dbStatus,
  inMemoryStore
};
