const teacherRepository = require("../../repositories/teacherRepository");

const teacherOwnership = {
  async isOwner(user, resourceId) {
    if (!user) return false;
    
    // Admins are authorized to view/edit teacher profiles
    if (user.role === "admin") {
      return true;
    }
    
    if (user.role === "teacher") {
      const teacher = await teacherRepository.findByUserId(user._id);
      if (!teacher) return false;
      return String(teacher._id) === String(resourceId);
    }
    
    return false;
  }
};

module.exports = teacherOwnership;
