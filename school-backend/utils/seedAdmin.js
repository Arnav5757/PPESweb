const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const defaultPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !defaultPassword) {
    console.warn("⚠️ Warning: ADMIN_EMAIL or ADMIN_PASSWORD is not set. Skipping administrator seeding.");
    return;
  }

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
        console.log(`Seeded Administrator Account in MongoDB: ${adminEmail} 🔑`);
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
        console.log(`Seeded Administrator Account in Memory: ${adminEmail} 🔑`);
      }
    }
  } catch (err) {
    console.error("Error seeding administrator account:", err);
  }
};

module.exports = seedAdmin;
