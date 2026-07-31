const Enrollment = require("../models/Enrollment");
const AcademicYear = require("../models/AcademicYear");
const Class = require("../models/Class");
const Section = require("../models/Section");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.enrollments = inMemoryStore.enrollments || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.sections = inMemoryStore.sections || [];

const getEnrollments = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10, class: classFilter, section, academicYear, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
      if (academicYear) query.academicYear = academicYear;
      if (status) query.status = status;

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      // If search is provided, we need to find matching students first
      if (search) {
        const Student = require("../models/Student");
        const matchingStudents = await Student.find({ name: { $regex: search, $options: "i" } }).select("_id");
        query.student = { $in: matchingStudents.map(s => s._id) };
      }

      const total = await Enrollment.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const enrollments = await Enrollment.find(query)
        .populate("student academicYear class section")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, enrollments, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.enrollments];

      if (classFilter) list = list.filter(e => String(e.class) === String(classFilter));
      if (section) list = list.filter(e => String(e.section) === String(section));
      if (academicYear) list = list.filter(e => String(e.academicYear) === String(academicYear));
      if (status) list = list.filter(e => e.status === status);

      if (search) {
        const sLower = search.toLowerCase();
        const students = (inMemoryStore.students || []);
        const matchingStudentIds = students
          .filter(s => s.name && s.name.toLowerCase().includes(sLower))
          .map(s => String(s._id));
        list = list.filter(e => matchingStudentIds.includes(String(e.student)));
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
      }

      // Populate references
      list = list.map(e => ({
        ...e,
        student: (inMemoryStore.students || []).find(s => String(s._id) === String(e.student)) || e.student,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(e.academicYear)) || e.academicYear,
        class: inMemoryStore.classes.find(c => String(c._id) === String(e.class)) || e.class,
        section: inMemoryStore.sections.find(s => String(s._id) === String(e.section)) || e.section
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, enrollments: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const enrollment = await Enrollment.findById(id).populate("student academicYear class section");
      if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
      res.json({ success: true, enrollment });
    } else {
      let enrollment = inMemoryStore.enrollments.find(e => String(e._id) === String(id));
      if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
      enrollment = {
        ...enrollment,
        student: (inMemoryStore.students || []).find(s => String(s._id) === String(enrollment.student)) || enrollment.student,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(enrollment.academicYear)) || enrollment.academicYear,
        class: inMemoryStore.classes.find(c => String(c._id) === String(enrollment.class)) || enrollment.class,
        section: inMemoryStore.sections.find(s => String(s._id) === String(enrollment.section)) || enrollment.section
      };
      res.json({ success: true, enrollment });
    }
  } catch (error) {
    next(error);
  }
};

const getStudentEnrollmentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (dbStatus.isMongoConnected) {
      const enrollments = await Enrollment.find({ student: studentId })
        .populate("academicYear class section")
        .sort({ startDate: -1 });
      res.json({ success: true, enrollments });
    } else {
      let enrollments = inMemoryStore.enrollments
        .filter(e => String(e.student) === String(studentId))
        .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));

      enrollments = enrollments.map(e => ({
        ...e,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(e.academicYear)) || e.academicYear,
        class: inMemoryStore.classes.find(c => String(c._id) === String(e.class)) || e.class,
        section: inMemoryStore.sections.find(s => String(s._id) === String(e.section)) || e.section
      }));

      res.json({ success: true, enrollments });
    }
  } catch (error) {
    next(error);
  }
};

const createEnrollment = async (req, res, next) => {
  try {
    const data = req.body;
    let newEnrollment;

    if (dbStatus.isMongoConnected) {
      // Validate refs exist
      const yearExists = await AcademicYear.findById(data.academicYear);
      if (!yearExists) return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });

      const classExists = await Class.findById(data.class);
      if (!classExists) return res.status(400).json({ success: false, message: "Referenced Class does not exist" });

      if (data.section) {
        const sectionExists = await Section.findById(data.section);
        if (!sectionExists) return res.status(400).json({ success: false, message: "Referenced Section does not exist" });
      }

      // Check for duplicate student+academicYear
      const duplicate = await Enrollment.findOne({ student: data.student, academicYear: data.academicYear, status: "Active" });
      if (duplicate) return res.status(400).json({ success: false, message: "Student is already enrolled for this academic year" });

      const enrollment = new Enrollment(data);
      newEnrollment = await enrollment.save();
    } else {
      if (!inMemoryStore.academicYears.find(y => String(y._id) === String(data.academicYear))) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }
      if (!inMemoryStore.classes.find(c => String(c._id) === String(data.class))) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }
      if (data.section && !inMemoryStore.sections.find(s => String(s._id) === String(data.section))) {
        return res.status(400).json({ success: false, message: "Referenced Section does not exist" });
      }

      const duplicate = inMemoryStore.enrollments.find(e =>
        String(e.student) === String(data.student) &&
        String(e.academicYear) === String(data.academicYear) &&
        e.status === "Active"
      );
      if (duplicate) return res.status(400).json({ success: false, message: "Student is already enrolled for this academic year" });

      newEnrollment = {
        _id: "mem-enr-" + Date.now(),
        ...data,
        status: data.status || "Active",
        startDate: data.startDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.enrollments.push(newEnrollment);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Enrollment for student: ${data.student}`, "Enrollment");
    res.status(201).json({ success: true, message: "Enrollment created successfully ✅", enrollment: newEnrollment });
  } catch (error) {
    next(error);
  }
};

const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Enrollment.findByIdAndUpdate(id, data, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Enrollment not found" });
    } else {
      const idx = inMemoryStore.enrollments.findIndex(e => String(e._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Enrollment not found" });

      updated = {
        ...inMemoryStore.enrollments[idx],
        ...data,
        updatedAt: new Date()
      };
      inMemoryStore.enrollments[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Enrollment: ${id}`, "Enrollment");
    res.json({ success: true, enrollment: updated });
  } catch (error) {
    next(error);
  }
};

const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const enrollment = await Enrollment.findByIdAndUpdate(id, { status: "Withdrawn" }, { new: true });
      if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    } else {
      const idx = inMemoryStore.enrollments.findIndex(e => String(e._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Enrollment not found" });

      inMemoryStore.enrollments[idx].status = "Withdrawn";
      inMemoryStore.enrollments[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Withdrew Enrollment: ${id}`, "Enrollment");
    res.json({ success: true, message: "Enrollment withdrawn successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnrollments,
  getEnrollmentById,
  getStudentEnrollmentHistory,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
};
