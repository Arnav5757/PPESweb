import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  GraduationCap, User, LogOut, CheckCircle, Clock, 
  BookOpen, Calendar, Mail, Phone, MapPin, Edit, Save, Bell 
} from "lucide-react";
import PortalLayout from "../../layouts/PortalLayout";
import { useAuth } from "../../hooks/useAuth";
import { studentService } from "../../services/studentService";
import { noticeService } from "../../services/noticeService";

export const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ email: "", phone: "", address: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  useEffect(() => {
    if (!token || !user || user.role !== "student") {
      logout();
      navigate("/portal");
      return;
    }

    const fetchData = async () => {
      try {
        const studentData = await studentService.getStudentDashboard();
        setStudent(studentData);
        setProfileData({
          email: studentData.email || "",
          phone: studentData.phone || "",
          address: studentData.address || ""
        });

        const noticesData = await noticeService.getNotices();
        setNotices(noticesData.reverse());
      } catch (err) {
        setError("Error logging into dashboard data feed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate, logout]);

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    try {
      const data = await studentService.updateStudentDashboardProfile(profileData);
      setStudent({ ...student, ...data.profile });
      setIsEditingProfile(false);
      setProfileMessage("Profile contacts updated successfully ✅");
      setTimeout(() => setProfileMessage(""), 4000);
    } catch (err) {
      setProfileMessage("Profile update failed. Try again. ❌");
    }
  };

  const handleAssignmentSubmit = async (assignmentId) => {
    try {
      const data = await studentService.submitAssignment(assignmentId);
      setStudent(data.student);
    } catch (err) {
      console.log("Error submitting assignment:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="space-y-4">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-widest uppercase">Opening Student Ledger...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-550 p-6">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold">{error}</p>
          <button 
            onClick={handleLogoutClick} 
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-750 text-xs font-bold uppercase hover:bg-slate-50 cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const radius = 35;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const attendance = student?.attendance || 85;
  const strokeDashoffset = circumference - (attendance / 100) * circumference;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-slate-50 text-slate-850 font-sans flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-extrabold font-display leading-none">PAREEK ACADEMY</h1>
              <p className="text-[9px] text-slate-550 font-bold tracking-wider uppercase mt-1">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Portal Session Active</span>
            <button 
              onClick={handleLogoutClick}
              className="px-4 py-2 rounded-full border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer"
            >
              Logout <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto p-6 md:p-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Welcome */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold font-display text-slate-900">Welcome back, {student?.name}</h2>
                <p className="text-xs text-slate-500 font-light">Enrollment Status: <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">{student?.status}</span></p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5 font-bold">Grade Level</p>
                  <p className="font-extrabold text-slate-800 text-sm">{student?.class}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5 font-bold">Age Index</p>
                  <p className="font-extrabold text-slate-800 text-sm">{student?.age} Yrs</p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between gap-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Metric</h4>
                  <h3 className="text-2xl font-bold font-display text-slate-800">{attendance}% Ratio</h3>
                  <p className="text-[11px] text-slate-550 font-light leading-relaxed">
                    Required academic minimum is 75% for exam eligibility.
                  </p>
                </div>
                
                {/* Circular Attendance */}
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r={radius} 
                      stroke="#0f172a" 
                      strokeWidth={strokeWidth} 
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-800">{attendance}%</span>
                </div>
              </div>

              {/* Coursework Tracker */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between gap-6">
                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Assignments</h4>
                  <h3 className="text-2xl font-bold font-display text-slate-800">
                    {student?.assignments?.filter(a => a.status === "assigned").length || 0} Pending
                  </h3>
                  <p className="text-[11px] text-slate-550 font-light leading-relaxed">
                    Please submit current coursework before deadlines.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Academic Results table */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900 font-display">Academic Reports</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-bold">Subject</th>
                      <th className="pb-3 font-bold text-center">Marks</th>
                      <th className="pb-3 font-bold text-center">Percentage</th>
                      <th className="pb-3 font-bold text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {student?.results?.map((res, i) => {
                      const pct = Math.round((res.marks / res.maxMarks) * 100);
                      let grade = "C";
                      if (pct >= 90) grade = "A+";
                      else if (pct >= 80) grade = "A";
                      else if (pct >= 70) grade = "B+";
                      else if (pct >= 60) grade = "B";

                      return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-800">{res.subject}</td>
                          <td className="py-3 text-center">{res.marks} / {res.maxMarks}</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-semibold text-slate-755">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-bold text-slate-800">{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignments List */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900 font-display">Assigned Projects</h3>
              </div>

              <div className="space-y-3">
                {student?.assignments?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No assignments cataloged.</p>
                ) : (
                  student?.assignments?.map((as) => (
                    <div 
                      key={as._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{as.title}</h4>
                        <p className="text-[11px] text-slate-550 font-light leading-relaxed">{as.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-bold tracking-wider text-slate-450 uppercase">
                          <span>Due: {as.dueDate}</span>
                          <span>•</span>
                          <span className={as.status === "submitted" ? "text-slate-600" : "text-amber-600"}>{as.status}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {as.status === "assigned" ? (
                          <button
                            onClick={() => handleAssignmentSubmit(as._id)}
                            className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Submit
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider border border-slate-200 bg-white px-3.5 py-1.5 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-600" /> Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Contact Details */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display">Contact Deck</h3>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-[10px] font-bold text-slate-405 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  {isEditingProfile ? "Cancel" : "Edit"}
                </button>
              </div>

              {profileMessage && (
                <p className="text-[10px] font-bold text-slate-800">{profileMessage}</p>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs text-left">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Portal Email</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Index</label>
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Residential Location</label>
                    <textarea 
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      rows="2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Save Contacts
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-xs text-slate-500 font-light">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{student?.email || "No Email Registered"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{student?.phone || "No Phone Registered"}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{student?.address || "No Address Registered"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* School Bulletins */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bell className="w-5 h-5 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display">Portal Bulletin</h3>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {notices.map((n, i) => (
                  <div key={n._id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-1 hover:border-slate-350 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{n.category || "Notice"}</span>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{n.title}</h4>
                    <p className="text-[10px] text-slate-550 font-light leading-relaxed">{n.content}</p>
                    <p className="text-[9px] text-slate-400 text-right">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
