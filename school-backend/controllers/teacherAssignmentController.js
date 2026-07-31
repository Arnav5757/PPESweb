const TeacherAssignment = require("../models/TeacherAssignment");
const Teacher = require("../models/Teacher");
const SubjectAssignment = require("../models/SubjectAssignment");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.teacherAssignments = inMemoryStore.teacherAssignments || [];
inMemoryStore.teachers = inMemoryStore.teachers || [];
inMemoryStore.subjectAssignments = inMemoryStore.subjectAssignments || [];

const getTeacherAssignments = async (req, res, next) => {
  try {
    const { sortBy, sortOrder, page = 1, limit = 10, teacher, subjectAssignment } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (teacher) query.teacher = teacher;
      if (subjectAssignment) query.subjectAssignment = subjectAssignment;

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const total = await TeacherAssignment.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const teacherAssignments = await TeacherAssignment.find(query)
        .populate("teacher subjectAssignment")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, teacherAssignments, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.teacherAssignments];

      if (teacher) list = list.filter(ta => String(ta.teacher) === String(teacher));
      if (subjectAssignment) list = list.filter(ta => String(ta.subjectAssignment) === String(subjectAssignment));

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
      list = list.map(ta => ({
        ...ta,
        teacher: inMemoryStore.teachers.find(t => String(t._id) === String(ta.teacher)) || ta.teacher,
        subjectAssignment: inMemoryStore.subjectAssignments.find(sa => String(sa._id) === String(ta.subjectAssignment)) || ta.subjectAssignment
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, teacherAssignments: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getTeacherAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const ta = await TeacherAssignment.findById(id).populate("teacher subjectAssignment");
      if (!ta) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });
      res.json({ success: true, teacherAssignment: ta });
    } else {
      let ta = inMemoryStore.teacherAssignments.find(t => String(t._id) === String(id));
      if (!ta) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });
      ta = {
        ...ta,
        teacher: inMemoryStore.teachers.find(t => String(t._id) === String(ta.teacher)) || ta.teacher,
        subjectAssignment: inMemoryStore.subjectAssignments.find(sa => String(sa._id) === String(ta.subjectAssignment)) || ta.subjectAssignment
      };
      res.json({ success: true, teacherAssignment: ta });
    }
  } catch (error) {
    next(error);
  }
};

const createTeacherAssignment = async (req, res, next) => {
  try {
    const data = req.body;
    let newTA;

    if (dbStatus.isMongoConnected) {
      // Validate teacher exists
      const teacherExists = await Teacher.findById(data.teacher);
      if (!teacherExists) return res.status(400).json({ success: false, message: "Referenced Teacher does not exist" });

      // Validate subjectAssignment exists
      const saExists = await SubjectAssignment.findById(data.subjectAssignment);
      if (!saExists) return res.status(400).json({ success: false, message: "Referenced Subject Assignment does not exist" });

      // Check for duplicate
      const duplicate = await TeacherAssignment.findOne({ teacher: data.teacher, subjectAssignment: data.subjectAssignment });
      if (duplicate) return res.status(400).json({ success: false, message: "This teacher assignment already exists" });

      const ta = new TeacherAssignment(data);
      newTA = await ta.save();
    } else {
      if (!inMemoryStore.teachers.find(t => String(t._id) === String(data.teacher))) {
        return res.status(400).json({ success: false, message: "Referenced Teacher does not exist" });
      }
      if (!inMemoryStore.subjectAssignments.find(sa => String(sa._id) === String(data.subjectAssignment))) {
        return res.status(400).json({ success: false, message: "Referenced Subject Assignment does not exist" });
      }

      const duplicate = inMemoryStore.teacherAssignments.find(ta =>
        String(ta.teacher) === String(data.teacher) &&
        String(ta.subjectAssignment) === String(data.subjectAssignment)
      );
      if (duplicate) return res.status(400).json({ success: false, message: "This teacher assignment already exists" });

      newTA = {
        _id: "mem-ta-" + Date.now(),
        ...data,
        status: data.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.teacherAssignments.push(newTA);
    }

    await logActivity(req.user ? req.user.username : "Admin", "Created Teacher Assignment", "TeacherAssignment");
    res.status(201).json({ success: true, message: "Teacher Assignment created successfully ✅", teacherAssignment: newTA });
  } catch (error) {
    next(error);
  }
};

const updateTeacherAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await TeacherAssignment.findByIdAndUpdate(id, data, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });
    } else {
      const idx = inMemoryStore.teacherAssignments.findIndex(ta => String(ta._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });

      updated = {
        ...inMemoryStore.teacherAssignments[idx],
        ...data,
        updatedAt: new Date()
      };
      inMemoryStore.teacherAssignments[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", "Updated Teacher Assignment", "TeacherAssignment");
    res.json({ success: true, teacherAssignment: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTeacherAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const ta = await TeacherAssignment.findByIdAndDelete(id);
      if (!ta) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });
    } else {
      const idx = inMemoryStore.teacherAssignments.findIndex(ta => String(ta._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Teacher Assignment not found" });
      inMemoryStore.teacherAssignments.splice(idx, 1);
    }

    await logActivity(req.user ? req.user.username : "Admin", "Deleted Teacher Assignment", "TeacherAssignment");
    res.json({ success: true, message: "Teacher Assignment deleted successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherAssignments,
  getTeacherAssignmentById,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment
};
