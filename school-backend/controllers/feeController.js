const Fee = require("../models/Fee");
const { Student } = require("../models/Student");
const { dbStatus, inMemoryStore } = require("../config/db");
const { logActivity } = require("../utils/logger");

inMemoryStore.fees = inMemoryStore.fees || [];

const getFees = async (req, res, next) => {
  try {
    const { status, studentId } = req.query;

    if (dbStatus.isMongoConnected) {
      const query = {};
      if (status) query.status = status;
      if (studentId) query.student = studentId;

      const fees = await Fee.find(query).populate("student");
      res.json({ success: true, fees });
    } else {
      let list = [...inMemoryStore.fees];
      if (status) list = list.filter(f => f.status === status);
      if (studentId) list = list.filter(f => String(f.student) === String(studentId));

      const populated = list.map(f => {
        const stud = inMemoryStore.students.find(s => String(s._id) === String(f.student));
        return {
          ...f,
          student: stud || { _id: f.student, name: "Unknown Student" }
        };
      });

      res.json({ success: true, fees: populated });
    }
  } catch (error) {
    next(error);
  }
};

const createFee = async (req, res, next) => {
  try {
    const { student, category, amount, dueDate, remarks } = req.body;
    let newInvoice;

    if (dbStatus.isMongoConnected) {
      const invoice = new Fee({
        student,
        category,
        amount,
        dueDate,
        remarks,
        status: "Pending"
      });
      newInvoice = await invoice.save();
    } else {
      newInvoice = {
        _id: "mem-fee-" + Date.now(),
        student,
        category,
        amount,
        status: "Pending",
        dueDate: new Date(dueDate),
        remarks,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStore.fees.push(newInvoice);
    }

    // Lookup student name for logs
    let sName = "Student";
    if (dbStatus.isMongoConnected) {
      const sObj = await Student.findById(student);
      if (sObj) sName = sObj.name;
    } else {
      const sObj = inMemoryStore.students.find(s => String(s._id) === String(student));
      if (sObj) sName = sObj.name;
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Created Fee Invoice: ${category} of ${amount} for ${sName}`,
      "Fee"
    );

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    next(error);
  }
};

const payFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated;

    if (dbStatus.isMongoConnected) {
      updated = await Fee.findByIdAndUpdate(
        id,
        { status: "Paid", paidDate: new Date() },
        { new: true }
      ).populate("student");

      if (!updated) return res.status(404).json({ success: false, message: "Invoice not found" });
    } else {
      const idx = inMemoryStore.fees.findIndex(f => String(f._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Invoice not found" });

      inMemoryStore.fees[idx].status = "Paid";
      inMemoryStore.fees[idx].paidDate = new Date();
      
      const stud = inMemoryStore.students.find(s => String(s._id) === String(inMemoryStore.fees[idx].student));
      updated = {
        ...inMemoryStore.fees[idx],
        student: stud || { _id: inMemoryStore.fees[idx].student, name: "Unknown" }
      };
    }

    await logActivity(
      req.user ? req.user.username : "Admin",
      `Received Payment for Invoice Category ${updated.category} of ${updated.amount} from ${updated.student?.name || "Student"}`,
      "Fee"
    );

    res.json({ success: true, invoice: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFees,
  createFee,
  payFee
};
