const AcademicSession = require("../models/AcademicSession");
const AcademicYear = require("../models/AcademicYear");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.academicSessions = inMemoryStore.academicSessions || [];
inMemoryStore.academicYears = inMemoryStore.academicYears || [];

const getAcademicSessions = async (req, res, next) => {
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

      const total = await AcademicSession.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const academicSessions = await AcademicSession.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, academicSessions, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.academicSessions];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(s => s.name && s.name.toLowerCase().includes(sLower));
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

      res.json({ success: true, academicSessions: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getCurrentSession = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const session = await AcademicSession.findOne({ isCurrent: true });
      if (!session) return res.status(404).json({ success: false, message: "No current academic session found" });
      res.json({ success: true, academicSession: session });
    } else {
      const session = inMemoryStore.academicSessions.find(s => s.isCurrent === true);
      if (!session) return res.status(404).json({ success: false, message: "No current academic session found" });
      res.json({ success: true, academicSession: session });
    }
  } catch (error) {
    next(error);
  }
};

const getAcademicSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const session = await AcademicSession.findById(id);
      if (!session) return res.status(404).json({ success: false, message: "Academic Session not found" });
      res.json({ success: true, academicSession: session });
    } else {
      const session = inMemoryStore.academicSessions.find(s => String(s._id) === String(id));
      if (!session) return res.status(404).json({ success: false, message: "Academic Session not found" });
      res.json({ success: true, academicSession: session });
    }
  } catch (error) {
    next(error);
  }
};

const createAcademicSession = async (req, res, next) => {
  try {
    const sessionData = req.body;
    let newSession;

    if (dbStatus.isMongoConnected) {
      // If setting isCurrent=true, unset all others first
      if (sessionData.isCurrent === true) {
        await AcademicSession.updateMany({}, { isCurrent: false });
      }
      const session = new AcademicSession(sessionData);
      newSession = await session.save();
    } else {
      // If setting isCurrent=true, unset all others first
      if (sessionData.isCurrent === true) {
        inMemoryStore.academicSessions.forEach(s => { s.isCurrent = false; });
      }
      newSession = {
        _id: "mem-as-" + Date.now(),
        ...sessionData,
        status: sessionData.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.academicSessions.push(newSession);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Academic Session: ${newSession.name}`, "AcademicSession");
    res.status(201).json({ success: true, message: "Academic Session created successfully ✅", academicSession: newSession });
  } catch (error) {
    next(error);
  }
};

const updateAcademicSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      // If setting isCurrent=true, unset all others first
      if (sessionData.isCurrent === true) {
        await AcademicSession.updateMany({ _id: { $ne: id } }, { isCurrent: false });
      }
      updated = await AcademicSession.findByIdAndUpdate(id, sessionData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Academic Session not found" });
    } else {
      const idx = inMemoryStore.academicSessions.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Session not found" });

      // If setting isCurrent=true, unset all others first
      if (sessionData.isCurrent === true) {
        inMemoryStore.academicSessions.forEach((s, i) => {
          if (i !== idx) s.isCurrent = false;
        });
      }

      updated = {
        ...inMemoryStore.academicSessions[idx],
        ...sessionData,
        updatedAt: new Date()
      };
      inMemoryStore.academicSessions[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Academic Session: ${updated.name}`, "AcademicSession");
    res.json({ success: true, academicSession: updated });
  } catch (error) {
    next(error);
  }
};

const deleteAcademicSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sessionName = "Unknown";

    if (dbStatus.isMongoConnected) {
      // Check for active academic years under this session
      const activeYears = await AcademicYear.countDocuments({ session: id, status: "Active" });
      if (activeYears > 0) {
        return res.status(400).json({ success: false, message: "Cannot archive session with active academic years" });
      }

      const session = await AcademicSession.findByIdAndUpdate(id, { status: "Archived" }, { new: true });
      if (!session) return res.status(404).json({ success: false, message: "Academic Session not found" });
      sessionName = session.name;
    } else {
      const idx = inMemoryStore.academicSessions.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Academic Session not found" });

      // Check for active academic years under this session
      const activeYears = inMemoryStore.academicYears.filter(
        y => String(y.session) === String(id) && y.status === "Active"
      );
      if (activeYears.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot archive session with active academic years" });
      }

      sessionName = inMemoryStore.academicSessions[idx].name;
      inMemoryStore.academicSessions[idx].status = "Archived";
      inMemoryStore.academicSessions[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Archived Academic Session: ${sessionName}`, "AcademicSession");
    res.json({ success: true, message: "Academic Session archived successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAcademicSessions,
  getCurrentSession,
  getAcademicSessionById,
  createAcademicSession,
  updateAcademicSession,
  deleteAcademicSession
};
