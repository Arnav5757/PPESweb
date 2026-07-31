const Section = require("../models/Section");
const Class = require("../models/Class");
const Enrollment = require("../models/Enrollment");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

// Ensure in-memory arrays are ready
inMemoryStore.sections = inMemoryStore.sections || [];
inMemoryStore.classes = inMemoryStore.classes || [];
inMemoryStore.enrollments = inMemoryStore.enrollments || [];

const getSections = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10, class: classFilter } = req.query;
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

      let sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.name = 1;
      }

      const total = await Section.countDocuments(query);
      const pages = Math.ceil(total / limitNum);
      const sections = await Section.find(query)
        .populate("class classTeacher")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.json({ success: true, sections, total, page: pageNum, pages });
    } else {
      let list = [...inMemoryStore.sections];

      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(s => s.name && s.name.toLowerCase().includes(sLower));
      }
      if (classFilter) {
        list = list.filter(s => String(s.class) === String(classFilter));
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

      // Populate class and classTeacher
      list = list.map(s => ({
        ...s,
        class: inMemoryStore.classes.find(c => String(c._id) === String(s.class)) || s.class,
        classTeacher: (inMemoryStore.teachers || []).find(t => String(t._id) === String(s.classTeacher)) || s.classTeacher
      }));

      const total = list.length;
      const pages = Math.ceil(total / limitNum);
      const paginatedList = list.slice(skip, skip + limitNum);

      res.json({ success: true, sections: paginatedList, total, page: pageNum, pages });
    }
  } catch (error) {
    next(error);
  }
};

const getSectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbStatus.isMongoConnected) {
      const section = await Section.findById(id).populate("class classTeacher");
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });
      res.json({ success: true, section });
    } else {
      let section = inMemoryStore.sections.find(s => String(s._id) === String(id));
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });
      section = {
        ...section,
        class: inMemoryStore.classes.find(c => String(c._id) === String(section.class)) || section.class,
        classTeacher: (inMemoryStore.teachers || []).find(t => String(t._id) === String(section.classTeacher)) || section.classTeacher
      };
      res.json({ success: true, section });
    }
  } catch (error) {
    next(error);
  }
};

const createSection = async (req, res, next) => {
  try {
    const sectionData = req.body;
    let newSection;

    if (dbStatus.isMongoConnected) {
      // Validate class exists
      const classExists = await Class.findById(sectionData.class);
      if (!classExists) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }

      // Check duplicate section name within same class
      const duplicate = await Section.findOne({ name: sectionData.name, class: sectionData.class });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "A section with this name already exists for the selected class" });
      }

      const section = new Section(sectionData);
      newSection = await section.save();
    } else {
      const classExists = inMemoryStore.classes.find(c => String(c._id) === String(sectionData.class));
      if (!classExists) {
        return res.status(400).json({ success: false, message: "Referenced Class does not exist" });
      }

      const duplicate = inMemoryStore.sections.find(
        s => s.name === sectionData.name && String(s.class) === String(sectionData.class)
      );
      if (duplicate) {
        return res.status(400).json({ success: false, message: "A section with this name already exists for the selected class" });
      }

      newSection = {
        _id: "mem-sec-" + Date.now(),
        ...sectionData,
        status: sectionData.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.sections.push(newSection);
    }

    await logActivity(req.user ? req.user.username : "Admin", `Created Section: ${newSection.name}`, "Section");
    res.status(201).json({ success: true, message: "Section created successfully ✅", section: newSection });
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sectionData = req.body;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Section.findByIdAndUpdate(id, sectionData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Section not found" });
    } else {
      const idx = inMemoryStore.sections.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Section not found" });

      updated = {
        ...inMemoryStore.sections[idx],
        ...sectionData,
        updatedAt: new Date()
      };
      inMemoryStore.sections[idx] = updated;
    }

    await logActivity(req.user ? req.user.username : "Admin", `Updated Section: ${updated.name}`, "Section");
    res.json({ success: true, section: updated });
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sectionName = "Unknown";

    if (dbStatus.isMongoConnected) {
      // Prevent if enrolled students exist
      const enrolledCount = await Enrollment.countDocuments({ section: id, status: "Active" });
      if (enrolledCount > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete section with enrolled students" });
      }

      const section = await Section.findByIdAndUpdate(id, { status: "Inactive" }, { new: true });
      if (!section) return res.status(404).json({ success: false, message: "Section not found" });
      sectionName = section.name;
    } else {
      const idx = inMemoryStore.sections.findIndex(s => String(s._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Section not found" });

      const enrolledCount = inMemoryStore.enrollments.filter(
        e => String(e.section) === String(id) && e.status === "Active"
      );
      if (enrolledCount.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete section with enrolled students" });
      }

      sectionName = inMemoryStore.sections[idx].name;
      inMemoryStore.sections[idx].status = "Inactive";
      inMemoryStore.sections[idx].updatedAt = new Date();
    }

    await logActivity(req.user ? req.user.username : "Admin", `Soft-deleted Section: ${sectionName}`, "Section");
    res.json({ success: true, message: "Section deactivated successfully 🗑️" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
};
