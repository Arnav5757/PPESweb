const Class = require("../models/Class");
const AcademicYear = require("../models/AcademicYear");
const Section = require("../models/Section");
const AcademicSubject = require("../models/AcademicSubject");
const Enrollment = require("../models/Enrollment");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];
inMemoryStore.sections = inMemoryStore.sections || [];
inMemoryStore.academicSubjects = inMemoryStore.academicSubjects || [];
inMemoryStore.enrollments = inMemoryStore.enrollments || [];

const getClasses = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10, academicYear } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      if (academicYear) {
        query.academicYear = academicYear;
      }

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.name = 1;
      }

      const total = await Class.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const classes = await Class.find(query)
        .populate("academicYear")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, classes, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.classes];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(c => c.name && c.name.toLowerCase().includes(sLower));
      }
      if (academicYear) {
        list = list.filter(c => String(c.academicYear) === String(academicYear));
      }

      if (sortBy) {
        list.sort((a, b) => {
          const valA = a[sortBy] || "";
          const valB = b[sortBy] || "";
          if (sortOrder === "desc") {
            return valB.toString().localeCompare(valA.toString());
          }
          return valA.toString().localeCompare(valB.toString());
        });
      } else {
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      }

      // Populate academicYear
      list = list.map(c => ({
        ...c,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(c.academicYear)) || c.academicYear
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, classes: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const cls = await Class.findById(id).populate("academicYear");
      if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
      res.json({ success: true, class: cls });
    } else {
      let cls = inMemoryStore.classes.find(c => String(c._id) === String(id));
      if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
      cls = {
        ...cls,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(cls.academicYear)) || cls.academicYear
      };
      res.json({ success: true, class: cls });
    }
  } catch (error) {
    next(error);
  }
};

const getClassSections = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const sections = await Section.find({ class: id }).populate("classTeacher");
      res.json({ success: true, sections });
    } else {
      let sections = inMemoryStore.sections.filter(s => String(s.class) === String(id));
      // Populate classTeacher if teachers store exists
      if (inMemoryStore.teachers) {
        sections = sections.map(s => ({
          ...s,
          classTeacher: inMemoryStore.teachers.find(t => String(t._id) === String(s.classTeacher)) || s.classTeacher
        }));
      }
      res.json({ success: true, sections });
    }
  } catch (error) {
    next(error);
  }
};

const getClassSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const subjects = await AcademicSubject.find({ class: id });
      res.json({ success: true, subjects });
    } else {
      const subjects = inMemoryStore.academicSubjects.filter(s => String(s.class) === String(id));
      res.json({ success: true, subjects });
    }
  } catch (error) {
    next(error);
  }
};

const getClassEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const enrollments = await Enrollment.find({ class: id }).populate("student section academicYear");
      res.json({ success: true, enrollments });
    } else {
      let enrollments = inMemoryStore.enrollments.filter(e => String(e.class) === String(id));
      // Populate student, section, academicYear
      enrollments = enrollments.map(e => ({
        ...e,
        student: (inMemoryStore.students || []).find(st => String(st._id) === String(e.student)) || e.student,
        section: inMemoryStore.sections.find(s => String(s._id) === String(e.section)) || e.section,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(e.academicYear)) || e.academicYear
      }));
      res.json({ success: true, enrollments });
    }
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const classData = req.body;
    let newClass;

    if (dbStatus.isMongoConnected) {
      // Validate academicYear exists
      const yearExists = await AcademicYear.findById(classData.academicYear);
      if (!yearExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }

      // Check unique name per academic year
      const duplicate = await Class.findOne({ name: classData.name, academicYear: classData.academicYear });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "A class with this name already exists for the selected academic year" });
      }

      const cls = new Class(classData);
      newClass = await cls.save();
    } else {
      const yearExists = inMemoryStore.academicYears.find(y => String(y._id) === String(classData.academicYear));
      if (!yearExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }

      const duplicate = inMemoryStore.classes.find(
        c => c.name === classData.name && String(c.academicYear) === String(classData.academicYear)
      );
      if (duplicate) {
        return res.status(400).json({ success: false, message: "A class with this name already exists for the selected academic year" });
      }

      newClass = {
        _id: "mem-cl-" + Date.now(),
        ...classData,
        status: classData.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.classes.push(newClass);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Class: ${newClass.name}`, "Class");
    res.status(201).json({ success: true, message: "Class created successfully ✅", class: newClass });
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Class.findByIdAndUpdate(id, classData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Class not found" });
    } else {
      const idx = inMemoryStore.classes.findIndex(c => String(c._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Class not found" });

      updated = {
        ...inMemoryStore.classes[idx],
        ...classData,
        updatedAt: new Date()
      };
      inMemoryStore.classes[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Class: ${updated.name}`, "Class");
    res.json({ success: true, class: updated });
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    let className = "Unknown";

    if (dbStatus.isMongoConnected) {
      // Prevent if active sections exist
      const activeSections = await Section.countDocuments({ class: id, status: "Active" });
      if (activeSections > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete class with active sections" });
      }

      const cls = await Class.findByIdAndUpdate(id, { status: "Inactive" }, { new: true });
      if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
      className = cls.name;
    } else {
      const idx = inMemoryStore.classes.findIndex(c => String(c._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Class not found" });

      const activeSections = inMemoryStore.sections.filter(
        s => String(s.class) === String(id) && s.status === "Active"
      );
      if (activeSections.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete class with active sections" });
      }

      className = inMemoryStore.classes[idx].name;
      inMemoryStore.classes[idx].status = "Inactive";
      inMemoryStore.classes[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Soft-deleted Class: ${className}`, "Class");
    res.json({ success: true, message: "Class deactivated successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  getClassSections,
  getClassSubjects,
  getClassEnrollments,
  createClass,
  updateClass,
  deleteClass
};
