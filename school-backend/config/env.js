const dotenv = require("dotenv");
const path = require("path");

// Load the environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Maintain backward compatibility for MONGO_URI
if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

const requiredEnv = ["MONGODB_URI", "JWT_SECRET", "PORT", "CLIENT_URL"];

const missingEnv = [];
requiredEnv.forEach((key) => {
  if (!process.env[key] || process.env[key].trim() === "") {
    missingEnv.push(key);
  }
});

if (missingEnv.length > 0) {
  console.error("\n=======================================================");
  console.error("❌ CRITICAL CONFIGURATION ERROR: Missing Required environment variables");
  console.error("=======================================================");
  missingEnv.forEach((key) => {
    console.error(`   👉  ${key} is missing or empty!`);
  });
  console.error("=======================================================");
  console.error("Please configure these variables in your .env file.");
  console.error("Refer to .env.example for configuration details.");
  console.error("Exiting process immediately to prevent runtime errors.\n");
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT, 10),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || "development"
};
