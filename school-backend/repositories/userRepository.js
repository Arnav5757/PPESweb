const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

const userRepository = {
  async findById(id) {
    if (dbStatus.isMongoConnected) {
      return await User.findById(id);
    } else {
      return inMemoryStore.users.find(u => String(u._id) === String(id)) || null;
    }
  },

  async findByEmail(email) {
    const queryEmail = String(email).toLowerCase();
    if (dbStatus.isMongoConnected) {
      return await User.findOne({ email: queryEmail });
    } else {
      return inMemoryStore.users.find(u => String(u.email).toLowerCase() === queryEmail) || null;
    }
  },

  async findByEmailOrUsername(emailOrUsername) {
    const queryStr = String(emailOrUsername).toLowerCase();
    if (dbStatus.isMongoConnected) {
      return await User.findOne({
        $or: [
          { email: queryStr },
          { username: emailOrUsername }
        ]
      });
    } else {
      return inMemoryStore.users.find(u => 
        String(u.email).toLowerCase() === queryStr || 
        String(u.username).toLowerCase() === queryStr
      ) || null;
    }
  },

  async exists(id) {
    if (dbStatus.isMongoConnected) {
      const count = await User.countDocuments({ _id: id });
      return count > 0;
    } else {
      return inMemoryStore.users.some(u => String(u._id) === String(id));
    }
  },

  async updateStatus(id, status) {
    if (dbStatus.isMongoConnected) {
      return await User.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      const idx = inMemoryStore.users.findIndex(u => String(u._id) === String(id));
      if (idx !== -1) {
        inMemoryStore.users[idx].status = status;
        return inMemoryStore.users[idx];
      }
      return null;
    }
  }
};

module.exports = userRepository;
