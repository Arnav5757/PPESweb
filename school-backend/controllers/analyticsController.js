const { Student } = require("../models/Student");
const Notice = require("../models/Notice");
const Gallery = require("../models/Gallery");
const { dbStatus, inMemoryStore } = require("../config/db");

const getAnalytics = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const totalStudents = await Student.countDocuments();
      const approvedAdmissions = await Student.countDocuments({
        status: { $in: ["approved", "Active"] }
      });
      const pendingAdmissions = await Student.countDocuments({
        status: { $in: ["pending", "Inactive", "rejected"] }
      });
      const totalNotices = await Notice.countDocuments();
      const totalGalleryItems = await Gallery.countDocuments();

      res.json({
        totalStudents,
        approvedAdmissions,
        pendingAdmissions,
        totalNotices,
        totalGalleryItems
      });
    } else {
      const totalStudents = inMemoryStore.students.length;
      const approvedAdmissions = inMemoryStore.students.filter(
        s => s.status === "approved" || s.status === "Active"
      ).length;
      const pendingAdmissions = inMemoryStore.students.filter(
        s => s.status === "pending" || s.status === "Inactive" || s.status === "rejected"
      ).length;
      const totalNotices = inMemoryStore.notices.length;
      const totalGalleryItems = inMemoryStore.gallery.length;

      res.json({
        totalStudents,
        approvedAdmissions,
        pendingAdmissions,
        totalNotices,
        totalGalleryItems
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};
