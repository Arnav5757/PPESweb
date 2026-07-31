const bcrypt = require("bcryptjs");
const Notice = require("../models/Notice");
const Gallery = require("../models/Gallery");
const { Student } = require("../models/Student");
const User = require("../models/User");
const AcademicSession = require("../models/AcademicSession");
const AcademicYear = require("../models/AcademicYear");
const Class = require("../models/Class");
const Section = require("../models/Section");
const AcademicSubject = require("../models/AcademicSubject");
const Teacher = require("../models/Teacher");
const Topper = require("../models/Topper");
const { dbStatus, inMemoryStore } = require("../config/db");


const seedData = async () => {
  const defaultNotices = [
    {
      title: "Quantum Research Lab inaugurating on June 5th",
      date: "2026-05-20",
      category: "Event",
      content: "We are excited to launch our state-of-the-art Quantum Lab to enable students to experiment with quantum computing chips."
    },
    {
      title: "Term Assessment Schedule (Robotics & AI)",
      date: "2026-05-24",
      category: "Exam",
      content: "The final evaluations for AI Neural networks and Robotics will occur during the second week of June."
    },
    {
      title: "Admissions open for Academic Session 2026-27",
      date: "2026-05-01",
      category: "Academic",
      content: "Admissions are open for our futuristic international STEAM programs. Apply online!"
    }
  ];

  const defaultGallery = [
    { title: "Primary Activity Wing (Grades 1-5)", imageUrl: "/gallery/gallery_primary.png", category: "Primary" },
    { title: "Middle School AV Library (Grades 6-8)", imageUrl: "/gallery/gallery_middle.png", category: "Labs" },
    { title: "Secondary Science Laboratories (Grades 9-10)", imageUrl: "/gallery/gallery_secondary.png", category: "Labs" },
    { title: "Higher Secondary Physics & IT Lab (Grades 11-12)", imageUrl: "/gallery/gallery_senior.png", category: "Labs" },
    { title: "Main Academy Assembly Auditorium", imageUrl: "/gallery/gallery_auditorium.png", category: "Campus" },
    { title: "Junior & Senior Outdoor Athletics Arena", imageUrl: "/gallery/gallery_sports.png", category: "Sports" }
  ];

  const defaultToppers = [
    {
      name: "Pranav Pareek",
      class: "Grade XII (Science)",
      percentage: "98.8%",
      color: "from-sky-400 to-blue-600",
      avatarText: "PP",
      rank: "1st Rank"
    },
    {
      name: "Ananya Sharma",
      class: "Grade XII (Commerce)",
      percentage: "98.2%",
      color: "from-rose-400 to-pink-600",
      avatarText: "AS",
      rank: "2nd Rank"
    },
    {
      name: "Rohan Verma",
      class: "Grade X (Science)",
      percentage: "97.6%",
      color: "from-emerald-400 to-teal-600",
      avatarText: "RV",
      rank: "1st Rank"
    },
    {
      name: "Sneha Gupta",
      class: "Grade X (Science)",
      percentage: "97.2%",
      color: "from-indigo-400 to-purple-600",
      avatarText: "SG",
      rank: "2nd Rank"
    }
  ];


  const defaultStudentData = {
    firstName: "Alice",
    lastName: "Vance",
    gender: "Female",
    dob: new Date("2010-04-12"),
    bloodGroup: "O+",
    aadhaarNumber: "1234-5678-9012",
    category: "General",
    religion: "Christianity",
    photo: "", // Empty or placeholder
    rollNumber: "101",
    admissionDate: new Date("2024-04-01"),
    academicYear: "2025-2026",
    class: "Grade 11",
    section: "A",
    house: "Einstein House",
    status: "Active",
    fatherName: "John Vance",
    motherName: "Mary Vance",
    phone: "+1 (555) 304-9988",
    alternateContact: "+1 (555) 304-9989",
    parentEmail: "parents@vance.com",
    occupation: "Software Engineer",
    address: "Downtown Sector 4, Suite 102",
    attendance: 0,
    results: [
      { subject: "Quantum Computing", marks: 0, maxMarks: 0 },
      { subject: "AI & Neural Networks", marks: 0, maxMarks: 0 }
    ],
    assignments: [
      { title: "Lab Report: Neural Synapse Simulation", description: "Simulate a 3-layer neural network.", dueDate: "2026-06-10", status: "assigned" }
    ]
  };

  try {
    const studentPasswordHash = await bcrypt.hash("student123", 10);

    if (dbStatus.isMongoConnected) {
      // 1. Notices
      const noticesCount = await Notice.countDocuments();
      if (noticesCount === 0) {
        await Notice.insertMany(defaultNotices);
        console.log("Seeded default notices in MongoDB 📢");
      }

      // 2. Gallery
      const galleryCount = await Gallery.countDocuments();
      if (galleryCount === 0) {
        await Gallery.insertMany(defaultGallery);
        console.log("Seeded default gallery items in MongoDB 🖼️");
      }

      // 2b. Toppers
      const toppersCount = await Topper.countDocuments();
      if (toppersCount === 0) {
        await Topper.insertMany(defaultToppers);
        console.log("Seeded default toppers in MongoDB 🏆");
      }

      // 3. Student (Alice Vance)
      const studentExists = await Student.findOne({ firstName: "Alice", lastName: "Vance" });
      if (!studentExists) {
        const student = new Student({
          ...defaultStudentData,
          name: "Alice Vance",
          admissionNumber: "ADM-2026-000001"
        });
        const savedStudent = await student.save();

        // Linked login user
        const userExists = await User.findOne({ email: "alice@student.com" });
        if (!userExists) {
          const user = new User({
            name: "Alice Vance",
            email: "alice@student.com",
            username: "alice",
            password: studentPasswordHash,
            role: "student",
            studentProfile: savedStudent._id,
            status: "Active"
          });
          await user.save();
        }

        // Seed Teacher profile & User for test
        const Teacher = require("../models/Teacher");
        let teacherId = "mem-teacher-1";
        const teacherExists = await Teacher.findOne({ email: "feynman@physics.edu" });
        if (!teacherExists) {
          const teacher = new Teacher({
            name: "Professor Richard Feynman",
            email: "feynman@physics.edu",
            phone: "9876543210",
            qualification: "Ph.D. in Physics",
            specialization: "Quantum Electrodynamics"
          });
          const savedTeacher = await teacher.save();
          teacherId = savedTeacher._id;
        } else {
          teacherId = teacherExists._id;
        }

        const teacherUserExists = await User.findOne({ email: "teacher@pareek.edu" });
        if (!teacherUserExists) {
          const teacherUser = new User({
            name: "Professor Feynman",
            email: "teacher@pareek.edu",
            username: "teacher",
            password: studentPasswordHash,
            role: "teacher",
            teacherProfile: teacherId,
            status: "Active"
          });
          await teacherUser.save();
        }

        // Suspended student user
        const suspendedUserExists = await User.findOne({ email: "suspended_alice@student.com" });
        if (!suspendedUserExists) {
          const suspendedUser = new User({
            name: "Suspended Alice",
            email: "suspended_alice@student.com",
            username: "suspended_alice",
            password: studentPasswordHash,
            role: "student",
            studentProfile: savedStudent._id,
            status: "Suspended"
          });
          await suspendedUser.save();
        }

        console.log("Seeded default Student (Alice Vance), Teacher (Feynman), and linked Users in MongoDB 🎓");
      }
    } else {
      // Seed In-Memory
      if (inMemoryStore.notices.length === 0) {
        inMemoryStore.notices = defaultNotices.map((n, i) => ({ _id: `mem-n-${i + 1}`, ...n }));
        console.log("Seeded default notices in Memory 📢");
      }

      if (inMemoryStore.gallery.length === 0) {
        inMemoryStore.gallery = defaultGallery.map((g, i) => ({ _id: `mem-g-${i + 1}`, ...g }));
        console.log("Seeded default gallery items in Memory 🖼️");
      }

      if (inMemoryStore.toppers.length === 0) {
        inMemoryStore.toppers = defaultToppers.map((t, i) => ({ _id: `mem-tpr-${i + 1}`, ...t }));
        console.log("Seeded default toppers in Memory 🏆");
      }


      const studentExists = inMemoryStore.students.find(s => s.firstName === "Alice" && s.lastName === "Vance");
      if (!studentExists) {
        const inMemStudent = {
          _id: "mem-student-1",
          ...defaultStudentData,
          name: "Alice Vance",
          admissionNumber: "ADM-2026-000001"
        };
        inMemoryStore.students.push(inMemStudent);

        const userExists = inMemoryStore.users.find(u => u.email === "alice@student.com");
        if (!userExists) {
          inMemoryStore.users.push({
            _id: "mem-u-student-1",
            name: "Alice Vance",
            email: "alice@student.com",
            username: "alice",
            password: studentPasswordHash,
            role: "student",
            studentProfile: "mem-student-1",
            status: "Active"
          });
        }

        // Seed teacher profile in Memory
        inMemoryStore.teachers = inMemoryStore.teachers || [];
        const teacherProfileExists = inMemoryStore.teachers.find(t => t.email === "feynman@physics.edu");
        if (!teacherProfileExists) {
          inMemoryStore.teachers.push({
            _id: "mem-teacher-1",
            name: "Professor Richard Feynman",
            email: "feynman@physics.edu",
            phone: "9876543210",
            qualification: "Ph.D. in Physics",
            specialization: "Quantum Electrodynamics"
          });
        }

        // Seed teacher user in Memory
        const teacherUserExists = inMemoryStore.users.find(u => u.email === "teacher@pareek.edu");
        if (!teacherUserExists) {
          inMemoryStore.users.push({
            _id: "mem-u-teacher-1",
            name: "Professor Feynman",
            email: "teacher@pareek.edu",
            username: "teacher",
            password: studentPasswordHash,
            role: "teacher",
            teacherProfile: "mem-teacher-1",
            status: "Active"
          });
        }

        // Seed suspended student user in Memory
        const suspendedUserExists = inMemoryStore.users.find(u => u.email === "suspended_alice@student.com");
        if (!suspendedUserExists) {
          inMemoryStore.users.push({
            _id: "mem-u-student-suspended",
            name: "Suspended Alice",
            email: "suspended_alice@student.com",
            username: "suspended_alice",
            password: studentPasswordHash,
            role: "student",
            studentProfile: "mem-student-1",
            status: "Suspended"
          });
        }

        console.log("Seeded default Student, Teacher, and suspended accounts in Memory 🎓");
      }
    }

    // ===== ACADEMIC MANAGEMENT SEED DATA =====
    const defaultClassesData = [
      { name: "Nursery", code: "NUR", displayOrder: 1 },
      { name: "LKG", code: "LKG", displayOrder: 2 },
      { name: "UKG", code: "UKG", displayOrder: 3 },
      { name: "Class 1", code: "C1", displayOrder: 4 },
      { name: "Class 2", code: "C2", displayOrder: 5 },
      { name: "Class 3", code: "C3", displayOrder: 6 },
      { name: "Class 4", code: "C4", displayOrder: 7 },
      { name: "Class 5", code: "C5", displayOrder: 8 },
      { name: "Class 6", code: "C6", displayOrder: 9 },
      { name: "Class 7", code: "C7", displayOrder: 10 },
      { name: "Class 8", code: "C8", displayOrder: 11 },
      { name: "Class 9", code: "C9", displayOrder: 12 },
      { name: "Class 10", code: "C10", displayOrder: 13 },
      { name: "Class 11", code: "C11", displayOrder: 14 },
      { name: "Class 12", code: "C12", displayOrder: 15 }
    ];

    const defaultSubjectsData = [
      { name: "Mathematics", code: "MATH" },
      { name: "Science", code: "SCI" },
      { name: "English", code: "ENG" },
      { name: "Hindi", code: "HIN" },
      { name: "Computer", code: "COMP" }
    ];

    if (dbStatus.isMongoConnected) {
      // --- MongoDB Academic Seeding ---
      const sessionCount = await AcademicSession.countDocuments();
      if (sessionCount === 0) {
        const session = new AcademicSession({
          name: "Session 2025-2029",
          startDate: new Date("2025-04-01"),
          endDate: new Date("2029-03-31"),
          isCurrent: true,
          status: "Active"
        });
        const savedSession = await session.save();
        console.log("Seeded default Academic Session in MongoDB 🏫");

        const year = new AcademicYear({
          name: "2025-26",
          session: savedSession._id,
          startDate: new Date("2025-04-01"),
          endDate: new Date("2026-03-31"),
          isActive: true,
          status: "Active"
        });
        const savedYear = await year.save();
        console.log("Seeded default Academic Year in MongoDB 📅");

        const savedClasses = [];
        for (const cls of defaultClassesData) {
          const newClass = new Class({
            name: cls.name,
            code: cls.code,
            academicYear: savedYear._id,
            displayOrder: cls.displayOrder,
            status: "Active"
          });
          const savedClass = await newClass.save();
          savedClasses.push(savedClass);
        }
        console.log(`Seeded ${savedClasses.length} Classes in MongoDB 📚`);

        let sectionCount = 0;
        for (const savedClass of savedClasses) {
          for (const secName of ["A", "B"]) {
            const section = new Section({
              class: savedClass._id,
              name: secName,
              status: "Active"
            });
            await section.save();
            sectionCount++;
          }
        }
        console.log(`Seeded ${sectionCount} Sections in MongoDB 🏷️`);

        let subjectCount = 0;
        for (const savedClass of savedClasses) {
          for (const sub of defaultSubjectsData) {
            const subject = new AcademicSubject({
              name: sub.name,
              code: sub.code,
              class: savedClass._id,
              academicYear: savedYear._id,
              status: "Active"
            });
            await subject.save();
            subjectCount++;
          }
        }
        console.log(`Seeded ${subjectCount} Academic Subjects in MongoDB 📖`);
      }
    } else {
      // --- In-Memory Academic Seeding ---
      if (inMemoryStore.academicSessions.length === 0) {
        const memSession = {
          _id: "mem-session-1",
          name: "Session 2025-2029",
          startDate: new Date("2025-04-01"),
          endDate: new Date("2029-03-31"),
          isCurrent: true,
          status: "Active"
        };
        inMemoryStore.academicSessions.push(memSession);
        console.log("Seeded default Academic Session in Memory 🏫");

        const memYear = {
          _id: "mem-year-1",
          name: "2025-26",
          session: memSession._id,
          startDate: new Date("2025-04-01"),
          endDate: new Date("2026-03-31"),
          isActive: true,
          status: "Active"
        };
        inMemoryStore.academicYears.push(memYear);
        console.log("Seeded default Academic Year in Memory 📅");

        defaultClassesData.forEach((cls, i) => {
          const memClass = {
            _id: `mem-class-${i + 1}`,
            name: cls.name,
            code: cls.code,
            academicYear: memYear._id,
            displayOrder: cls.displayOrder,
            status: "Active"
          };
          inMemoryStore.classes.push(memClass);
        });
        console.log(`Seeded ${inMemoryStore.classes.length} Classes in Memory 📚`);

        let secIdx = 0;
        inMemoryStore.classes.forEach((cls) => {
          ["A", "B"].forEach((secName) => {
            secIdx++;
            inMemoryStore.sections.push({
              _id: `mem-section-${secIdx}`,
              class: cls._id,
              name: secName,
              status: "Active"
            });
          });
        });
        console.log(`Seeded ${inMemoryStore.sections.length} Sections in Memory 🏷️`);

        let subIdx = 0;
        inMemoryStore.classes.forEach((cls) => {
          defaultSubjectsData.forEach((sub) => {
            subIdx++;
            inMemoryStore.academicSubjects.push({
              _id: `mem-subject-${subIdx}`,
              name: sub.name,
              code: sub.code,
              class: cls._id,
              academicYear: memYear._id,
              status: "Active"
            });
          });
        });
        console.log(`Seeded ${inMemoryStore.academicSubjects.length} Academic Subjects in Memory 📖`);
      }
    }
  } catch (err) {
    console.error("Error seeding academic data:", err);
  }
};

module.exports = seedData;
