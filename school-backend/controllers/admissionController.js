const bcrypt = require("bcryptjs");
const Admission = require("../models/Admission");
const { Student } = require("../models/Student");
const User = require("../models/User");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays
inMemoryStore.admissions = inMemoryStore.admissions || [];

// Helper: generate application number
const generateAppNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${rand}`;
};

// Helper: generate admission number for student
const generateAdmissionNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ADM-${year}-${rand}`;
};

// ─── GET /api/admissions ──────────────────────────────────────────
const getAdmissions = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (search) {
        query.$or = [
          { studentName: { $regex: search, $options: "i" } },
          { applicationNumber: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }
      if (status) query.status = status;

      const total = await Admission.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const admissions = await Admission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, admissions, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.admissions];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(
          a =>
            (a.studentName && a.studentName.toLowerCase().includes(sLower)) ||
            (a.applicationNumber && a.applicationNumber.toLowerCase().includes(sLower)) ||
            (a.email && a.email.toLowerCase().includes(sLower))
        );
      }
      if (status) list = list.filter(a => a.status === status);

      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, admissions: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admissions/:id ──────────────────────────────────────
const getAdmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const admission = await Admission.findById(id);
      if (!admission) return res.status(404).json({ success: false, message: "Application not found" });
      res.json(admission);
    } else {
      const admission = inMemoryStore.admissions.find(a => String(a._id) === String(id));
      if (!admission) return res.status(404).json({ success: false, message: "Application not found" });
      res.json(admission);
    }
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/admissions (PUBLIC — no auth required) ─────────────
const createAdmission = async (req, res, next) => {
  try {
    const applicationData = { ...req.body };
    let created;

    if (dbStatus.isMongoConnected) {
      const admission = new Admission(applicationData);
      created = await admission.save();
    } else {
      created = {
        _id: "mem-adm-" + Date.now(),
        ...applicationData,
        applicationNumber: generateAppNumber(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.admissions.push(created);
    }

    await logActivity("Public", `New admission application: ${created.studentName}`, "Admission");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! You will be contacted soon.",
      admission: {
        _id: created._id,
        applicationNumber: created.applicationNumber,
        studentName: created.studentName,
        status: created.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admissions/:id (Admin update — review, add notes) ───
const updateAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Admission.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Application not found" });
    } else {
      const idx = inMemoryStore.admissions.findIndex(a => String(a._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Application not found" });
      updated = { ...inMemoryStore.admissions[idx], ...updateData, updatedAt: new Date() };
      inMemoryStore.admissions[idx] = updated;
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Updated admission application: ${updated.studentName} (${updated.status})`,
      "Admission"
    );
    res.json({ success: true, admission: updated });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/admissions/:id/approve ─────────────────────────────
// Approve the application and create a Student record + portal credentials
const approveAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, gender, dob, bloodGroup, category, religion,
      rollNumber, section, academicYear, house,
      fatherName, motherName, phone, alternateContact, parentEmail, occupation, address,
      loginUsername, loginEmail, loginPassword
    } = req.body;

    // Validate required student fields
    const missingFields = [];
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!gender) missingFields.push("gender");
    if (!dob) missingFields.push("dob");
    if (!bloodGroup) missingFields.push("bloodGroup");
    if (!category) missingFields.push("category");
    if (!rollNumber) missingFields.push("rollNumber");
    if (!section) missingFields.push("section");
    if (!fatherName) missingFields.push("fatherName");
    if (!motherName) missingFields.push("motherName");
    if (!phone) missingFields.push("phone");
    if (!address) missingFields.push("address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required student information",
        errors: missingFields.map(f => ({ field: f, message: `${f} is required` }))
      });
    }

    let admission;
    let createdStudent;

    if (dbStatus.isMongoConnected) {
      admission = await Admission.findById(id);
      if (!admission) return res.status(404).json({ success: false, message: "Application not found" });
      if (admission.status === "enrolled") {
        return res.status(400).json({ success: false, message: "This application has already been enrolled" });
      }

      // Create the full Student record
      const studentData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        gender,
        dob: new Date(dob),
        bloodGroup,
        category,
        religion: religion || "",
        rollNumber,
        class: admission.desiredGrade,
        section,
        academicYear: academicYear || "2025-2026",
        house: house || "",
        fatherName,
        motherName,
        phone,
        alternateContact: alternateContact || "",
        parentEmail: parentEmail || admission.email,
        occupation: occupation || "",
        address,
        status: "Active",
        admissionDate: new Date(),
        attendance: 0,
        results: [],
        assignments: []
      };

      const student = new Student(studentData);
      createdStudent = await student.save();

      // Create portal credentials if provided
      if (loginUsername && loginEmail && loginPassword) {
        const hashedPassword = await bcrypt.hash(loginPassword, 10);
        const user = new User({
          name: createdStudent.name,
          email: loginEmail.toLowerCase(),
          username: loginUsername,
          password: hashedPassword,
          role: "student",
          studentProfile: createdStudent._id
        });
        await user.save();
      }

      // Update admission status
      admission.status = "enrolled";
      admission.studentRecord = createdStudent._id;
      admission.reviewedBy = req.user ? req.user.username : "Admin";
      admission.reviewedAt = new Date();
      await admission.save();

    } else {
      // In-memory mode
      const idx = inMemoryStore.admissions.findIndex(a => String(a._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Application not found" });
      admission = inMemoryStore.admissions[idx];

      if (admission.status === "enrolled") {
        return res.status(400).json({ success: false, message: "This application has already been enrolled" });
      }

      const studentId = "mem-s-" + Date.now();
      const admissionNum = generateAdmissionNumber();

      createdStudent = {
        _id: studentId,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        admissionNumber: admissionNum,
        gender,
        dob,
        bloodGroup,
        category,
        religion: religion || "",
        rollNumber,
        class: admission.desiredGrade,
        section,
        academicYear: academicYear || "2025-2026",
        house: house || "",
        fatherName,
        motherName,
        phone,
        alternateContact: alternateContact || "",
        parentEmail: parentEmail || admission.email,
        occupation: occupation || "",
        address,
        status: "Active",
        admissionDate: new Date(),
        attendance: 0,
        results: [],
        assignments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      inMemoryStore.students.push(createdStudent);

      if (loginUsername && loginEmail && loginPassword) {
        const hashedPassword = await bcrypt.hash(loginPassword, 10);
        inMemoryStore.users.push({
          _id: "mem-u-" + Date.now(),
          name: createdStudent.name,
          email: loginEmail.toLowerCase(),
          username: loginUsername,
          password: hashedPassword,
          role: "student",
          studentProfile: studentId
        });
      }

      inMemoryStore.admissions[idx] = {
        ...admission,
        status: "enrolled",
        studentRecord: studentId,
        reviewedBy: req.user ? req.user.username : "Admin",
        reviewedAt: new Date(),
        updatedAt: new Date()
      };
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Approved & enrolled: ${createdStudent.name} (${createdStudent.admissionNumber || "N/A"})`,
      "Admission"
    );

    res.json({
      success: true,
      message: `Student ${createdStudent.name} enrolled successfully ✅`,
      student: createdStudent,
      admission: { status: "enrolled" }
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admissions/:id/reject ───────────────────────────────
const rejectAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Admission.findByIdAndUpdate(
        id,
        {
          status: "rejected",
          adminRemarks: adminRemarks || "",
          reviewedBy: req.user ? req.user.username : "Admin",
          reviewedAt: new Date()
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: "Application not found" });
    } else {
      const idx = inMemoryStore.admissions.findIndex(a => String(a._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Application not found" });
      updated = {
        ...inMemoryStore.admissions[idx],
        status: "rejected",
        adminRemarks: adminRemarks || "",
        reviewedBy: req.user ? req.user.username : "Admin",
        reviewedAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.admissions[idx] = updated;
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Rejected admission application: ${updated.studentName}`,
      "Admission"
    );
    res.json({ success: true, message: "Application rejected", admission: updated });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admissions/:id ───────────────────────────────────
const deleteAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const deleted = await Admission.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Application not found" });
    } else {
      const idx = inMemoryStore.admissions.findIndex(a => String(a._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Application not found" });
      inMemoryStore.admissions.splice(idx, 1);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Deleted admission application`, "Admission");
    res.json({ success: true, message: "Application deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  approveAdmission,
  rejectAdmission,
  deleteAdmission
};
