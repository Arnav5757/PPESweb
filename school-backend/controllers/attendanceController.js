const Attendance = require("../models/Attendance");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

inMemoryStore.attendance = inMemoryStore.attendance || [];

const getAttendance = async (req, res, next) => {
  try {
    const { date, class: className, section } = req.query;
    if (!date || !className || !section) {
      return res.status(400).json({ success: false, message: "Date, class, and section parameters are required." });
    }

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);

    if (dbStatus.isMongoConnected) {
      const record = await Attendance.findOne({
        date: {
          $gte: searchDate,
          $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
        },
        class: className,
        section
      }).populate("records.student");

      res.json({ success: true, record });
    } else {
      const match = inMemoryStore.attendance.find(a => {
        const d = new Date(a.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === searchDate.getTime() && a.class === className && a.section === section;
      });

      // Populate mock students details for memory fallback
      let record = null;
      if (match) {
        const populatedRecords = match.records.map(r => {
          const sObj = inMemoryStore.students.find(s => String(s._id) === String(r.student));
          return {
            ...r,
            student: sObj || { _id: r.student, name: "Unknown Student" }
          };
        });
        record = { ...match, records: populatedRecords };
      }

      res.json({ success: true, record });
    }
  } catch (error) {
    next(error);
  }
};

const submitAttendance = async (req, res, next) => {
  try {
    const { date, class: className, section, records } = req.body;
    if (!date || !className || !section || !records) {
      return res.status(400).json({ success: false, message: "Parameters missing." });
    }

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);

    let finalRecord;

    if (dbStatus.isMongoConnected) {
      // Find and update or create
      const existing = await Attendance.findOne({
        date: {
          $gte: searchDate,
          $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
        },
        class: className,
        section
      });

      if (existing) {
        existing.records = records;
        finalRecord = await existing.save();
      } else {
        const newRecord = new Attendance({
          date: searchDate,
          class: className,
          section,
          records
        });
        finalRecord = await newRecord.save();
      }
    } else {
      const idx = inMemoryStore.attendance.findIndex(a => {
        const d = new Date(a.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === searchDate.getTime() && a.class === className && a.section === section;
      });

      if (idx !== -1) {
        inMemoryStore.attendance[idx].records = records;
        finalRecord = inMemoryStore.attendance[idx];
      } else {
        finalRecord = {
          _id: "mem-att-" + Date.now(),
          date: searchDate,
          class: className,
          section,
          records,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryStore.attendance.push(finalRecord);
      }
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Logged Attendance for ${className}-${section} on ${date}`,
      "Attendance"
    );

    res.json({ success: true, message: "Attendance saved successfully ✅", record: finalRecord });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  submitAttendance
};
