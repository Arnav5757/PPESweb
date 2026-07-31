const AcademicYear = require("../models/AcademicYear");
const AcademicSession = require("../models/AcademicSession");
const Class = require("../models/Class");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.academicYears = inMemoryStore.academicYears || [];
inMemoryStore.academicSessions = inMemoryStore.academicSessions || [];
inMemoryStore.classes = inMemoryStore.classes || [];

const getAcademicYears = async (req, res, next) => {
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

      const total = await AcademicYear.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const academicYears = await AcademicYear.find(query)
        .populate("session")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, academicYears, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.academicYears];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(y => y.name && y.name.toLowerCase().includes(sLower));
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

      // Populate session
      list = list.map(y => ({
        ...y,
        session: inMemoryStore.academicSessions.find(s => String(s._id) === String(y.session)) || y.session
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, academicYears: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getCurrentYear = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const year = await AcademicYear.findOne({ isActive: true }).populate("session");
      if (!year) return res.status(404).json({ success: false, message: "No active academic year found" });
      res.json({ success: true, academicYear: year });
    } else {
      let year = inMemoryStore.academicYears.find(y => y.isActive === true);
      if (!year) return res.status(404).json({ success: false, message: "No active academic year found" });
      year = {
        ...year,
        session: inMemoryStore.academicSessions.find(s => String(s._id) === String(year.session)) || year.session
      };
      res.json({ success: true, academicYear: year });
    }
  } catch (error) {
    next(error);
  }
};

const getAcademicYearById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const year = await AcademicYear.findById(id).populate("session");
      if (!year) return res.status(404).json({ success: false, message: "Academic Year not found" });
      res.json({ success: true, academicYear: year });
    } else {
      let year = inMemoryStore.academicYears.find(y => String(y._id) === String(id));
      if (!year) return res.status(404).json({ success: false, message: "Academic Year not found" });
      year = {
        ...year,
        session: inMemoryStore.academicSessions.find(s => String(s._id) === String(year.session)) || year.session
      };
      res.json({ success: true, academicYear: year });
    }
  } catch (error) {
    next(error);
  }
};

const createAcademicYear = async (req, res, next) => {
  try {
    const yearData = req.body;
    let newYear;

    // Validate session exists
    if (dbStatus.isMongoConnected) {
      const sessionExists = await AcademicSession.findById(yearData.session);
      if (!sessionExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Session does not exist" });
      }

      // If setting isActive=true, unset all others first
      if (yearData.isActive === true) {
        await AcademicYear.updateMany({}, { isActive: false });
      }
      const year = new AcademicYear(yearData);
      newYear = await year.save();
    } else {
      const sessionExists = inMemoryStore.academicSessions.find(s => String(s._id) === String(yearData.session));
      if (!sessionExists) {
        return res.status(400).json({ success: false, message: "Referenced Academic Session does not exist" });
      }

      // If setting isActive=true, unset all others first
      if (yearData.isActive === true) {
        inMemoryStore.academicYears.forEach(y => { y.isActive = false; });
      }
      newYear = {
        _id: "mem-ay-" + Date.now(),
        ...yearData,
        status: yearData.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.academicYears.push(newYear);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Academic Year: ${newYear.name}`, "AcademicYear");
    res.status(201).json({ success: true, message: "Academic Year created successfully ✅", academicYear: newYear });
  } catch (error) {
    next(error);
  }
};

const updateAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const yearData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      // If setting isActive=true, unset all others first
      if (yearData.isActive === true) {
        await AcademicYear.updateMany({ _id: { $ne: id } }, { isActive: false });
      }
      updated = await AcademicYear.findByIdAndUpdate(id, yearData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Academic Year not found" });
    } else {
      const idx = inMemoryStore.academicYears.findIndex(y => String(y._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Year not found" });

      // If setting isActive=true, unset all others first
      if (yearData.isActive === true) {
        inMemoryStore.academicYears.forEach((y, i) => {
          if (i !== idx) y.isActive = false;
        });
      }

      updated = {
        ...inMemoryStore.academicYears[idx],
        ...yearData,
        updatedAt: new Date()
      };
      inMemoryStore.academicYears[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Academic Year: ${updated.name}`, "AcademicYear");
    res.json({ success: true, academicYear: updated });
  } catch (error) {
    next(error);
  }
};

const deleteAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    let yearName = "Unknown";

    if (dbStatus.isMongoConnected) {
      // Check for active classes under this year
      const activeClasses = await Class.countDocuments({ academicYear: id, status: "Active" });
      if (activeClasses > 0) {
        return res.status(400).json({ success: false, message: "Cannot archive year with active classes" });
      }

      const year = await AcademicYear.findByIdAndUpdate(id, { status: "Archived" }, { new: true });
      if (!year) return res.status(404).json({ success: false, message: "Academic Year not found" });
      yearName = year.name;
    } else {
      const idx = inMemoryStore.academicYears.findIndex(y => String(y._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Year not found" });

      // Check for active classes under this year
      const activeClasses = inMemoryStore.classes.filter(
        c => String(c.academicYear) === String(id) && c.status === "Active"
      );
      if (activeClasses.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot archive year with active classes" });
      }

      yearName = inMemoryStore.academicYears[idx].name;
      inMemoryStore.academicYears[idx].status = "Archived";
      inMemoryStore.academicYears[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Archived Academic Year: ${yearName}`, "AcademicYear");
    res.json({ success: true, message: "Academic Year archived successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAcademicYears,
  getCurrentYear,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear
};
