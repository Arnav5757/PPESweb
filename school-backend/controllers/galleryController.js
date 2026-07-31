const Gallery = require("../models/Gallery");
const { dbStatus, inMemoryStore } = require("../config/db");

const getGallery = async (req, res, next) => {
  try {
    if (dbStatus.isMongoConnected) {
      const items = await Gallery.find().sort({ createdAt: -1 });
      res.json(items);
    } else {
      res.json(inMemoryStore.gallery);
    }
  } catch (error) {
    next(error);
  }
};

const createGalleryItem = async (req, res, next) => {
  try {
    const galleryData = { ...req.body };
    let savedItem;

    if (dbStatus.isMongoConnected) {
      const item = new Gallery(galleryData);
      savedItem = await item.save();
    } else {
      savedItem = {
        _id: "mem-g-" + Date.now(),
        ...galleryData,
        date: new Date()
      };
      inMemoryStore.gallery.push(savedItem);
    }

    res.status(201).json({ success: true, message: "Photo added to gallery ✅", photo: savedItem });
  } catch (error) {
    next(error);
  }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbStatus.isMongoConnected) {
      const item = await Gallery.findByIdAndDelete(id);
      if (!item) return res.status(404).json({ success: false, message: "Photo not found" });
    } else {
      const idx = inMemoryStore.gallery.findIndex(g => String(g._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Photo not found" });
      inMemoryStore.gallery = inMemoryStore.gallery.filter(g => String(g._id) !== String(id));
    }

    res.json({ success: true, message: "Photo deleted successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const galleryData = { ...req.body };
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Gallery.findByIdAndUpdate(id, galleryData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Photo not found" });
    } else {
      const idx = inMemoryStore.gallery.findIndex(g => String(g._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Photo not found" });

      updated = {
        ...inMemoryStore.gallery[idx],
        ...galleryData,
        updatedAt: new Date()
      };
      inMemoryStore.gallery[idx] = updated;
    }

    res.json({ success: true, message: "Photo updated successfully ✅", photo: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};

