import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, Check, X, Eye, FileText, Search, UserPlus, Filter, Calendar, BookOpen, User, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, AlertCircle
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { admissionService } from "../../../services/admissionService";
import { academicService } from "../../../services/academicService";

export const Admissions = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  // Dynamic academic lookups for enrolling
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Approval form modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveForm, setApproveForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    dob: "",
    bloodGroup: "O+",
    category: "General",
    religion: "",
    rollNumber: "",
    section: "A",
    academicYear: "2025-2026",
    house: "",
    fatherName: "",
    motherName: "",
    phone: "",
    alternateContact: "",
    parentEmail: "",
    occupation: "",
    address: "",
    createPortalAccount: true,
    loginUsername: "",
    loginEmail: "",
    loginPassword: "student123"
  });
  const [approveError, setApproveError] = useState("");
  const [approveSuccess, setApproveSuccess] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject remarks modal states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        search: searchQuery
      };
      if (statusFilter) params.status = statusFilter;
      
      const data = await admissionService.getAdmissions(params);
      setApplicants(data.admissions || []);
    } catch (err) {
      console.error("Error fetching admissions applications:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Load lookups for the enrollment form
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [clsRes, secRes, yrRes] = await Promise.all([
          academicService.getClasses({ limit: 100 }),
          academicService.getSections({ limit: 100 }),
          academicService.getYears({ limit: 100 })
        ]);
        setClasses(clsRes.classes || []);
        setSections(secRes.sections || []);
        setAcademicYears(yrRes.years || []);
      } catch (err) {
        console.error("Error loading lookups for admissions modal:", err);
      }
    };
    loadLookups();
  }, []);

  const openApproveModal = (applicant) => {
    // Attempt intelligent split of full name
    const nameParts = (applicant.studentName || "").trim().split(/\s+/);
    const first = nameParts[0] || "";
    const last = nameParts.slice(1).join(" ") || "";
    
    // Auto-generate standard portal username
    const cleanFirst = first.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, "").split(" ")[0] || "";
    const generatedUsername = cleanLast ? `${cleanFirst}.${cleanLast}` : cleanFirst;

    setApproveForm({
      firstName: first,
      lastName: last || "Kumar",
      gender: "Male",
      dob: "",
      bloodGroup: "O+",
      category: "General",
      religion: "Hinduism",
      rollNumber: "",
      section: "A",
      academicYear: "2025-2026",
      house: "",
      fatherName: applicant.parentName || "",
      motherName: "",
      phone: applicant.contactNumber || "",
      alternateContact: "",
      parentEmail: applicant.email || "",
      occupation: "",
      address: applicant.address || "",
      createPortalAccount: true,
      loginUsername: generatedUsername,
      loginEmail: applicant.email || "",
      loginPassword: "student123"
    });
    setApproveError("");
    setApproveSuccess("");
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setApproveError("");
    setApproveSuccess("");
    setApproveLoading(true);

    try {
      const payload = { ...approveForm };
      if (!payload.createPortalAccount) {
        delete payload.loginUsername;
        delete payload.loginEmail;
        delete payload.loginPassword;
      }
      
      const response = await admissionService.approveAdmission(selectedApplicant._id, payload);
      setApproveSuccess(response.message || "Student enrolled successfully! ✅");
      
      setTimeout(() => {
        setIsApproveModalOpen(false);
        setSelectedApplicant(null);
        fetchApplicants();
      }, 1500);
    } catch (err) {
      setApproveError(err.message || "Enrollment validation failed. Please check inputs.");
    } finally {
      setApproveLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectRemarks("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setRejectLoading(true);
    try {
      await admissionService.rejectAdmission(rejectId, { adminRemarks: rejectRemarks });
      setIsRejectModalOpen(false);
      setSelectedApplicant(null);
      fetchApplicants();
    } catch (err) {
      console.error(err);
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this application log?")) return;
    try {
      await admissionService.deleteAdmission(id);
      setSelectedApplicant(null);
      fetchApplicants();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Admission Applications</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
            Review registration requests and manage student enrollments
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="enrolled">Enrolled / Archive</option>
            <option value="">All Applications</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchApplicants}>Refresh</Button>
        </div>
      </div>

      {/* List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Applications List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border-slate-200/60 bg-white">
            {loading ? (
              <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Synchronizing applications...</p>
            ) : applicants.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-xs">No matching applications registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-bold">Applicant Name</th>
                      <th className="pb-3 font-bold">Desired Class</th>
                      <th className="pb-3 font-bold text-center">Status</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {applicants.map((item) => (
                      <tr key={item._id} className={`hover:bg-slate-50/50 transition-colors ${selectedApplicant?._id === item._id ? "bg-slate-50/80" : ""}`}>
                        <td className="py-3 font-semibold text-slate-800">{item.studentName}</td>
                        <td className="py-3">{item.desiredGrade}</td>
                        <td className="py-3 text-center">
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            item.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-250"
                              : item.status === "enrolled"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                              : item.status === "rejected"
                              ? "bg-red-50 text-red-700 border border-red-250"
                              : "bg-slate-50 text-slate-700 border border-slate-250"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedApplicant(item)}
                              className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {item.status !== "enrolled" && item.status !== "rejected" && (
                              <>
                                <button
                                  onClick={() => { setSelectedApplicant(item); openApproveModal(item); }}
                                  className="p-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                                  title="Approve & Enroll"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openRejectModal(item._id)}
                                  className="p-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1 rounded bg-slate-50 border border-red-200 text-slate-400 hover:text-red-650 cursor-pointer"
                              title="Delete Record"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Application Review Card */}
        <div className="lg:col-span-5">
          {selectedApplicant ? (
            <Card className="p-6 border-slate-200/60 bg-white space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Applicant Dossier</h3>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">ID: {selectedApplicant.applicationNumber}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2 font-display leading-tight">{selectedApplicant.studentName}</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class Requested</span>
                    <span className="font-semibold text-slate-800">{selectedApplicant.desiredGrade}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Age</span>
                    <span className="font-semibold text-slate-800">{selectedApplicant.age || "Not specified"} Years</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide">Parent Contact Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-display">Parent Name</span>
                      <span className="font-semibold text-slate-800">{selectedApplicant.parentName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-display">Phone Number</span>
                      <span className="font-semibold text-slate-800">{selectedApplicant.contactNumber}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-display">Primary Email</span>
                      <span className="font-semibold text-slate-850 block">{selectedApplicant.email}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-display">Home Address</span>
                      <span className="text-slate-600 block leading-relaxed">{selectedApplicant.address}</span>
                    </div>
                  </div>
                </div>

                {(selectedApplicant.previousSchool || selectedApplicant.remarks) && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {selectedApplicant.previousSchool && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Previous School</span>
                        <span className="font-semibold text-slate-800">{selectedApplicant.previousSchool}</span>
                      </div>
                    )}
                    {selectedApplicant.remarks && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                        <span className="text-slate-600">{selectedApplicant.remarks}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedApplicant.status !== "enrolled" && selectedApplicant.status !== "rejected" && (
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <Button
                    onClick={() => openApproveModal(selectedApplicant)}
                    className="flex-1 justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Approve & Enroll
                  </Button>
                  <Button
                    onClick={() => openRejectModal(selectedApplicant._id)}
                    variant="outline"
                    className="flex-1 justify-center gap-1.5 border-red-200 text-red-650 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Reject Applicant
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-10 border-slate-200/60 bg-white text-center text-slate-400 text-xs">
              Select an applicant to review their registration dossier and manage enrollment status.
            </Card>
          )}
        </div>
      </div>

      {/* APPROVAL & FULL DETAIL INPUT MODAL */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsApproveModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl z-10 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-slate-800" />
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Complete Student Enrollment Details
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                    For: {selectedApplicant?.studentName}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {approveError && <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-semibold">{approveError}</div>}
            {approveSuccess && <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 font-semibold">{approveSuccess}</div>}

            <form onSubmit={handleApproveSubmit} className="space-y-6 text-xs text-slate-700">
              
              {/* Personal Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">1. Student Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name *</label>
                    <input type="text" required value={approveForm.firstName} onChange={e => setApproveForm({ ...approveForm, firstName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name *</label>
                    <input type="text" required value={approveForm.lastName} onChange={e => setApproveForm({ ...approveForm, lastName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender *</label>
                    <select value={approveForm.gender} onChange={e => setApproveForm({ ...approveForm, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth *</label>
                    <input type="date" required value={approveForm.dob} onChange={e => setApproveForm({ ...approveForm, dob: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group *</label>
                    <select value={approveForm.bloodGroup} onChange={e => setApproveForm({ ...approveForm, bloodGroup: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category *</label>
                    <select value={approveForm.category} onChange={e => setApproveForm({ ...approveForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none">
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Institution Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">2. Institutional Allocation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class Assigned</label>
                    <input type="text" disabled value={selectedApplicant?.desiredGrade || ""} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-bold focus:outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section *</label>
                    <select value={approveForm.section} onChange={e => setApproveForm({ ...approveForm, section: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none">
                      {sections.map(sec => <option key={sec._id} value={sec.name}>{sec.name}</option>)}
                      {sections.length === 0 && <option value="A">Section A</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year *</label>
                    <select value={approveForm.academicYear} onChange={e => setApproveForm({ ...approveForm, academicYear: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none">
                      {academicYears.map(yr => <option key={yr._id} value={yr.name}>{yr.name}</option>)}
                      {academicYears.length === 0 && <option value="2025-2026">2025-2026</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roll Number *</label>
                    <input type="text" required placeholder="e.g. 102" value={approveForm.rollNumber} onChange={e => setApproveForm({ ...approveForm, rollNumber: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Parents Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">3. Parent & Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Name *</label>
                    <input type="text" required value={approveForm.fatherName} onChange={e => setApproveForm({ ...approveForm, fatherName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Name *</label>
                    <input type="text" required value={approveForm.motherName} onChange={e => setApproveForm({ ...approveForm, motherName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parent Contact Number *</label>
                    <input type="text" required value={approveForm.phone} onChange={e => setApproveForm({ ...approveForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Residential Address *</label>
                    <input type="text" required value={approveForm.address} onChange={e => setApproveForm({ ...approveForm, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Portal Credentials Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4. Portal Credentials</h4>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={approveForm.createPortalAccount} onChange={e => setApproveForm({ ...approveForm, createPortalAccount: e.target.checked })} className="rounded text-slate-900 border-slate-350 focus:ring-slate-500 w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider">Generate Portal Access</span>
                  </label>
                </div>
                {approveForm.createPortalAccount && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portal Username *</label>
                      <input type="text" required value={approveForm.loginUsername} onChange={e => setApproveForm({ ...approveForm, loginUsername: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Login Email *</label>
                      <input type="email" required value={approveForm.loginEmail} onChange={e => setApproveForm({ ...approveForm, loginEmail: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portal Password *</label>
                      <input type="password" required value={approveForm.loginPassword} onChange={e => setApproveForm({ ...approveForm, loginPassword: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsApproveModalOpen(false)} type="button">Cancel</Button>
                <Button type="submit" size="sm" disabled={approveLoading} className="gap-1.5">
                  {approveLoading && <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  Register & Admit Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT REMARKS MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRejectModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl z-10 w-full max-w-md space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-650" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Reject Admission Application</h3>
                <p className="text-xs text-slate-500">Provide official remarks for this rejection.</p>
              </div>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rejection Remarks</label>
                <textarea required value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} placeholder="e.g. Eligibility criteria not met / Incomplete document proof." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 min-h-[90px] focus:outline-none focus:bg-white focus:border-slate-350" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)} type="button">Cancel</Button>
                <Button size="sm" disabled={rejectLoading} type="submit" className="bg-red-600 hover:bg-red-700 text-white border-red-600">
                  {rejectLoading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />} Reject Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admissions;
