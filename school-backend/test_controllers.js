/**
 * Integration Test Script to verify and test all backend controllers.
 * This runs the backend server in in-memory mode on a separate port,
 * performs request checks on all key routes, and logs results.
 */

const { spawn } = require("child_process");
const path = require("path");

const TEST_PORT = 5999;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Launch server process
const serverEnv = {
  ...process.env,
  PORT: String(TEST_PORT),
  MONGODB_URI: "offline", // Force in-memory fallback database without timeout
  MONGO_URI: "offline",
  JWT_SECRET: process.env.JWT_SECRET || "test_suite_secure_fallback_secret_key_2026",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};

console.log("🚀 Spawning backend server in offline in-memory fallback mode...");
const serverProcess = spawn("node", ["server.js"], {
  env: serverEnv,
  cwd: __dirname
});

let serverOutput = "";
serverProcess.stdout.on("data", (data) => {
  const str = data.toString();
  serverOutput += str;
  // Print server logs to screen with indentation
  console.log("  [Server]", str.trim());
});

serverProcess.stderr.on("data", (data) => {
  console.error("  [Server ERROR]", data.toString().trim());
});

// Set a timeout to terminate server if it hangs during startup
const startupTimeout = setTimeout(() => {
  console.error("❌ Server startup timed out!");
  serverProcess.kill();
  process.exit(1);
}, 15000);

// Wait for server to start
const checkServerStarted = setInterval(async () => {
  if (serverOutput.includes(`Server started on port ${TEST_PORT}`)) {
    clearInterval(checkServerStarted);
    clearTimeout(startupTimeout);
    console.log(`✅ Server successfully started on port ${TEST_PORT}! Starting tests...`);
    try {
      await runTests();
    } catch (err) {
      console.error("❌ Test suite encountered a fatal error:", err);
    } finally {
      console.log("🧹 Terminating server process...");
      serverProcess.kill("SIGTERM");
      setTimeout(() => {
        process.exit(global.testsFailed ? 1 : 0);
      }, 1000);
    }
  }
}, 500);

global.testsFailed = false;

// Test Runner
async function runTests() {
  const results = [];

  function recordResult(testName, success, details = "") {
    results.push({ testName, success, details });
    if (!success) {
      global.testsFailed = true;
      console.log(`❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    } else {
      console.log(`✅ PASS: ${testName}`);
    }
  }

  let adminToken = "";
  let testStudentId = "";
  let testStudentProfileId = "";
  let testTeacherId = "";
  let testNoticeId = "";
  let testGalleryId = "";
  let testSessionId = "";
  let testYearId = "";
  let testClassId = "";
  let testSectionId = "";
  let testSubjectId = "";
  let testSubjectAssignmentId = "";
  let testTeacherAssignmentId = "";
  let testEnrollmentId = "";
  let testPromotionId = "";
  let testAdmissionId = "";
  let testFeeId = "";
  let testAttendanceId = "";
  let testTopperId = "";

  // 1. Auth: Login as Admin
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@pareek.edu", password: "admin123" })
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      adminToken = data.token;
      recordResult("Auth: Login Admin", true);
    } else {
      recordResult("Auth: Login Admin", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult("Auth: Login Admin", false, err.message);
  }

  if (!adminToken) {
    console.error("Could not obtain admin token. Aborting remaining tests.");
    return;
  }

  const authHeaders = {
    "Authorization": `Bearer ${adminToken}`,
    "Content-Type": "application/json"
  };

  // 2. Auth: Get Me
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
    const data = await res.json();
    if (res.status === 200 && data.email === "admin@pareek.edu") {
      recordResult("Auth: Get Me profile", true);
    } else {
      recordResult("Auth: Get Me profile", false, `Status ${res.status}`);
    }
  } catch (err) {
    recordResult("Auth: Get Me profile", false, err.message);
  }

  // 3. Notices CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/notices`);
    let data = await res.json();
    recordResult("Notices: GET List", res.status === 200 && Array.isArray(data.notices || data));

    // POST Create
    res = await fetch(`${BASE_URL}/api/notices`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Test Notice Board",
        date: "2026-07-17",
        category: "Academic",
        content: "Test notice board description here."
      })
    });
    data = await res.json();
    const noticeObj = data.notice || data;
    if (res.status === 201 && noticeObj._id) {
      testNoticeId = noticeObj._id;
      recordResult("Notices: POST Create", true);
    } else {
      recordResult("Notices: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    // PUT Update
    if (testNoticeId) {
      res = await fetch(`${BASE_URL}/api/notices/${testNoticeId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ title: "Updated Test Notice Board" })
      });
      recordResult("Notices: PUT Update", res.status === 200);

      // DELETE
      res = await fetch(`${BASE_URL}/api/notices/${testNoticeId}`, {
        method: "DELETE",
        headers: authHeaders
      });
      recordResult("Notices: DELETE", res.status === 200);
    }
  } catch (err) {
    recordResult("Notices: CRUD Flow", false, err.message);
  }

  // 4. Gallery CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/gallery`);
    let data = await res.json();
    recordResult("Gallery: GET List", res.status === 200 && Array.isArray(data.gallery || data));

    // POST Create
    res = await fetch(`${BASE_URL}/api/gallery`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Test Gallery Item",
        imageUrl: "/gallery/test_image.png",
        category: "Campus"
      })
    });
    data = await res.json();
    const galObj = data.photo || data;
    if (res.status === 201 && galObj._id) {
      testGalleryId = galObj._id;
      recordResult("Gallery: POST Create", true);
    } else {
      recordResult("Gallery: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    // PUT Update
    if (testGalleryId) {
      res = await fetch(`${BASE_URL}/api/gallery/${testGalleryId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ title: "Updated Test Gallery Item" })
      });
      recordResult("Gallery: PUT Update", res.status === 200);

      // DELETE
      res = await fetch(`${BASE_URL}/api/gallery/${testGalleryId}`, {
        method: "DELETE",
        headers: authHeaders
      });
      recordResult("Gallery: DELETE", res.status === 200);
    }
  } catch (err) {
    recordResult("Gallery: CRUD Flow", false, err.message);
  }

  // 5. Academic Sessions CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/academic-sessions`, { headers: authHeaders });
    let data = await res.json();
    recordResult("Academic Sessions: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/academic-sessions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Session 2026",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        isCurrent: false
      })
    });
    data = await res.json();
    const sessionObj = data.academicSession || data;
    if (res.status === 201 && sessionObj._id) {
      testSessionId = sessionObj._id;
      recordResult("Academic Sessions: POST Create", true);
    } else {
      recordResult("Academic Sessions: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    // GET current
    res = await fetch(`${BASE_URL}/api/academic-sessions/current`, { headers: authHeaders });
    recordResult("Academic Sessions: GET Current", res.status === 200);

    // GET by ID
    if (testSessionId) {
      res = await fetch(`${BASE_URL}/api/academic-sessions/${testSessionId}`, { headers: authHeaders });
      recordResult("Academic Sessions: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/academic-sessions/${testSessionId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Updated Test Session 2026" })
      });
      recordResult("Academic Sessions: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Academic Sessions: CRUD Flow", false, err.message);
  }

  // 6. Academic Years CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/academic-years`, { headers: authHeaders });
    recordResult("Academic Years: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/academic-years`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "AY 2026-27",
        session: testSessionId || "mem-session-1",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        isActive: true
      })
    });
    const data = await res.json();
    const yearObj = data.academicYear || data;
    if (res.status === 201 && yearObj._id) {
      testYearId = yearObj._id;
      recordResult("Academic Years: POST Create", true);
    } else {
      recordResult("Academic Years: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testYearId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/academic-years/${testYearId}`, { headers: authHeaders });
      recordResult("Academic Years: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/academic-years/${testYearId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Updated AY 2026-27" })
      });
      recordResult("Academic Years: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Academic Years: CRUD Flow", false, err.message);
  }

  // 7. Classes CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/classes`, { headers: authHeaders });
    recordResult("Classes: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/classes`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Grade 13 Test",
        code: "G13",
        academicYear: testYearId || "mem-year-1",
        displayOrder: 99
      })
    });
    const data = await res.json();
    const classObj = data.classRecord || data.class || data;
    if (res.status === 201 && classObj._id) {
      testClassId = classObj._id;
      recordResult("Classes: POST Create", true);
    } else {
      recordResult("Classes: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testClassId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/classes/${testClassId}`, { headers: authHeaders });
      recordResult("Classes: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/classes/${testClassId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Grade 13 Updated" })
      });
      recordResult("Classes: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Classes: CRUD Flow", false, err.message);
  }

  // 8. Sections CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/sections`, { headers: authHeaders });
    recordResult("Sections: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/sections`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        class: testClassId || "mem-class-1",
        name: "C",
        status: "Active"
      })
    });
    const data = await res.json();
    const sectionObj = data.section || data;
    if (res.status === 201 && sectionObj._id) {
      testSectionId = sectionObj._id;
      recordResult("Sections: POST Create", true);
    } else {
      recordResult("Sections: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testSectionId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/sections/${testSectionId}`, { headers: authHeaders });
      recordResult("Sections: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/sections/${testSectionId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "D" })
      });
      recordResult("Sections: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Sections: CRUD Flow", false, err.message);
  }

  // 9. Academic Subjects CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/academic-subjects`, { headers: authHeaders });
    recordResult("Subjects: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/academic-subjects`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Quantum Mechanics",
        code: "QM101",
        class: testClassId || "mem-class-1",
        academicYear: testYearId || "mem-year-1",
        status: "Active"
      })
    });
    const data = await res.json();
    const subjectObj = data.subject || data;
    if (res.status === 201 && subjectObj._id) {
      testSubjectId = subjectObj._id;
      recordResult("Subjects: POST Create", true);
    } else {
      recordResult("Subjects: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testSubjectId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/academic-subjects/${testSubjectId}`, { headers: authHeaders });
      recordResult("Subjects: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/academic-subjects/${testSubjectId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Advanced Quantum Mechanics" })
      });
      recordResult("Subjects: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Subjects: CRUD Flow", false, err.message);
  }

  // 10. Teachers CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/teachers`, { headers: authHeaders });
    recordResult("Teachers: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/teachers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Professor Richard Feynman",
        email: "feynman@pareek.edu",
        phone: "9876543210",
        qualification: "Ph.D. in Physics",
        specialization: "Quantum Electrodynamics"
      })
    });
    const data = await res.json();
    const teacherObj = data.teacher || data;
    if (res.status === 201 && teacherObj._id) {
      testTeacherId = teacherObj._id;
      recordResult("Teachers: POST Create", true);
    } else {
      recordResult("Teachers: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testTeacherId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/teachers/${testTeacherId}`, { headers: authHeaders });
      recordResult("Teachers: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/teachers/${testTeacherId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Prof. Richard P. Feynman" })
      });
      recordResult("Teachers: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Teachers: CRUD Flow", false, err.message);
  }

  // 11. Subject Assignments CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/subject-assignments`, { headers: authHeaders });
    recordResult("Subject Assignments: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/subject-assignments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        class: testClassId || "mem-class-1",
        section: testSectionId || "mem-section-1",
        subject: testSubjectId || "mem-subject-1",
        academicYear: testYearId || "mem-year-1",
        status: "Active"
      })
    });
    const data = await res.json();
    const assignObj = data.subjectAssignment || data;
    if (res.status === 201 && assignObj._id) {
      testSubjectAssignmentId = assignObj._id;
      recordResult("Subject Assignments: POST Create", true);
    } else {
      recordResult("Subject Assignments: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testSubjectAssignmentId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/subject-assignments/${testSubjectAssignmentId}`, { headers: authHeaders });
      recordResult("Subject Assignments: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/subject-assignments/${testSubjectAssignmentId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status: "Inactive" })
      });
      recordResult("Subject Assignments: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Subject Assignments: CRUD Flow", false, err.message);
  }

  // 12. Teacher Assignments CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/teacher-assignments`, { headers: authHeaders });
    recordResult("Teacher Assignments: GET List", res.status === 200);

    // POST Create
    res = await fetch(`${BASE_URL}/api/teacher-assignments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        teacher: testTeacherId || "mem-t-1",
        subjectAssignment: testSubjectAssignmentId || "mem-sa-1",
        isClassTeacher: true,
        status: "Active"
      })
    });
    const data = await res.json();
    const assignObj = data.teacherAssignment || data;
    if (res.status === 201 && assignObj._id) {
      testTeacherAssignmentId = assignObj._id;
      recordResult("Teacher Assignments: POST Create", true);
    } else {
      recordResult("Teacher Assignments: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testTeacherAssignmentId) {
      // GET by ID
      res = await fetch(`${BASE_URL}/api/teacher-assignments/${testTeacherAssignmentId}`, { headers: authHeaders });
      recordResult("Teacher Assignments: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/teacher-assignments/${testTeacherAssignmentId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isClassTeacher: false })
      });
      recordResult("Teacher Assignments: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Teacher Assignments: CRUD Flow", false, err.message);
  }

  // 13. Students & Enrollments CRUD
  try {
    // GET List
    let res = await fetch(`${BASE_URL}/api/students`, { headers: authHeaders });
    let data = await res.json();
    recordResult("Students: GET List", res.status === 200 && Array.isArray(data.students));

    // POST Create Student Profile
    res = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        firstName: "Bob",
        lastName: "Smith",
        gender: "Male",
        dob: "2011-05-15",
        bloodGroup: "A+",
        rollNumber: "102",
        class: "Grade 11",
        section: "A",
        category: "General",
        fatherName: "David Smith",
        motherName: "Emma Smith",
        phone: "9998887776",
        address: "123 Main St",
        loginUsername: "bobsmith",
        loginEmail: "bob@smith.com",
        loginPassword: "password123"
      })
    });
    data = await res.json();
    if (res.status === 201 && data.student && data.student._id) {
      testStudentProfileId = data.student._id;
      recordResult("Students: POST Create Profile", true);
    } else {
      recordResult("Students: POST Create Profile", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    // GET by ID
    if (testStudentProfileId) {
      res = await fetch(`${BASE_URL}/api/students/${testStudentProfileId}`, { headers: authHeaders });
      recordResult("Students: GET by ID", res.status === 200);

      // PUT Update
      res = await fetch(`${BASE_URL}/api/students/${testStudentProfileId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ firstName: "Bobby" })
      });
      recordResult("Students: PUT Update", res.status === 200);
    }

    // Enrollments
    res = await fetch(`${BASE_URL}/api/enrollments`, { headers: authHeaders });
    recordResult("Enrollments: GET List", res.status === 200);

    res = await fetch(`${BASE_URL}/api/enrollments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        student: testStudentProfileId || "mem-student-1",
        class: testClassId || "mem-class-1",
        section: testSectionId || "mem-section-1",
        academicYear: testYearId || "mem-year-1",
        rollNumber: "115",
        status: "Active"
      })
    });
    data = await res.json();
    const enrollObj = data.enrollment || data;
    if (res.status === 201 && enrollObj._id) {
      testEnrollmentId = enrollObj._id;
      recordResult("Enrollments: POST Create", true);
    } else {
      recordResult("Enrollments: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testEnrollmentId) {
      res = await fetch(`${BASE_URL}/api/enrollments/${testEnrollmentId}`, { headers: authHeaders });
      recordResult("Enrollments: GET by ID", res.status === 200);

      res = await fetch(`${BASE_URL}/api/enrollments/${testEnrollmentId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ rollNumber: "116" })
      });
      recordResult("Enrollments: PUT Update", res.status === 200);
    }

    // Promotions
    res = await fetch(`${BASE_URL}/api/promotions`, { headers: authHeaders });
    recordResult("Promotions: GET List", res.status === 200);

    res = await fetch(`${BASE_URL}/api/promotions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        studentId: testStudentProfileId || "mem-student-1",
        toClassId: "mem-class-2",
        toSectionId: "mem-section-2",
        toAcademicYearId: testYearId || "mem-year-1",
        rollNumber: "116",
        remarks: "Promoted to next grade"
      })
    });
    data = await res.json();
    const promoObj = data.promotionHistory || data.promotion || data;
    if (res.status === 201 && promoObj._id) {
      testPromotionId = promoObj._id;
      recordResult("Promotions: POST Create", true);
    } else {
      recordResult("Promotions: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }


  } catch (err) {
    recordResult("Students/Enrollment/Promotion: CRUD Flow", false, err.message);
  }

  // 14. Admissions CRUD
  try {
    // Public creation endpoint
    let res = await fetch(`${BASE_URL}/admission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: "Charlie Brown",
        desiredGrade: "Grade 1",
        email: "charlie@brown.com",
        parentName: "Mr. Brown",
        contactNumber: "9998886665",
        address: "456 Oak Ave",
        age: 6
      })
    });
    let data = await res.json();
    const admObj = data.admission || data;
    if (res.status === 201 && admObj._id) {
      testAdmissionId = admObj._id;
      recordResult("Admissions: Public POST Create", true);
    } else {
      recordResult("Admissions: Public POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    // Admin GET List
    res = await fetch(`${BASE_URL}/api/admissions`, { headers: authHeaders });
    recordResult("Admissions: GET List", res.status === 200);

    if (testAdmissionId) {
      // Admin GET by ID
      res = await fetch(`${BASE_URL}/api/admissions/${testAdmissionId}`, { headers: authHeaders });
      recordResult("Admissions: GET by ID", res.status === 200);

      // Admin PUT Update
      res = await fetch(`${BASE_URL}/api/admissions/${testAdmissionId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status: "Approved" })
      });
      recordResult("Admissions: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Admissions: CRUD Flow", false, err.message);
  }

  // 15. Attendance CRUD
  try {
    let res = await fetch(`${BASE_URL}/api/attendance?date=2026-07-17&class=Grade%2011&section=A`, { headers: authHeaders });
    recordResult("Attendance: GET List", res.status === 200);

    res = await fetch(`${BASE_URL}/api/attendance`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        date: "2026-07-17",
        class: "Grade 11",
        section: "A",
        records: [
          {
            student: testStudentProfileId || "mem-student-1",
            status: "Present"
          }
        ]
      })
    });
    let data = await res.json();
    const attObj = data.record || data.attendanceRecord || data.attendance || data;
    if ((res.status === 201 || res.status === 200) && attObj._id) {
      testAttendanceId = attObj._id;
      recordResult("Attendance: POST Create", true);
    } else {
      recordResult("Attendance: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }


  } catch (err) {
    recordResult("Attendance: CRUD Flow", false, err.message);
  }

  // 16. Fees CRUD
  try {
    let res = await fetch(`${BASE_URL}/api/fees`, { headers: authHeaders });
    recordResult("Fees: GET List", res.status === 200);

    res = await fetch(`${BASE_URL}/api/fees`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        student: testStudentProfileId || "mem-student-1",
        amount: 5000,
        dueDate: "2026-08-01",
        status: "Unpaid"
      })
    });
    let data = await res.json();
    const feeObj = data.invoice || data.fee || data;
    if (res.status === 201 && feeObj._id) {
      testFeeId = feeObj._id;
      recordResult("Fees: POST Create", true);
    } else {
      recordResult("Fees: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testFeeId) {
      res = await fetch(`${BASE_URL}/api/fees/${testFeeId}/pay`, {
        method: "POST",
        headers: authHeaders
      });
      recordResult("Fees: PUT Update", res.status === 200);
    }
  } catch (err) {
    recordResult("Fees: CRUD Flow", false, err.message);
  }

  // 17. Settings & CMS & Analytics & Activity Logs
  try {
    // Settings
    let res = await fetch(`${BASE_URL}/api/settings`, { headers: authHeaders });
    recordResult("Settings: GET", res.status === 200);

    res = await fetch(`${BASE_URL}/api/settings`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ schoolName: "Pareek Public English School 2026" })
    });
    recordResult("Settings: PUT", res.status === 200);

    // CMS
    res = await fetch(`${BASE_URL}/api/cms`, { headers: authHeaders });
    recordResult("CMS: GET", res.status === 200);

    res = await fetch(`${BASE_URL}/api/cms`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ key: "welcomeText", value: "Welcome to Pareek Public English School!" })
    });
    recordResult("CMS: PUT", res.status === 200);

    // Analytics
    res = await fetch(`${BASE_URL}/api/analytics`, { headers: authHeaders });
    recordResult("Analytics: GET", res.status === 200);

    // Activity Logs
    res = await fetch(`${BASE_URL}/api/activity-logs`, { headers: authHeaders });
    recordResult("Activity Logs: GET", res.status === 200);
  } catch (err) {
    recordResult("Settings/CMS/Analytics/Logs: Flow", false, err.message);
  }

  // 18. Toppers CRUD
  try {
    // GET list
    let res = await fetch(`${BASE_URL}/api/toppers`);
    let data = await res.json();
    recordResult("Toppers: GET List", res.status === 200 && Array.isArray(data));

    // POST Create
    res = await fetch(`${BASE_URL}/api/toppers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Topper Record",
        class: "Grade X",
        percentage: "96.5%",
        rank: "3rd Rank",
        color: "from-sky-400 to-blue-600"
      })
    });
    data = await res.json();
    if (res.status === 201 && data.topper && data.topper._id) {
      testTopperId = data.topper._id;
      recordResult("Toppers: POST Create", true);
    } else {
      recordResult("Toppers: POST Create", false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }

    if (testTopperId) {
      // PUT Update
      res = await fetch(`${BASE_URL}/api/toppers/${testTopperId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: "Updated Test Topper Record" })
      });
      data = await res.json();
      recordResult("Toppers: PUT Update", res.status === 200 && data.topper.name === "Updated Test Topper Record");
    }
  } catch (err) {
    recordResult("Toppers: CRUD Flow", false, err.message);
  }

  // 19. Integration Security Hardening (IDOR and Role Restrictions)
  try {
    console.log("🔒 Starting Security Hardening Integration Tests...");
    
    // Auth: Missing token (expect 401)
    let res = await fetch(`${BASE_URL}/api/students/mem-student-1`);
    recordResult("Security: Missing token yields 401", res.status === 401);

    // Auth: Invalid token (expect 401)
    res = await fetch(`${BASE_URL}/api/students/mem-student-1`, {
      headers: { "Authorization": "Bearer invalid_token_value_xyz" }
    });
    recordResult("Security: Invalid token yields 401", res.status === 401);

    // Student Login: alice@student.com
    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "alice@student.com", password: "student123" })
    });
    let data = await res.json();
    const aliceToken = data.token;
    recordResult("Security: Student Login (Alice)", res.status === 200 && !!aliceToken);

    const aliceHeaders = {
      "Authorization": `Bearer ${aliceToken}`,
      "Content-Type": "application/json"
    };

    // Student Alice accesses own profile (expect 200)
    res = await fetch(`${BASE_URL}/api/students/mem-student-1`, { headers: aliceHeaders });
    recordResult("Security: Student accesses own student profile (200)", res.status === 200);

    // Student Alice accesses another student's profile (expect 403)
    res = await fetch(`${BASE_URL}/api/students/mem-student-different-xyz`, { headers: aliceHeaders });
    recordResult("Security: Student accessing another profile yields 403", res.status === 403);

    // Student Alice updates own profile (expect 200)
    res = await fetch(`${BASE_URL}/api/students/mem-student-1`, {
      method: "PUT",
      headers: aliceHeaders,
      body: JSON.stringify({ firstName: "Alice" })
    });
    recordResult("Security: Student updates own profile (200)", res.status === 200);

    // Student Alice updates another student's profile (expect 403)
    res = await fetch(`${BASE_URL}/api/students/mem-student-different-xyz`, {
      method: "PUT",
      headers: aliceHeaders,
      body: JSON.stringify({ firstName: "Bob" })
    });
    recordResult("Security: Student updating another profile yields 403", res.status === 403);

    // Student Alice lists student profile index (expect 403)
    res = await fetch(`${BASE_URL}/api/students`, { headers: aliceHeaders });
    recordResult("Security: Student querying full student listing yields 403", res.status === 403);

    // Student Alice accesses admin-only config (expect 403)
    res = await fetch(`${BASE_URL}/api/settings`, { headers: aliceHeaders });
    recordResult("Security: Student accessing settings yields 403", res.status === 403);

    // Teacher Login: teacher@pareek.edu
    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teacher@pareek.edu", password: "student123" }) // seeded with studentPasswordHash
    });
    data = await res.json();
    const teacherToken = data.token;
    recordResult("Security: Teacher Login (Feynman)", res.status === 200 && !!teacherToken);

    const teacherHeaders = {
      "Authorization": `Bearer ${teacherToken}`,
      "Content-Type": "application/json"
    };

    // Teacher Feynman accesses own profile (expect 200)
    res = await fetch(`${BASE_URL}/api/teachers/mem-teacher-1`, { headers: teacherHeaders });
    recordResult("Security: Teacher accesses own teacher profile (200)", res.status === 200);

    // Teacher Feynman accesses another teacher profile (expect 403)
    res = await fetch(`${BASE_URL}/api/teachers/mem-teacher-different-xyz`, { headers: teacherHeaders });
    recordResult("Security: Teacher accessing another teacher profile yields 403", res.status === 403);

    // Teacher Feynman accesses permitted student profile (expect 200)
    res = await fetch(`${BASE_URL}/api/students/mem-student-1`, { headers: teacherHeaders });
    recordResult("Security: Teacher accessing student profile (200)", res.status === 200);

    // Teacher Feynman accesses admin-only settings (expect 403)
    res = await fetch(`${BASE_URL}/api/settings`, { headers: teacherHeaders });
    recordResult("Security: Teacher accessing settings yields 403", res.status === 403);

    // Suspended user login (expect 403 Suspended)
    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "suspended_alice@student.com", password: "student123" })
    });
    data = await res.json();
    const suspendedToken = data.token;
    if (res.status === 200 && suspendedToken) {
      res = await fetch(`${BASE_URL}/api/students/mem-student-1`, {
        headers: { "Authorization": `Bearer ${suspendedToken}` }
      });
      recordResult("Security: Suspended account access yields 403", res.status === 403);
    } else {
      recordResult("Security: Suspended account access yields 403", true);
    }

  } catch (err) {
    recordResult("Security: Hardening flow", false, err.message);
  }

  // Final Cleanup (Deletes)
  console.log("🧹 Performing test records cleanup...");
  const cleanupTasks = [
    { name: "Enrollment DELETE", path: `/api/enrollments/${testEnrollmentId}` },
    { name: "Teacher Assignment DELETE", path: `/api/teacher-assignments/${testTeacherAssignmentId}` },
    { name: "Subject Assignment DELETE", path: `/api/subject-assignments/${testSubjectAssignmentId}` },
    { name: "Subject DELETE", path: `/api/academic-subjects/${testSubjectId}` },
    { name: "Section DELETE", path: `/api/sections/${testSectionId}` },
    { name: "Class DELETE", path: `/api/classes/${testClassId}` },
    { name: "Academic Year DELETE", path: `/api/academic-years/${testYearId}` },
    { name: "Academic Session DELETE", path: `/api/academic-sessions/${testSessionId}` },
    { name: "Teacher DELETE", path: `/api/teachers/${testTeacherId}` },
    { name: "Admission DELETE", path: `/api/admissions/${testAdmissionId}` },
    { name: "Topper DELETE", path: `/api/toppers/${testTopperId}` }
  ];

  for (const task of cleanupTasks) {
    const id = task.path.split("/").pop();
    if (!id || id === "undefined" || id.startsWith("mem-session") || id.startsWith("mem-year")) continue;
    try {
      const res = await fetch(`${BASE_URL}${task.path}`, {
        method: "DELETE",
        headers: authHeaders
      });
      if (res.status !== 200) {
        console.warn(`⚠️ Warning: Cleanup of ${task.name} returned status ${res.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ Warning: Cleanup of ${task.name} failed: ${err.message}`);
    }
  }

  // Final summary
  console.log("\n====================================");
  console.log("📝 TEST SUMMARY STATUS:");
  console.log("====================================");
  let passedCount = 0;
  for (const r of results) {
    console.log(`${r.success ? "✅" : "❌"} ${r.testName}${r.details ? ` - ${r.details}` : ""}`);
    if (r.success) passedCount++;
  }
  console.log(`\nResult: ${passedCount}/${results.length} tests passed.`);
  if (global.testsFailed) {
    console.log("❌ SOME CONTROLLERS OR ENDPOINTS ARE NOT WORKING CORRECTLY.");
  } else {
    console.log("✅ ALL CONTROLLERS ARE WORKING CORRECTLY!");
  }
}
