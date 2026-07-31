const SubjectAssignment = require("../models/SubjectAssignment");
const AcademicSubject = require("../models/AcademicSubject");
const Class = require("../models/Class");
const Section = require("../models/Section");
const AcademicYear = require("../models/AcademicYear");
const TeacherAssignment = require("../models/TeacherAssignment");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.subjectAssignments = inMemoryStore.subjectAssignments || [];
inMemoryStore.academicSubjects = inMemoryStore.academicSubjects || [];
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.sections = inMemoryStore.sections || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];
inMemoryStore.teacherAssignments = inMemoryStore.teacherAssignments || [];

const getSubjectAssignments = async (req, res, next) => {
  try {
    const { sortBy, sortOrder, page = 1, limit = 10, class: classFilter, section, academicYear } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
      if (academicYear) query.academicYear = academicYear;

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const total = await SubjectAssignment.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const subjectAssignments = await SubjectAssignment.find(query)
        .populate("subject class section academicYear")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, subjectAssignments, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.subjectAssignments];

      if (classFilter) list = list.filter(sa => String(sa.class) === String(classFilter));
      if (section) list = list.filter(sa => String(sa.section) === String(section));
      if (academicYear) list = list.filter(sa => String(sa.academicYear) === String(academicYear));

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
      list = list.map(sa => ({
        ...sa,
        subject: inMemoryStore.academicSubjects.find(s => String(s._id) === String(sa.subject)) || sa.subject,
        class: inMemoryStore.classes.find(c => String(c._id) === String(sa.class)) || sa.class,
        section: inMemoryStore.sections.find(s => String(s._id) === String(sa.section)) || sa.section,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(sa.academicYear)) || sa.academicYear
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, subjectAssignments: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getSubjectAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const sa = await SubjectAssignment.findById(id).populate("subject class section academicYear");
      if (!sa) return res.status(404).json({ success: false, message: "Subject Assignment not found" });
      res.json({ success: true, subjectAssignment: sa });
    } else {
      let sa = inMemoryStore.subjectAssignments.find(s => String(s._id) === String(id));
      if (!sa) return res.status(404).json({ success: false, message: "Subject Assignment not found" });
      sa = {
        ...sa,
        subject: inMemoryStore.academicSubjects.find(s => String(s._id) === String(sa.subject)) || sa.subject,
        class: inMemoryStore.classes.find(c => String(c._id) === String(sa.class)) || sa.class,
        section: inMemoryStore.sections.find(s => String(s._id) === String(sa.section)) || sa.section,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(sa.academicYear)) || sa.academicYear
      };
      res.json({ success: true, subjectAssignment: sa });
    }
  } catch (error) {
    next(error);
  }
};

const createSubjectAssignment = async (req, res, next) => {
  try {
    const data = req.body;
    let newSA;

    if (dbStatus.isMongoConnected) {
      // Validate all refs exist
      const subjectExists = await AcademicSubject.findById(data.subject);
      if (!subjectExists) return res.status(400).json({ success: false, message: "Referenced Subject does not exist" });

      const classExists = await Class.findById(data.class);
      if (!classExists) return res.status(400).json({ success: false, message: "Referenced Class does not exist" });

      if (data.section) {
        const sectionExists = await Section.findById(data.section);
        if (!sectionExists) return res.status(400).json({ success: false, message: "Referenced Section does not exist" });
      }

      const yearExists = await AcademicYear.findById(data.academicYear);
      if (!yearExists) return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });

      // Check for duplicate assignment
      const duplicateQuery = { subject: data.subject, class: data.class, academicYear: data.academicYear };
      if (data.section) duplicateQuery.section = data.section;
      const duplicate = await SubjectAssignment.findOne(duplicateQuery);
      if (duplicate) return res.status(400).json({ success: false, message: "This subject assignment already exists" });

      const sa = new SubjectAssignment(data);
      newSA = await sa.save();
    } else {
      // Validate all refs exist
      if (!inMemoryStore.academicSubjects.find(s => String(s._id) === String(data.subject))) {
        return res.status(400).json({ success: false, message: "Referenced Subject does not exist" });
      }
      if (!inMemoryStore.classes.find(c => String(c._id) === String(data.class))) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }
      if (data.section && !inMemoryStore.sections.find(s => String(s._id) === String(data.section))) {
        return res.status(400).json({ success: false, message: "Referenced Section does not exist" });
      }
      if (!inMemoryStore.academicYears.find(y => String(y._id) === String(data.academicYear))) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }

      // Check for duplicate
      const duplicate = inMemoryStore.subjectAssignments.find(sa =>
        String(sa.subject) === String(data.subject) &&
        String(sa.class) === String(data.class) &&
        String(sa.academicYear) === String(data.academicYear) &&
        (!data.section || String(sa.section) === String(data.section))
      );
      if (duplicate) return res.status(400).json({ success: false, message: "This subject assignment already exists" });

      newSA = {
        _id: "mem-sa-" + Date.now(),
        ...data,
        status: data.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.subjectAssignments.push(newSA);
    }

    await logActivity(req.user ? req.user.username : "Admin", "Created Subject Assignment", "SubjectAssignment");
    res.status(201).json({ success: true, message: "Subject Assignment created successfully ✅", subjectAssignment: newSA });
  } catch (error) {
    next(error);
  }
};

const updateSubjectAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await SubjectAssignment.findByIdAndUpdate(id, data, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Subject Assignment not found" });
    } else {
      const idx = inMemoryStore.subjectAssignments.findIndex(sa => String(sa._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Subject Assignment not found" });

      updated = {
        ...inMemoryStore.subjectAssignments[idx],
        ...data,
        updatedAt: new Date()
      };
      inMemoryStore.subjectAssignments[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", "Updated Subject Assignment", "SubjectAssignment");
    res.json({ success: true, subjectAssignment: updated });
  } catch (error) {
    next(error);
  }
};

const deleteSubjectAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      // Prevent if teacher assignments exist
      const taCount = await TeacherAssignment.countDocuments({ subjectAssignment: id });
      if (taCount > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete subject assignment with existing teacher assignments" });
      }

      const sa = await SubjectAssignment.findByIdAndUpdate(id, { status: "Inactive" }, { new: true });
      if (!sa) return res.status(404).json({ success: false, message: "Subject Assignment not found" });
    } else {
      const idx = inMemoryStore.subjectAssignments.findIndex(sa => String(sa._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Subject Assignment not found" });

      const taCount = inMemoryStore.teacherAssignments.filter(
        ta => String(ta.subjectAssignment) === String(id)
      );
      if (taCount.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete subject assignment with existing teacher assignments" });
      }

      inMemoryStore.subjectAssignments[idx].status = "Inactive";
      inMemoryStore.subjectAssignments[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", "Deactivated Subject Assignment", "SubjectAssignment");
    res.json({ success: true, message: "Subject Assignment deactivated successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjectAssignments,
  getSubjectAssignmentById,
  createSubjectAssignment,
  updateSubjectAssignment,
  deleteSubjectAssignment
};
