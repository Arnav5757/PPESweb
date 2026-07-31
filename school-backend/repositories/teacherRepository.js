const Teacher = require("../models/Teacher");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

const teacherRepository = {
  async findById(id) {
    if (dbStatus.isMongoConnected) {
      return await Teacher.findById(id);
    } else {
      return inMemoryStore.teachers.find(t => String(t._id) === String(id)) || null;
    }
  },

  async findByUserId(userId) {
    if (dbStatus.isMongoConnected) {
      const user = await User.findById(userId);
      if (!user || !user.teacherProfile) return null;
      return await Teacher.findById(user.teacherProfile);
    } else {
      const user = inMemoryStore.users.find(u => String(u._id) === String(userId));
      if (!user || !user.teacherProfile) return null;
      return inMemoryStore.teachers.find(t => String(t._id) === String(user.teacherProfile)) || null;
    }
  }
};

module.exports = teacherRepository;
