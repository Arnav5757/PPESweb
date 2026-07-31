const AcademicSubject = require("../models/AcademicSubject");
const Class = require("../models/Class");
const AcademicYear = require("../models/AcademicYear");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");


inMemoryStore.academicSubjects = inMemoryStore.academicSubjects || [];
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];

const getAcademicSubjects = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10, class: classFilter, academicYear } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      if (classFilter) {
        query.class = classFilter;
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

      const total = await AcademicSubject.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const subjects = await AcademicSubject.find(query)
        .populate("class academicYear")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, subjects, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.academicSubjects];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(s => s.name && s.name.toLowerCase().includes(sLower));
      }
      if (classFilter) {
        list = list.filter(s => String(s.class) === String(classFilter));
      }
      if (academicYear) {
        list = list.filter(s => String(s.academicYear) === String(academicYear));
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

      // Populate class and academicYear
      list = list.map(s => ({
        ...s,
        class: inMemoryStore.classes.find(c => String(c._id) === String(s.class)) || s.class,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(s.academicYear)) || s.academicYear
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, subjects: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getAcademicSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const subject = await AcademicSubject.findById(id).populate("class academicYear");
      if (!subject) return res.status(404).json({ success: false, message: "Academic Subject not found" });
      res.json({ success: true, subject });
    } else {
      let subject = inMemoryStore.academicSubjects.find(s => String(s._id) === String(id));
      if (!subject) return res.status(404).json({ success: false, message: "Academic Subject not found" });
      subject = {
        ...subject,
        class: inMemoryStore.classes.find(c => String(c._id) === String(subject.class)) || subject.class,
        academicYear: inMemoryStore.academicYears.find(y => String(y._id) === String(subject.academicYear)) || subject.academicYear
      };
      res.json({ success: true, subject });
    }
  } catch (error) {
    next(error);
  }
};

const createAcademicSubject = async (req, res, next) => {
  try {
    const subjectData = req.body;
    let newSubject;

    if (dbStatus.isMongoConnected) {
      // Validate class exists
      const classExists = await Class.findById(subjectData.class);
      if (!classExists) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }

      // Validate academicYear exists
      const yearExists = await AcademicYear.findById(subjectData.academicYear);
      if (!yearExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }

      // Check unique code per class
      if (subjectData.code) {
        const duplicate = await AcademicSubject.findOne({ code: subjectData.code, class: subjectData.class });
        if (duplicate) {
          return res.status(400).json({ success: false, message: "A subject with this code already exists for the selected class" });
        }
      }

      const subject = new AcademicSubject(subjectData);
      newSubject = await subject.save();
    } else {
      const classExists = inMemoryStore.classes.find(c => String(c._id) === String(subjectData.class));
      if (!classExists) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }

      const yearExists = inMemoryStore.academicYears.find(y => String(y._id) === String(subjectData.academicYear));
      if (!yearExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Year does not exist" });
      }

      if (subjectData.code) {
        const duplicate = inMemoryStore.academicSubjects.find(
          s => s.code === subjectData.code && String(s.class) === String(subjectData.class)
        );
        if (duplicate) {
          return res.status(400).json({ success: false, message: "A subject with this code already exists for the selected class" });
        }
      }

      newSubject = {
        _id: "mem-sub-" + Date.now(),
        ...subjectData,
        status: subjectData.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.academicSubjects.push(newSubject);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Academic Subject: ${newSubject.name}`, "AcademicSubject");
    res.status(201).json({ success: true, message: "Academic Subject created successfully ✅", subject: newSubject });
  } catch (error) {
    next(error);
  }
};

const updateAcademicSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subjectData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await AcademicSubject.findByIdAndUpdate(id, subjectData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Academic Subject not found" });
    } else {
      const idx = inMemoryStore.academicSubjects.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Subject not found" });

      updated = {
        ...inMemoryStore.academicSubjects[idx],
        ...subjectData,
        updatedAt: new Date()
      };
      inMemoryStore.academicSubjects[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Academic Subject: ${updated.name}`, "AcademicSubject");
    res.json({ success: true, subject: updated });
  } catch (error) {
    next(error);
  }
};

const deleteAcademicSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    let subjectName = "Unknown";

    if (dbStatus.isMongoConnected) {
      const subject = await AcademicSubject.findByIdAndUpdate(id, { status: "Inactive" }, { new: true });
      if (!subject) return res.status(404).json({ success: false, message: "Academic Subject not found" });
      subjectName = subject.name;
    } else {
      const idx = inMemoryStore.academicSubjects.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Subject not found" });

      subjectName = inMemoryStore.academicSubjects[idx].name;
      inMemoryStore.academicSubjects[idx].status = "Inactive";
      inMemoryStore.academicSubjects[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Deactivated Academic Subject: ${subjectName}`, "AcademicSubject");
    res.json({ success: true, message: "Academic Subject deactivated successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAcademicSubjects,
  getAcademicSubjectById,
  createAcademicSubject,
  updateAcademicSubject,
  deleteAcademicSubject
};
