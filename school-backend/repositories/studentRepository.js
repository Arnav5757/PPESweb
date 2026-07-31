const { Student } = require("../models/Student");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

const studentRepository = {
  async findById(id) {
    if (dbStatus.isMongoConnected) {
      return await Student.findById(id);
    } else {
      return inMemoryStore.students.find(s => String(s._id) === String(id)) || null;
    }
  },

  async findByUserId(userId) {
    if (dbStatus.isMongoConnected) {
      const user = await User.findById(userId);
      if (!user || !user.studentProfile) return null;
      return await Student.findById(user.studentProfile);
    } else {
      const user = inMemoryStore.users.find(u => String(u._id) === String(userId));
      if (!user || !user.studentProfile) return null;
      return inMemoryStore.students.find(s => String(s._id) === String(user.studentProfile)) || null;
    }
  }
};

module.exports = studentRepository;
