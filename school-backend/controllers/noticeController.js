const Notice = require("../models/Notice");
const { dbStatus, inMemoryStore } = require("../config/db");

const getNotices = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const notices = await Notice.find();
      res.json(notices);
    } else {
      res.json(inMemoryStore.notices);
    }
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const noticeData = { ...req.body };
    let savedNotice;

    if (dbStatus.isMongoConnected) {
      const notice = new Notice(noticeData);
      savedNotice = await notice.save();
    } else {
      savedNotice = {
        _id: "mem-n-" + Date.now(),
        ...noticeData
      };
      inMemoryStore.notices.push(savedNotice);
    }

    res.status(201).json({ success: true, message: "Notice saved successfully ✅", notice: savedNotice });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const notice = await Notice.findByIdAndDelete(id);
      if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    } else {
      const idx = inMemoryStore.notices.findIndex(n => String(n._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Notice not found" });
      inMemoryStore.notices = inMemoryStore.notices.filter(n => String(n._id) !== String(id));
    }

    res.json({ success: true, message: "Notice deleted successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const noticeData = { ...req.body };
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Notice.findByIdAndUpdate(id, noticeData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Notice not found" });
    } else {
      const idx = inMemoryStore.notices.findIndex(n => String(n._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Notice not found" });

      updated = {
        ...inMemoryStore.notices[idx],
        ...noticeData,
        updatedAt: new Date()
      };
      inMemoryStore.notices[idx] = updated;
    }

    res.json({ success: true, message: "Notice updated successfully ✅", notice: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice
};

