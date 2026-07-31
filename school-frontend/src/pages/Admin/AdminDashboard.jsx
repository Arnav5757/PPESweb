import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, LayoutDashboard, Users, UserCheck, Bell, Image as ImageIcon, LogOut, 
  Trash2, UserPlus, Save, Edit, Eye, Filter, ChevronLeft, ChevronRight, 
  User, Calendar, BookOpen, Clock, Heart, Award, Plus, Search, ArrowRight, XCircle,
  Sliders, Activity, BarChart2, CreditCard, ShieldCheck, GraduationCap
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import { studentService } from "../../services/studentService";
import { noticeService } from "../../services/noticeService";
import { galleryService } from "../../services/galleryService";
import { analyticsService } from "../../services/analyticsService";
import { activityLogService } from "../../services/activityLogService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

// Import modules
import { Overview } from "./modules/Overview";
import { Admissions } from "./modules/Admissions";
import { Students } from "./modules/Students";
import { Teachers } from "./modules/Teachers";
import { Attendance } from "./modules/Attendance";
import { Results } from "./modules/Results";
import { WebsiteContent } from "./modules/WebsiteContent";
import { CMS } from "./modules/CMS";
import { Analytics } from "./modules/Analytics";
import { Fees } from "./modules/Fees";
import { Settings } from "./modules/Settings";
import { ActivityLogs } from "./modules/ActivityLogs";
import { AcademicManagement } from "./modules/AcademicManagement";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Student Ledger States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Action States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFormId, setStudentFormId] = useState(null);
  
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    dob: "",
    bloodGroup: "O+",
    aadhaarNumber: "",
    category: "General",
    religion: "",
    photo: "",
    rollNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],
    academicYear: "2025-2026",
    class: "Grade 11",
    section: "A",
    house: "",
    fatherName: "",
    motherName: "",
    phone: "",
    alternateContact: "",
    parentEmail: "",
    occupation: "",
    address: "",
    loginUsername: "",
    loginEmail: "",
    loginPassword: ""
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { token, user: adminUser, logout } = useAuth();

  useEffect(() => {
    if (!token || !adminUser || adminUser.role !== "admin") {
      logout();
      navigate("/admin/login");
      return;
    }
    fetchAllData();
  }, [token, adminUser, navigate]);

  // Refetch students when query parameters change
  useEffect(() => {
    if (activeTab === "students") {
      fetchStudentLedger();
    }
  }, [currentPage, searchQuery, classFilter, sectionFilter, academicYearFilter, sortBy, sortOrder, activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);

      const logsData = await activityLogService.getActivityLogs();
      setRecentLogs(logsData.logs || []);

      const applicantsData = await studentService.getStudents({ limit: 10 });
      setRecentAdmissions(applicantsData.students?.filter(s => s.status === "pending") || []);

      await fetchStudentLedger();
    } catch (err) {
      setError("Error synchronizing admin databases.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLedger = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 8,
        search: searchQuery,
        class: classFilter,
        section: sectionFilter,
        academicYear: academicYearFilter,
        sortBy,
        sortOrder
      };

      const data = await studentService.getStudents(params);
      setStudents(data.students || []);
      setTotalStudentsCount(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Error loading student database:", err);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);
      
      const logsData = await activityLogService.getActivityLogs();
      setRecentLogs(logsData.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  const handleStudentPhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setStudentForm({ ...studentForm, photo: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const openAddStudentModal = () => {
    setIsEditMode(false);
    setStudentFormId(null);
    setFormError("");
    setFormSuccess("");
    setStudentForm({
      firstName: "",
      lastName: "",
      gender: "Male",
      dob: "",
      bloodGroup: "O+",
      aadhaarNumber: "",
      category: "General",
      religion: "",
      photo: "",
      rollNumber: "",
      admissionDate: new Date().toISOString().split("T")[0],
      academicYear: "2025-2026",
      class: "Grade 11",
      section: "A",
      house: "",
      fatherName: "",
      motherName: "",
      phone: "",
      alternateContact: "",
      parentEmail: "",
      occupation: "",
      address: "",
      loginUsername: "",
      loginEmail: "",
      loginPassword: ""
    });
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (studentObj) => {
    setIsEditMode(true);
    setStudentFormId(studentObj._id);
    setFormError("");
    setFormSuccess("");
    
    const formattedDob = studentObj.dob ? new Date(studentObj.dob).toISOString().split("T")[0] : "";
    const formattedAdmissionDate = studentObj.admissionDate ? new Date(studentObj.admissionDate).toISOString().split("T")[0] : "";

    setStudentForm({
      firstName: studentObj.firstName || "",
      lastName: studentObj.lastName || "",
      gender: studentObj.gender || "Male",
      dob: formattedDob,
      bloodGroup: studentObj.bloodGroup || "O+",
      aadhaarNumber: studentObj.aadhaarNumber || "",
      category: studentObj.category || "General",
      religion: studentObj.religion || "",
      photo: studentObj.photo || "",
      rollNumber: studentObj.rollNumber || "",
      admissionDate: formattedAdmissionDate,
      academicYear: studentObj.academicYear || "2025-2026",
      class: studentObj.class || "Grade 11",
      section: studentObj.section || "A",
      house: studentObj.house || "",
      fatherName: studentObj.fatherName || "",
      motherName: studentObj.motherName || "",
      phone: studentObj.phone || "",
      alternateContact: studentObj.alternateContact || "",
      parentEmail: studentObj.parentEmail || "",
      occupation: studentObj.occupation || "",
      address: studentObj.address || "",
      loginUsername: "", 
      loginEmail: studentObj.parentEmail || "",
      loginPassword: ""
    });
    setIsStudentModalOpen(true);
  };

  const handleStudentFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      if (isEditMode) {
        await studentService.updateStudent(studentFormId, studentForm);
        setFormSuccess("Student profile updated successfully ✅");
      } else {
        await studentService.createStudent(studentForm);
        setFormSuccess("Student account created successfully ✅");
      }
      
      fetchStudentLedger();
      refreshAnalytics();
      setTimeout(() => {
        setIsStudentModalOpen(false);
      }, 1500);
    } catch (err) {
      setFormError(err.message || "An error occurred while saving student info.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student record?")) return;
    try {
      await studentService.deleteStudent(studentId);
      fetchStudentLedger();
      refreshAnalytics();
    } catch (err) {
      console.log("Error deleting student:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="space-y-4">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Syncing Administration Node...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "academics", label: "Academics", icon: GraduationCap },
    { id: "admissions", label: "Admissions", icon: UserPlus },
    { id: "students", label: "Students", icon: Users },
    { id: "teachers", label: "Teachers", icon: UserCheck },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "results", label: "Results", icon: BookOpen },
    { id: "website-content", label: "Website Content", icon: ImageIcon },
    { id: "cms", label: "Website CMS", icon: Activity },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "fees", label: "Fees", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Sliders },
    { id: "activity-logs", label: "Activity Logs", icon: ShieldCheck }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col lg:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col justify-between text-left">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-widest font-display text-slate-900 leading-none">PAREEK ERP</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Admin Panel</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
              {sidebarLinks.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedStudent(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 text-left cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white border border-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-950 hover:bg-slate-100/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-8">
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">{adminUser?.name}</p>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Administrator</span>
            </div>
            <button 
              onClick={handleLogoutClick}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-650 transition-all cursor-pointer focus:outline-none"
              title="Secure Exit"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-screen">
          {activeTab === "overview" && (
            <Overview 
              analytics={analytics} 
              recentLogs={recentLogs} 
              recentAdmissions={recentAdmissions}
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === "admissions" && <Admissions />}

          {activeTab === "students" && (
            <Students
              students={students}
              currentPage={currentPage}
              totalPages={totalPages}
              totalStudentsCount={totalStudentsCount}
              classFilter={classFilter}
              setClassFilter={setClassFilter}
              sectionFilter={sectionFilter}
              setSectionFilter={setSectionFilter}
              academicYearFilter={academicYearFilter}
              setAcademicYearFilter={setAcademicYearFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setCurrentPage={setCurrentPage}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              openAddStudentModal={openAddStudentModal}
              openEditStudentModal={openEditStudentModal}
              handleDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === "teachers" && <Teachers />}
          {activeTab === "attendance" && <Attendance />}
          {activeTab === "results" && <Results />}
          {activeTab === "website-content" && <WebsiteContent />}
          {activeTab === "cms" && <CMS />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "fees" && <Fees />}
          {activeTab === "settings" && <Settings />}
          {activeTab === "activity-logs" && <ActivityLogs />}
          {activeTab === "academics" && <AcademicManagement />}
        </main>

        {/* ADD / EDIT STUDENT MODAL */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsStudentModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl z-10 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-slate-800" />
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    {isEditMode ? "Modify Student Profile" : "Register New Student"}
                  </h3>
                </div>
                <button onClick={() => setIsStudentModalOpen(false)} className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {formError && <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-semibold">{formError}</div>}
              {formSuccess && <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

              <form onSubmit={handleStudentFormSubmit} className="space-y-8 text-xs text-slate-700">
                {/* 1. PERSONAL */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-1.5 font-display">1. Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-400 relative">
                        {studentForm.photo ? (
                          <img src={studentForm.photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 stroke-[1.2]" />
                        )}
                      </div>
                      <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 uppercase cursor-pointer transition-colors">
                        Select Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleStudentPhotoChange} />
                      </label>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="First Name *" required value={studentForm.firstName} onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })} />
                      <Input label="Last Name *" required value={studentForm.lastName} onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })} />
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Gender *</label>
                        <select value={studentForm.gender} onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Date of Birth *</label>
                        <input type="date" required value={studentForm.dob} onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Blood Group *</label>
                        <select value={studentForm.bloodGroup} onChange={e => setStudentForm({ ...studentForm, bloodGroup: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Category *</label>
                        <select value={studentForm.category} onChange={e => setStudentForm({ ...studentForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>
                      <Input label="Aadhaar Number (Optional)" value={studentForm.aadhaarNumber} onChange={e => setStudentForm({ ...studentForm, aadhaarNumber: e.target.value })} />
                      <Input label="Religion (Optional)" value={studentForm.religion} onChange={e => setStudentForm({ ...studentForm, religion: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* 2. ACADEMIC */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-1.5 font-display">2. Academic Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Input label="Roll Number *" required value={studentForm.rollNumber} onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })} />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Class Level *</label>
                      <select value={studentForm.class} onChange={e => setStudentForm({ ...studentForm, class: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                        {Array.from({ length: 12 }).map((_, i) => <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Section *</label>
                      <select value={studentForm.section} onChange={e => setStudentForm({ ...studentForm, section: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Academic Year *</label>
                      <select value={studentForm.academicYear} onChange={e => setStudentForm({ ...studentForm, academicYear: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none">
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. PARENT */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-1.5 font-display">3. Parent & Contacts Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Input label="Father's Name *" required value={studentForm.fatherName} onChange={e => setStudentForm({ ...studentForm, fatherName: e.target.value })} />
                    <Input label="Mother's Name *" required value={studentForm.motherName} onChange={e => setStudentForm({ ...studentForm, motherName: e.target.value })} />
                    <Input label="Parent Contact Number *" required value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} />
                    <Input label="Parent Email" type="email" value={studentForm.parentEmail} onChange={e => setStudentForm({ ...studentForm, parentEmail: e.target.value })} />
                    <div className="sm:col-span-2">
                      <Input label="Residential Address *" required value={studentForm.address} onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* 4. PORTAL CREDENTIALS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-1.5 font-display">4. Portal Credentials & Login Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Username" placeholder="e.g. alice" value={studentForm.loginUsername} onChange={e => setStudentForm({ ...studentForm, loginUsername: e.target.value })} />
                    <Input label="Login Email" type="email" placeholder="e.g. alice@student.com" value={studentForm.loginEmail} onChange={e => setStudentForm({ ...studentForm, loginEmail: e.target.value })} />
                    <Input label="Portal Password" type="password" placeholder="••••••••" value={studentForm.loginPassword} onChange={e => setStudentForm({ ...studentForm, loginPassword: e.target.value })} />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                  <Button variant="outline" size="sm" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Student Record</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
