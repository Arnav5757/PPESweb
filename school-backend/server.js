const env = require("./config/env");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const seedData = require("./utils/seedData");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

connectDB().then(async () => {
  await seedAdmin();
  await seedData();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student-data", require("./routes/studentDataRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/toppers", require("./routes/topperRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/cms", require("./routes/cmsRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/activity-logs", require("./routes/activityLogRoutes"));
app.use("/api/admissions", require("./routes/admissionRoutes"));

// Academic Management Routes
app.use("/api/academic-sessions", require("./routes/academicSessionRoutes"));
app.use("/api/academic-years", require("./routes/academicYearRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/academic-subjects", require("./routes/academicSubjectRoutes"));
app.use("/api/subject-assignments", require("./routes/subjectAssignmentRoutes"));
app.use("/api/teacher-assignments", require("./routes/teacherAssignmentRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/promotions", require("./routes/promotionRoutes"));

// Legacy Routes Compatibility
app.use("/students", require("./routes/studentRoutes"));
app.use("/notices", require("./routes/noticeRoutes"));
app.post("/admission", require("./validators/admissionValidator").validateAdmission, require("./controllers/admissionController").createAdmission);
app.put("/student/:id", require("./middleware/verifyToken"), require("./middleware/verifyAdmin"), require("./validators/studentValidator").validateStudent, require("./controllers/studentController").updateStudent);
app.delete("/student/:id", require("./middleware/verifyToken"), require("./middleware/verifyAdmin"), require("./controllers/studentController").deleteStudent);

app.use(errorHandler);

const PORT = env.port;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));