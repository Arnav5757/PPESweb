const bcrypt = require("bcryptjs");
const { Student } = require("../models/Student");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");

// Helper to auto-generate admission number for in-memory fallback
const generateInMemoryAdmissionNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ADM-${year}-${rand}`;
};

// GET /api/students
const getStudents = async (req, res, next) => {
  try {
    const { search, class: classFilter, section, academicYear, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { admissionNumber: { $regex: search, $options: "i" } }
        ];
      }
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
      if (academicYear) query.academicYear = academicYear;

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.name = 1;
      }

      const total = await Student.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const students = await Student.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, students, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.students];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(
          s =>
            (s.name && s.name.toLowerCase().includes(sLower)) ||
            (s.admissionNumber && s.admissionNumber.toLowerCase().includes(sLower))
        );
      }
      if (classFilter) list = list.filter(s => s.class === classFilter);
      if (section) list = list.filter(s => s.section === section);
      if (academicYear) list = list.filter(s => s.academicYear === academicYear);

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

      res.json({ success: true, students: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/students/search
const searchStudents = async (req, res, next) => {
  // Point directly to standard getStudents logic but with empty bounds or search
  req.query.limit = req.query.limit || 100;
  return getStudents(req, res, next);
};

// GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const student = await Student.findById(id);
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });
      res.json(student);
    } else {
      const student = inMemoryStore.students.find(s => String(s._id) === String(id));
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });
      res.json(student);
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const studentData = { ...req.body };
    
    // Fallback results and assignments (for new student compatibility)
    if (!studentData.results) {
      studentData.results = [
        { subject: "Mathematics", marks: 0, maxMarks: 0 },
        { subject: "Science", marks: 0, maxMarks: 0 },
        { subject: "English", marks: 0, maxMarks: 0 }
      ];
    }
    if (studentData.attendance === undefined) {
      studentData.attendance = 0;
    }
    if (!studentData.assignments) {
      studentData.assignments = [
        { title: "Science Project", description: "Design a solar system model", dueDate: "2026-07-15", status: "assigned" }
      ];
    }

    const { loginUsername, loginEmail, loginPassword } = req.body;
    let createdStudent;

    if (dbStatus.isMongoConnected) {
      // Create student record
      const student = new Student(studentData);
      createdStudent = await student.save();

      // Create linked login if requested
      if (loginUsername && loginEmail && loginPassword) {
        const hashedPassword = await bcrypt.hash(loginPassword, 10);
        const user = new User({
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: loginEmail.toLowerCase(),
          username: loginUsername,
          password: hashedPassword,
          role: "student",
          studentProfile: createdStudent._id
        });
        await user.save();
      }

      res.status(201).json({ success: true, message: "Student saved to database ✅", student: createdStudent });
    } else {
      const customId = "mem-s-" + Date.now();
      const admissionNum = studentData.admissionNumber || generateInMemoryAdmissionNumber();
      
      const getInMemoryAge = (dob) => {
        if (!dob) return 16;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const inMemStudent = {
        _id: customId,
        ...studentData,
        name: `${studentData.firstName} ${studentData.lastName}`,
        admissionNumber: admissionNum,
        attendance: studentData.attendance || 85,
        status: studentData.status || "Active",
        age: getInMemoryAge(studentData.dob)
      };

      inMemoryStore.students.push(inMemStudent);
      createdStudent = inMemStudent;

      if (loginUsername && loginEmail && loginPassword) {
        const hashedPassword = await bcrypt.hash(loginPassword, 10);
        const inMemUser = {
          _id: "mem-u-" + Date.now(),
          name: inMemStudent.name,
          email: loginEmail.toLowerCase(),
          username: loginUsername,
          password: hashedPassword,
          role: "student",
          studentProfile: customId
        };
        inMemoryStore.users.push(inMemUser);
      }

      res.status(201).json({ success: true, message: "Student saved to in-memory store ✅", student: createdStudent });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentData = { ...req.body };
    if (studentData.firstName && studentData.lastName) {
      studentData.name = `${studentData.firstName} ${studentData.lastName}`;
    }

    const { loginUsername, loginEmail, loginPassword } = req.body;

    if (dbStatus.isMongoConnected) {
      const updatedStudent = await Student.findByIdAndUpdate(id, studentData, { new: true });
      if (!updatedStudent) return res.status(404).json({ success: false, message: "Student not found" });

      // Update User credentials if they are provided
      const user = await User.findOne({ studentProfile: id });
      if (user) {
        user.name = updatedStudent.name;
        if (loginEmail) user.email = loginEmail.toLowerCase();
        if (loginUsername) user.username = loginUsername;
        if (loginPassword) user.password = await bcrypt.hash(loginPassword, 10);
        await user.save();
      }

      res.json(updatedStudent);
    } else {
      const idx = inMemoryStore.students.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });

      const getInMemoryAge = (dob) => {
        if (!dob) return 16;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const updated = {
        ...inMemoryStore.students[idx],
        ...studentData,
        name: studentData.name || inMemoryStore.students[idx].name,
        age: studentData.dob ? getInMemoryAge(studentData.dob) : inMemoryStore.students[idx].age
      };
      inMemoryStore.students[idx] = updated;

      // Update User credentials in memory
      const userIdx = inMemoryStore.users.findIndex(u => String(u.studentProfile) === String(id));
      if (userIdx !== -1) {
        inMemoryStore.users[userIdx].name = updated.name;
        if (loginEmail) inMemoryStore.users[userIdx].email = loginEmail.toLowerCase();
        if (loginUsername) inMemoryStore.users[userIdx].username = loginUsername;
        if (loginPassword) inMemoryStore.users[userIdx].password = await bcrypt.hash(loginPassword, 10);
      }

      res.json(updated);
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const student = await Student.findByIdAndDelete(id);
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });

      // Delete User credentials
      await User.deleteMany({ studentProfile: id });
      res.json({ success: true, message: "Student and user account deleted successfully 🗑️" });
    } else {
      const idx = inMemoryStore.students.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Student not found" });

      inMemoryStore.students = inMemoryStore.students.filter(s => String(s._id) !== String(id));
      inMemoryStore.users = inMemoryStore.users.filter(u => String(u.studentProfile) !== String(id));

      res.json({ success: true, message: "Student and user account deleted successfully 🗑️" });
    }
  } catch (error) {
    next(error);
  }
};

// STUDENT PORTAL GET /api/student-data/dashboard
const getStudentDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Unauthorized student access" });
    }

    let user;
    if (dbStatus.isMongoConnected) {
      user = await User.findById(req.user.user_id);
    } else {
      user = inMemoryStore.users.find(u => String(u._id) === String(req.user.user_id));
    }

    if (!user || !user.studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile link not found" });
    }

    let profile;
    if (dbStatus.isMongoConnected) {
      profile = await Student.findById(user.studentProfile);
    } else {
      profile = inMemoryStore.students.find(s => String(s._id) === String(user.studentProfile));
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile details not found" });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// STUDENT PORTAL PUT /api/student-data/profile
const updateStudentDashboardProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Unauthorized student access" });
    }

    let user;
    if (dbStatus.isMongoConnected) {
      user = await User.findById(req.user.user_id);
    } else {
      user = inMemoryStore.users.find(u => String(u._id) === String(req.user.user_id));
    }

    if (!user || !user.studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile link not found" });
    }

    const { email, phone, address } = req.body;

    if (dbStatus.isMongoConnected) {
      const profile = await Student.findById(user.studentProfile);
      if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

      if (email) profile.parentEmail = email;
      if (phone) profile.phone = phone;
      if (address) profile.address = address;

      await profile.save();
      res.json({ message: "Profile updated successfully ✅", profile });
    } else {
      const idx = inMemoryStore.students.findIndex(s => String(s._id) === String(user.studentProfile));
      if (idx === -1) return res.status(404).json({ success: false, message: "Profile not found" });

      if (email) inMemoryStore.students[idx].parentEmail = email;
      if (phone) inMemoryStore.students[idx].phone = phone;
      if (address) inMemoryStore.students[idx].address = address;

      res.json({ message: "Profile updated successfully ✅", profile: inMemoryStore.students[idx] });
    }
  } catch (error) {
    next(error);
  }
};

// STUDENT PORTAL POST /api/student-data/assignments/:assignmentId/submit
const submitAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Unauthorized student access" });
    }

    let user;
    if (dbStatus.isMongoConnected) {
      user = await User.findById(req.user.user_id);
    } else {
      user = inMemoryStore.users.find(u => String(u._id) === String(req.user.user_id));
    }

    if (!user || !user.studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile link not found" });
    }

    if (dbStatus.isMongoConnected) {
      const student = await Student.findById(user.studentProfile);
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });

      const assignment = student.assignments.id(req.params.assignmentId);
      if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

      assignment.status = "submitted";
      await student.save();

      res.json({ message: "Assignment submitted successfully ✅", student });
    } else {
      const sIdx = inMemoryStore.students.findIndex(s => String(s._id) === String(user.studentProfile));
      if (sIdx === -1) return res.status(404).json({ success: false, message: "Student not found" });

      const aIdx = inMemoryStore.students[sIdx].assignments.findIndex(a => String(a._id) === String(req.params.assignmentId));
      if (aIdx === -1) return res.status(404).json({ success: false, message: "Assignment not found" });

      inMemoryStore.students[sIdx].assignments[aIdx].status = "submitted";
      res.json({ message: "Assignment submitted successfully ✅", student: inMemoryStore.students[sIdx] });
    }
  } catch (error) {
    next(error);
  }
};

const getToppers = async (req, res, next) => {
  try {
    const Topper = require("../models/Topper");
    if (dbStatus.isMongoConnected) {
      const toppers = await Topper.find().sort({ createdAt: 1 });
      res.json(toppers);
    } else {
      res.json(inMemoryStore.toppers);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  searchStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentDashboard,
  updateStudentDashboardProfile,
  submitAssignment,
  getToppers
};
