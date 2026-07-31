import React, { useState } from "react";
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
  User, Mail, Phone, Calendar, BookOpen, Clock, FileText, Download,
  LayoutGrid, List, Award, Hash, ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

// Avatar gradient variations matching the Toppers section style
const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-rose-400 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-indigo-400 to-purple-600",
  "from-violet-400 to-fuchsia-600",
  "from-cyan-400 to-blue-500",
];

const CARD_TOP_BORDERS = [
  "border-t-sky-500",
  "border-t-rose-500",
  "border-t-emerald-500",
  "border-t-amber-500",
  "border-t-indigo-500",
  "border-t-violet-500",
  "border-t-cyan-500",
];

export const Students = ({
  students = [],
  currentPage,
  totalPages,
  totalStudentsCount,
  classFilter,
  setClassFilter,
  sectionFilter,
  setSectionFilter,
  academicYearFilter,
  setAcademicYearFilter,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  openAddStudentModal,
  openEditStudentModal,
  handleDeleteStudent
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

  // Client-side export helper
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = "AdmissionNumber,RollNumber,Name,Class,Section,Gender,Phone,Status\n";
    const rows = students.map(s => 
      `"${s.admissionNumber}","${s.rollNumber}","${s.name}","${s.class}","${s.section}","${s.gender}","${s.phone}","${s.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Pareek_Students_Export_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  const getInitials = (stud) => {
    if (stud.firstName && stud.lastName) {
      return `${stud.firstName[0]}${stud.lastName[0]}`.toUpperCase();
    }
    if (stud.name) {
      const parts = stud.name.split(" ");
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return stud.name.slice(0, 2).toUpperCase();
    }
    return "ST";
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Student Directory</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
            Review, register, and manage active student records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button onClick={openAddStudentModal} className="gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters & View Mode Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, adm number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>
          
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-750 focus:outline-none"
          >
            <option value="">All Classes</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-750 focus:outline-none"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-755 focus:outline-none"
          >
            <option value="name-asc">Sort: Name A-Z</option>
            <option value="name-desc">Sort: Name Z-A</option>
            <option value="rollNumber-asc">Sort: Roll No (Low-High)</option>
            <option value="rollNumber-desc">Sort: Roll No (High-Low)</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "grid" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "table" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid / Table Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Student List Container */}
        <div className={selectedStudent ? "xl:col-span-7 space-y-6" : "xl:col-span-12 space-y-6"}>
          
          {students.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-250 rounded-2xl bg-white space-y-3">
              <User className="w-10 h-10 text-slate-350 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No student records found</p>
              <p className="text-xs text-slate-450">Try adjusting your filters or search query.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW (Topper Section Card Style) */
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedStudent ? "lg:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-6`}>
              {students.map((stud, idx) => {
                const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                const borderTopColor = CARD_TOP_BORDERS[idx % CARD_TOP_BORDERS.length];
                const isSelected = selectedStudent?._id === stud._id;

                return (
                  <div
                    key={stud._id}
                    onClick={() => { setSelectedStudent(stud); setActiveProfileTab("personal"); }}
                    className={`group p-5 rounded-2xl border-t-4 border-x border-b bg-white hover:border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_35px_rgba(15,23,42,0.05)] hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between relative overflow-hidden cursor-pointer ${borderTopColor} ${
                      isSelected 
                        ? "ring-2 ring-blue-500 border-blue-400 bg-slate-50/50 shadow-md" 
                        : "border-slate-150"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                        stud.status === "Active" || stud.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {stud.status === "approved" ? "Active" : stud.status || "Active"}
                      </span>
                    </div>

                    {/* Admission Number Pill */}
                    <div className="absolute top-3 left-3 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      ADM: #{stud.admissionNumber}
                    </div>

                    {/* Card Center Content */}
                    <div className="space-y-3.5 flex flex-col items-center pt-5">
                      {/* Photo / Gradient Avatar */}
                      {stud.photo ? (
                        <img 
                          src={stud.photo} 
                          alt={stud.name} 
                          className="w-20 h-20 rounded-full object-cover border-2 border-slate-150 shadow-sm group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-extrabold text-2xl shadow-inner border border-white/20 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}>
                          <span className="relative z-10 font-display">{getInitials(stud)}</span>
                          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                        </div>
                      )}

                      {/* Name & Class Info */}
                      <div className="space-y-1 w-full px-2">
                        <h3 className="text-sm font-bold text-slate-900 font-display line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {stud.name}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-[11px] font-semibold text-slate-700">
                          <span>{stud.class}</span>
                          <span className="text-slate-300">•</span>
                          <span>Sec {stud.section}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Stats Footer */}
                    <div className="w-full pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Roll No</span>
                        <span className="font-extrabold text-slate-800 font-display">{stud.rollNumber || "-"}</span>
                      </div>
                      <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Gender</span>
                        <span className="font-extrabold text-slate-800 font-display">{stud.gender || "-"}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-1.5 w-full mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelectedStudent(stud); setActiveProfileTab("personal"); }}
                        className="flex-1 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="View Full Profile"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => openEditStudentModal(stud)}
                        className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Edit Student"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(stud._id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="p-4 font-bold">Photo</th>
                      <th className="p-4 font-bold">Adm Number</th>
                      <th className="p-4 font-bold">Student Name</th>
                      <th className="p-4 font-bold">Class</th>
                      <th className="p-4 font-bold">Section</th>
                      <th className="p-4 font-bold text-center">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {students.map((stud) => (
                      <tr key={stud._id} className={`hover:bg-slate-50/40 transition-all ${selectedStudent?._id === stud._id ? "bg-slate-50/70" : ""}`}>
                        <td className="p-4">
                          {stud.photo ? (
                            <img src={stud.photo} alt={stud.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                              {getInitials(stud)}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{stud.admissionNumber}</td>
                        <td className="p-4 font-bold text-slate-900">{stud.name}</td>
                        <td className="p-4">{stud.class}</td>
                        <td className="p-4">Sec {stud.section}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                            stud.status === "Active" || stud.status === "approved"
                              ? "bg-emerald-50 text-emerald-750 border border-emerald-200"
                              : "bg-red-50 text-red-750 border border-red-200"
                          }`}>
                            {stud.status === "approved" ? "Active" : stud.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => { setSelectedStudent(stud); setActiveProfileTab("personal"); }}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                              title="Inspect dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => openEditStudentModal(stud)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                              title="Edit profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(stud._id)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                              title="Delete profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing {(currentPage - 1) * 8 + 1} - {Math.min(currentPage * 8, totalStudentsCount)} of {totalStudentsCount}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-700 font-bold px-1.5">Page {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Profile View on Right */}
        {selectedStudent && (
          <div className="xl:col-span-5 sticky top-6">
            <Card className="p-6 border-slate-200/60 bg-white space-y-6 shadow-md">
              {/* Header profile cards */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-lg border border-white/20 shadow-sm">
                    {getInitials(selectedStudent)}
                  </div>
                )}
                <div className="text-left space-y-1">
                  <h3 className="font-extrabold text-slate-900 font-display text-base leading-tight">{selectedStudent.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Adm Number: {selectedStudent.admissionNumber}</p>
                  <div className="flex gap-1.5 pt-1">
                    <span className="text-[8px] bg-slate-150 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase text-slate-700">
                      {selectedStudent.class} - {selectedStudent.section}
                    </span>
                    <span className="text-[8px] bg-slate-150 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase text-slate-700">
                      Roll: {selectedStudent.rollNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-slate-100 gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {[
                  { id: "personal", label: "Profile" },
                  { id: "parent", label: "Parent" },
                  { id: "academic", label: "Grades" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${
                      activeProfileTab === tab.id
                        ? "border-slate-900 text-slate-950"
                        : "border-transparent hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="space-y-4 text-left text-xs leading-relaxed">
                {activeProfileTab === "personal" && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px] w-28">Gender</td><td className="py-2.5 text-slate-800">{selectedStudent.gender}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Date of Birth</td><td className="py-2.5 text-slate-800">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "-"}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Blood Group</td><td className="py-2.5 text-slate-800">{selectedStudent.bloodGroup}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Category</td><td className="py-2.5 text-slate-800">{selectedStudent.category}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Aadhaar Number</td><td className="py-2.5 text-slate-800">{selectedStudent.aadhaarNumber || "None"}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Religion</td><td className="py-2.5 text-slate-800">{selectedStudent.religion || "None"}</td></tr>
                    </tbody>
                  </table>
                )}

                {activeProfileTab === "parent" && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px] w-28">Father Name</td><td className="py-2.5 text-slate-800">{selectedStudent.fatherName}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Mother Name</td><td className="py-2.5 text-slate-800">{selectedStudent.motherName}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Parent Contact</td><td className="py-2.5 text-slate-800">{selectedStudent.phone}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Parent Email</td><td className="py-2.5 text-slate-800 truncate block">{selectedStudent.parentEmail || "None"}</td></tr>
                      <tr><td className="py-2.5 font-bold text-slate-400 uppercase text-[9px]">Address</td><td className="py-2.5 text-slate-800">{selectedStudent.address}</td></tr>
                    </tbody>
                  </table>
                )}

                {activeProfileTab === "academic" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Attendance Ratio</span>
                        <span className="text-lg font-black font-display text-slate-900">{selectedStudent.attendance || 85}%</span>
                      </div>
                      <Clock className="w-6 h-6 text-slate-400 stroke-[1.2]" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Grades Overview</span>
                      {selectedStudent.results && selectedStudent.results.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedStudent.results.map((res, i) => (
                            <div key={i} className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                              <span className="font-semibold truncate max-w-[100px]">{res.subject}</span>
                              <span className="font-bold text-slate-900">{res.marks}/{res.maxMarks}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic py-2">No grade results loaded yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Close Drawer Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>Close details</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

