const studentRepository = require("../../repositories/studentRepository");

const studentOwnership = {
  async isOwner(user, resourceId) {
    if (!user) return false;
    
    // Admins and teachers are authorized to view/access student profiles
    if (user.role === "admin" || user.role === "teacher") {
      return true;
    }
    
    if (user.role === "student") {
      const student = await studentRepository.findByUserId(user._id);
      if (!student) return false;
      return String(student._id) === String(resourceId);
    }
    
    return false;
  }
};

module.exports = studentOwnership;
