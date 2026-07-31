const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

const seedAdmin = async () => {
  const adminEmail = "admin@pareek.edu";
  const defaultPassword = "admin123";

  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    if (dbStatus.isMongoConnected) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const newAdmin = new User({
          name: "Director Rupesh",
          email: adminEmail,
          password: hashedPassword,
          role: "admin"
        });
        await newAdmin.save();
        console.log("Seeded Administrator Account in MongoDB: admin@pareek.edu / admin123 🔑");
      }
    } else {
      const adminExists = inMemoryStore.users.find(u => u.email === adminEmail);
      if (!adminExists) {
        inMemoryStore.users.push({
          _id: "mem-admin",
          name: "Director Rupesh",
          email: adminEmail,
          password: hashedPassword,
          role: "admin"
        });
        console.log("Seeded Administrator Account in Memory: admin@pareek.edu / admin123 🔑");
      }
    }
  } catch (err) {
    console.error("Error seeding administrator account:", err);
  }
};

module.exports = seedAdmin;
