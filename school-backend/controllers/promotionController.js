const PromotionHistory = require("../models/PromotionHistory");
const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
const Section = require("../models/Section");
const AcademicYear = require("../models/AcademicYear");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.promotionHistory = inMemoryStore.promotionHistory || [];
inMemoryStore.enrollments = inMemoryStore.enrollments || [];
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.sections = inMemoryStore.sections || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];

const getPromotions = async (req, res, next) => {
  try {
    const { sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const total = await PromotionHistory.countDocuments();
      const pages = Math.ceil(total / limitNum);
      const promotions = await PromotionHistory.find()
        .populate("student fromEnrollment toEnrollment fromClass toClass fromSection toSection fromAcademicYear toAcademicYear")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, promotions, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.promotionHistory];

      if (sortBy) {
        list.sort((a, b) => {
          const valA = a[sortBy] || "";
          const valB = b[sortBy] || "";
          if (sortOrder === "desc") {
            return valB.toString().localeCompare(valA.toString());
          }
          return valA.toString().localeCompare(valB.toString());
        });
      }

      // Populate references
      list = list.map(p => ({
        ...p,
        student: (inMemoryStore.students || []).find(s => String(s._id) === String(p.student)) || p.student,
        fromEnrollment: inMemoryStore.enrollments.find(e => String(e._id) === String(p.fromEnrollment)) || p.fromEnrollment,
        toEnrollment: inMemoryStore.enrollments.find(e => String(e._id) === String(p.toEnrollment)) || p.toEnrollment,
        fromClass: inMemoryStore.classes.find(c => String(c._id) === String(p.fromClass)) || p.fromClass,
        toClass: inMemoryStore.classes.find(c => String(c._id) === String(p.toClass)) || p.toClass,
        fromSection: inMemoryStore.sections.find(s => String(s._id) === String(p.fromSection)) || p.fromSection,
        toSection: inMemoryStore.sections.find(s => String(s._id) === String(p.toSection)) || p.toSection,
        fromAcademicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(p.fromAcademicYear)) || p.fromAcademicYear,
        toAcademicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(p.toAcademicYear)) || p.toAcademicYear
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, promotions: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getStudentPromotionHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (dbStatus.isMongoConnected) {
      const promotions = await PromotionHistory.find({ student: studentId })
        .populate("fromEnrollment toEnrollment fromClass toClass fromSection toSection fromAcademicYear toAcademicYear")
        .sort({ createdAt: -1 });
      res.json({ success: true, promotions });
    } else {
      let promotions = inMemoryStore.promotionHistory
        .filter(p => String(p.student) === String(studentId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      promotions = promotions.map(p => ({
        ...p,
        fromEnrollment: inMemoryStore.enrollments.find(e => String(e._id) === String(p.fromEnrollment)) || p.fromEnrollment,
        toEnrollment: inMemoryStore.enrollments.find(e => String(e._id) === String(p.toEnrollment)) || p.toEnrollment,
        fromClass: inMemoryStore.classes.find(c => String(c._id) === String(p.fromClass)) || p.fromClass,
        toClass: inMemoryStore.classes.find(c => String(c._id) === String(p.toClass)) || p.toClass,
        fromSection: inMemoryStore.sections.find(s => String(s._id) === String(p.fromSection)) || p.fromSection,
        toSection: inMemoryStore.sections.find(s => String(s._id) === String(p.toSection)) || p.toSection,
        fromAcademicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(p.fromAcademicYear)) || p.fromAcademicYear,
        toAcademicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(p.toAcademicYear)) || p.toAcademicYear
      }));

      res.json({ success: true, promotions });
    }
  } catch (error) {
    next(error);
  }
};

const promoteStudent = async (req, res, next) => {
  try {
    const { studentId, toClassId, toSectionId, toAcademicYearId, rollNumber, remarks } = req.body;
    let newEnrollment, promotionRecord;

    if (dbStatus.isMongoConnected) {
      // 1. Find current active enrollment for student
      const currentEnrollment = await Enrollment.findOne({ student: studentId, status: "Active" });
      if (!currentEnrollment) {
        return res.status(400).json({ success: false, message: "No active enrollment found for this student" });
      }

      // Validate target refs exist
      const toClass = await Class.findById(toClassId);
      if (!toClass) return res.status(400).json({ success: false, message: "Target Class does not exist" });

      if (toSectionId) {
        const toSection = await Section.findById(toSectionId);
        if (!toSection) return res.status(400).json({ success: false, message: "Target Section does not exist" });
      }

      const toYear = await AcademicYear.findById(toAcademicYearId);
      if (!toYear) return res.status(400).json({ success: false, message: "Target Academic Year does not exist" });

      // 2. Set current enrollment status to 'Completed', set endDate
      currentEnrollment.status = "Completed";
      currentEnrollment.endDate = new Date();
      await currentEnrollment.save();

      // 3. Create new enrollment with new class/section/academicYear
      const enrollment = new Enrollment({
        student: studentId,
        class: toClassId,
        section: toSectionId,
        academicYear: toAcademicYearId,
        rollNumber: rollNumber,
        status: "Active",
        startDate: new Date()
      });
      newEnrollment = await enrollment.save();

      // 4. Create PromotionHistory record linking old and new enrollment
      const promotion = new PromotionHistory({
        student: studentId,
        fromEnrollment: currentEnrollment._id,
        toEnrollment: newEnrollment._id,
        fromClass: currentEnrollment.class,
        toClass: toClassId,
        fromSection: currentEnrollment.section,
        toSection: toSectionId,
        fromAcademicYear: currentEnrollment.academicYear,
        toAcademicYear: toAcademicYearId,
        rollNumber: rollNumber,
        remarks: remarks,
        promotionDate: new Date()
      });
      promotionRecord = await promotion.save();
    } else {
      // 1. Find current active enrollment
      const currentIdx = inMemoryStore.enrollments.findIndex(
        e => String(e.student) === String(studentId) && e.status === "Active"
      );
      if (currentIdx === -1) {
        return res.status(400).json({ success: false, message: "No active enrollment found for this student" });
      }

      // Validate target refs
      if (!inMemoryStore.classes.find(c => String(c._id) === String(toClassId))) {
        return res.status(400).json({ success: false, message: "Target Class does not exist" });
      }
      if (toSectionId && !inMemoryStore.sections.find(s => String(s._id) === String(toSectionId))) {
        return res.status(400).json({ success: false, message: "Target Section does not exist" });
      }
      if (!inMemoryStore.academicYears.find(y => String(y._id) === String(toAcademicYearId))) {
        return res.status(400).json({ success: false, message: "Target Academic Year does not exist" });
      }

      const currentEnrollment = inMemoryStore.enrollments[currentIdx];

      // 2. Complete current enrollment
      inMemoryStore.enrollments[currentIdx].status = "Completed";
      inMemoryStore.enrollments[currentIdx].endDate = new Date();
      inMemoryStore.enrollments[currentIdx].updatedAt = new Date();

      // 3. Create new enrollment
      newEnrollment = {
        _id: "mem-enr-" + Date.now(),
        student: studentId,
        class: toClassId,
        section: toSectionId,
        academicYear: toAcademicYearId,
        rollNumber: rollNumber,
        status: "Active",
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.enrollments.push(newEnrollment);

      // 4. Create PromotionHistory record
      promotionRecord = {
        _id: "mem-ph-" + Date.now(),
        student: studentId,
        fromEnrollment: currentEnrollment._id,
        toEnrollment: newEnrollment._id,
        fromClass: currentEnrollment.class,
        toClass: toClassId,
        fromSection: currentEnrollment.section,
        toSection: toSectionId,
        fromAcademicYear: currentEnrollment.academicYear,
        toAcademicYear: toAcademicYearId,
        rollNumber: rollNumber,
        remarks: remarks,
        promotionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.promotionHistory.push(promotionRecord);
    }

    // 5. Log activity
    await logActivity(req.user ? req.user.username : "Admin", `Promoted student: ${studentId}`, "Promotion");

    // 6. Return the new enrollment and promotion history
    res.status(201).json({
      success: true,
      message: "Student promoted successfully ✅",
      enrollment: newEnrollment,
      promotionHistory: promotionRecord
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPromotions,
  getStudentPromotionHistory,
  promoteStudent
};
