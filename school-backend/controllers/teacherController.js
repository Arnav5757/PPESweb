const Teacher = require("../models/Teacher");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory array is ready
inMemoryStore.teachers = inMemoryStore.teachers || [];

const getTeachers = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.name = 1;
      }

      const total = await Teacher.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const teachers = await Teacher.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, teachers, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.teachers];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(t => t.name && t.name.toLowerCase().includes(sLower));
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

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, teachers: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const teacher = await Teacher.findById(id);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      res.json(teacher);
    } else {
      const teacher = inMemoryStore.teachers.find(t => String(t._id) === String(id));
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      res.json(teacher);
    }
  } catch (error) {
    next(error);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const teacherData = req.body;
    const { name, email, phone, qualification } = teacherData;

    // 1. Validate required fields
    if (!name || !email || !phone || !qualification) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Name, email, phone, and qualification are required."
      });
    }

    // 2. Check for duplicate email
    if (dbStatus.isMongoConnected) {
      const emailExists = await Teacher.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "A teacher with this email address is already registered."
        });
      }
    } else {
      const emailExists = inMemoryStore.teachers.find(
        t => t.email.toLowerCase() === email.toLowerCase()
      );
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "A teacher with this email address is already registered."
        });
      }
    }

    let newTeacher;

    if (dbStatus.isMongoConnected) {
      const teacher = new Teacher({
        ...teacherData,
        email: email.toLowerCase()
      });
      newTeacher = await teacher.save();
    } else {
      newTeacher = {
        _id: "mem-t-" + Date.now(),
        ...teacherData,
        email: email.toLowerCase(),
        joinDate: teacherData.joinDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.teachers.push(newTeacher);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Teacher: ${newTeacher.name}`, "Teacher");
    res.status(201).json({ success: true, message: "Teacher saved successfully ✅", teacher: newTeacher });
  } catch (error) {
    next(error);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherData = req.body;
    const { email } = teacherData;

    // 1. Check for duplicate email on update
    if (email) {
      if (dbStatus.isMongoConnected) {
        const emailExists = await Teacher.findOne({ 
          email: email.toLowerCase(), 
          _id: { $ne: id } 
        });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Another teacher is already registered with this email address."
          });
        }
      } else {
        const emailExists = inMemoryStore.teachers.find(
          t => t.email.toLowerCase() === email.toLowerCase() && String(t._id) !== String(id)
        );
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Another teacher is already registered with this email address."
          });
        }
      }
    }

    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Teacher.findByIdAndUpdate(
        id, 
        { 
          ...teacherData, 
          ...(email && { email: email.toLowerCase() }) 
        }, 
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: "Teacher not found" });
    } else {
      const idx = inMemoryStore.teachers.findIndex(t => String(t._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Teacher not found" });

      updated = {
        ...inMemoryStore.teachers[idx],
        ...teacherData,
        ...(email && { email: email.toLowerCase() }),
        updatedAt: new Date()
      };
      inMemoryStore.teachers[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Teacher details: ${updated.name}`, "Teacher");
    res.json({ success: true, teacher: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    let teacherName = "Unknown";

    if (dbStatus.isMongoConnected) {
      const teacher = await Teacher.findByIdAndDelete(id);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      teacherName = teacher.name;
    } else {
      const idx = inMemoryStore.teachers.findIndex(t => String(t._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Teacher not found" });

      teacherName = inMemoryStore.teachers[idx].name;
      inMemoryStore.teachers = inMemoryStore.teachers.filter(t => String(t._id) !== String(id));
    }

    await logActivity(req.user ? req.user.username : "Admin", `Deleted Teacher record: ${teacherName}`, "Teacher");
    res.json({ success: true, message: "Teacher record deleted successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
