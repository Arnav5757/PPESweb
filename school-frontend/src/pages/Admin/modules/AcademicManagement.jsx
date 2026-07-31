import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, BookOpen, Users, Calendar, Layers, Grid3X3, UserCheck,
  ClipboardList, ArrowUpRight, Plus, Search, Edit, Trash2, X, ChevronLeft,
  ChevronRight, Loader2, AlertCircle, CheckCircle, RefreshCw, Eye
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { academicService } from "../../../services/academicService";
import { teacherService } from "../../../services/teacherService";

// ─── Helpers ───────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

const Badge = ({ active, label }) => (
  <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
    active
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-slate-100 text-slate-500 border border-slate-200"
  }`}>{label}</span>
);

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const colors = s === "active" || s === "completed"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "inactive" || s === "cancelled"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${colors}`}>{status || "—"}</span>;
};

// ─── Skeleton ──────────────────────────────────────────────────────
const TableSkeleton = ({ cols = 5, rows = 5 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="border-b border-slate-100">
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c} className="p-4"><div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} /></td>
        ))}
      </tr>
    ))}
  </tbody>
);

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse">
    <div className="h-3 w-24 bg-slate-100 rounded" />
    <div className="h-7 w-16 bg-slate-100 rounded" />
    <div className="h-2 w-32 bg-slate-50 rounded" />
  </div>
);

// ─── Delete Confirmation ───────────────────────────────────────────
const DeleteConfirmModal = ({ show, onCancel, onConfirm, loading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl z-10 w-full max-w-sm space-y-5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 gap-1.5">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
};

// ─── Form Modal ────────────────────────────────────────────────────
const FormModal = ({ show, onClose, title, icon: Icon, children, onSubmit, loading, error, success, isEdit }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl z-10 text-left space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-5 h-5 text-slate-800" />}
            <h3 className="text-lg font-bold font-display text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{error}</div>}
        {success && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{success}</div>}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {children}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Select Field ──────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, placeholder = "Select..." }) => (
  <div className="space-y-1.5 text-left w-full">
    {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-700 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Checkbox Field ────────────────────────────────────────────────
const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer py-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
    />
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
  </label>
);

// ─── Tab Config ────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: GraduationCap },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "years", label: "Academic Years", icon: Calendar },
  { id: "classes", label: "Classes", icon: Layers },
  { id: "sections", label: "Sections", icon: Grid3X3 },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "subject-assignments", label: "Subject Assignments", icon: ClipboardList },
  { id: "teacher-assignments", label: "Teacher Assignments", icon: UserCheck },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "promotions", label: "Promotions", icon: ArrowUpRight },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Overview Data ───────────────────────────────────────────────
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // ─── Lookup Lists (for dropdowns) ────────────────────────────────
  const [sessionsList, setSessionsList] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [subjectAssignmentsList, setSubjectAssignmentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  // ─── Generic CRUD State ──────────────────────────────────────────
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Modal State ─────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // ─── Delete State ────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Promotions State ────────────────────────────────────────────
  const [promotionForm, setPromotionForm] = useState({
    student: "", fromAcademicYear: "", fromClass: "", fromSection: "",
    toAcademicYear: "", toClass: "", toSection: "", toRollNumber: "", remarks: ""
  });
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionSuccess, setPromotionSuccess] = useState("");
  const [promotionError, setPromotionError] = useState("");
  const [promotionHistoryLoading, setPromotionHistoryLoading] = useState(false);

  // ─── Fetch Lookups ───────────────────────────────────────────────
  const fetchLookups = useCallback(async () => {
    try {
      const [sessRes, yearRes, clsRes, secRes, subRes, saRes, tchRes] = await Promise.allSettled([
        academicService.getSessions({ limit: 100 }),
        academicService.getYears({ limit: 100 }),
        academicService.getClasses({ limit: 100 }),
        academicService.getSections({ limit: 100 }),
        academicService.getSubjects({ limit: 100 }),
        academicService.getSubjectAssignments({ limit: 100 }),
        teacherService.getTeachers({ limit: 100 }),
      ]);
      if (sessRes.status === "fulfilled") setSessionsList(sessRes.value.sessions || sessRes.value.data || []);
      if (yearRes.status === "fulfilled") setYearsList(yearRes.value.years || yearRes.value.data || []);
      if (clsRes.status === "fulfilled") setClassesList(clsRes.value.classes || clsRes.value.data || []);
      if (secRes.status === "fulfilled") setSectionsList(secRes.value.sections || secRes.value.data || []);
      if (subRes.status === "fulfilled") setSubjectsList(subRes.value.subjects || subRes.value.data || []);
      if (saRes.status === "fulfilled") setSubjectAssignmentsList(saRes.value.subjectAssignments || saRes.value.data || []);
      if (tchRes.status === "fulfilled") setTeachersList(tchRes.value.teachers || tchRes.value.data || []);
    } catch (err) {
      console.error("Error fetching lookups:", err);
    }
  }, []);

  // ─── Fetch Overview ──────────────────────────────────────────────
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [sessRes, yearRes, clsRes, secRes, subRes, taRes, enrRes] = await Promise.allSettled([
        academicService.getCurrentSession(),
        academicService.getCurrentYear(),
        academicService.getClasses({ limit: 1 }),
        academicService.getSections({ limit: 1 }),
        academicService.getSubjects({ limit: 1 }),
        academicService.getTeacherAssignments({ limit: 1 }),
        academicService.getEnrollments({ limit: 1 }),
      ]);

      setOverviewData({
        currentSession: sessRes.status === "fulfilled" ? sessRes.value : null,
        currentYear: yearRes.status === "fulfilled" ? yearRes.value : null,
        totalClasses: clsRes.status === "fulfilled" ? (clsRes.value.total ?? clsRes.value.count ?? 0) : 0,
        totalSections: secRes.status === "fulfilled" ? (secRes.value.total ?? secRes.value.count ?? 0) : 0,
        totalSubjects: subRes.status === "fulfilled" ? (subRes.value.total ?? subRes.value.count ?? 0) : 0,
        teacherAssignments: taRes.status === "fulfilled" ? (taRes.value.total ?? taRes.value.count ?? 0) : 0,
        enrollments: enrRes.status === "fulfilled" ? (enrRes.value.total ?? enrRes.value.count ?? 0) : 0,
      });
    } catch (err) {
      console.error("Error fetching overview:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // ─── Generic Fetch for CRUD Tabs ─────────────────────────────────
  const fetchData = useCallback(async (tab, page = 1, search = "") => {
    setLoading(true);
    const params = { page, limit: 10, search };
    try {
      let res;
      switch (tab) {
        case "sessions": res = await academicService.getSessions(params); setData(res.sessions || res.data || []); break;
        case "years": res = await academicService.getYears(params); setData(res.years || res.data || []); break;
        case "classes": res = await academicService.getClasses(params); setData(res.classes || res.data || []); break;
        case "sections": res = await academicService.getSections(params); setData(res.sections || res.data || []); break;
        case "subjects": res = await academicService.getSubjects(params); setData(res.subjects || res.data || []); break;
        case "subject-assignments": res = await academicService.getSubjectAssignments(params); setData(res.subjectAssignments || res.data || []); break;
        case "teacher-assignments": res = await academicService.getTeacherAssignments(params); setData(res.teacherAssignments || res.data || []); break;
        case "enrollments": res = await academicService.getEnrollments(params); setData(res.enrollments || res.data || []); break;
        default: setData([]);
      }
      setTotalPages(res?.pages || res?.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchOverview();
    fetchLookups();
  }, [fetchOverview, fetchLookups]);

  useEffect(() => {
    if (activeTab !== "overview" && activeTab !== "promotions") {
      setSearchQuery("");
      setCurrentPage(1);
      fetchData(activeTab, 1, "");
    }
  }, [activeTab, fetchData]);

  useEffect(() => {
    if (activeTab !== "overview" && activeTab !== "promotions") {
      fetchData(activeTab, currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, activeTab, fetchData]);

  // ─── CRUD Handlers ───────────────────────────────────────────────
  const resetForm = (defaults = {}) => {
    setForm(defaults);
    setFormError("");
    setFormSuccess("");
    setFormLoading(false);
  };

  const openAddModal = (defaults = {}) => {
    setIsEditMode(false);
    setEditId(null);
    resetForm(defaults);
    setIsModalOpen(true);
  };

  const openEditModal = (item, mapFn) => {
    setIsEditMode(true);
    setEditId(item._id);
    resetForm(mapFn ? mapFn(item) : item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError("");
    setFormSuccess("");
  };

  const handleSave = async (e, createFn, updateFn, payload) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);
    try {
      if (isEditMode) {
        await updateFn(editId, payload);
        setFormSuccess("Record updated successfully ✅");
      } else {
        await createFn(payload);
        setFormSuccess("Record created successfully ✅");
      }
      fetchData(activeTab, currentPage, searchQuery);
      fetchLookups();
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      setFormError(err.message || "An error occurred while saving.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (deleteFn) => {
    setDeleteLoading(true);
    try {
      await deleteFn(deleteId);
      fetchData(activeTab, currentPage, searchQuery);
      fetchLookups();
      setDeleteId(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Get Delete Fn by Tab ────────────────────────────────────────
  const getDeleteFn = () => {
    switch (activeTab) {
      case "sessions": return academicService.deleteSession;
      case "years": return academicService.deleteYear;
      case "classes": return academicService.deleteClass;
      case "sections": return academicService.deleteSection;
      case "subjects": return academicService.deleteSubject;
      case "subject-assignments": return academicService.deleteSubjectAssignment;
      case "teacher-assignments": return academicService.deleteTeacherAssignment;
      case "enrollments": return academicService.deleteEnrollment;
      default: return () => {};
    }
  };

  // ─── Promotion Handler ──────────────────────────────────────────
  const handlePromote = async (e) => {
    e.preventDefault();
    setPromotionError("");
    setPromotionSuccess("");
    setPromotionLoading(true);
    try {
      await academicService.promoteStudent(promotionForm);
      setPromotionSuccess("Student promoted successfully ✅");
      setPromotionForm({
        student: "", fromAcademicYear: "", fromClass: "", fromSection: "",
        toAcademicYear: "", toClass: "", toSection: "", toRollNumber: "", remarks: ""
      });
      if (promotionForm.student) fetchPromotionHistory(promotionForm.student);
    } catch (err) {
      setPromotionError(err.message || "Error promoting student.");
    } finally {
      setPromotionLoading(false);
    }
  };

  const fetchPromotionHistory = async (studentId) => {
    if (!studentId) return;
    setPromotionHistoryLoading(true);
    try {
      const res = await academicService.getStudentPromotions(studentId);
      setPromotionHistory(res.promotions || res.data || res || []);
    } catch {
      setPromotionHistory([]);
    } finally {
      setPromotionHistoryLoading(false);
    }
  };

  // ─── Shared Table Wrapper ────────────────────────────────────────
  const TableWrapper = ({ title, subtitle, onAdd, addLabel = "Add New", children }) => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">{subtitle}</p>
        </div>
        <Button onClick={onAdd} className="gap-1.5 self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" /> {addLabel}
        </Button>
      </div>

      {/* Search bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchData(activeTab, currentPage, searchQuery)} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {children}
    </div>
  );

  // ─── Table Actions Column ────────────────────────────────────────
  const ActionCell = ({ item, onEdit }) => (
    <td className="p-4 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => onEdit(item)} className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer" title="Edit">
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setDeleteId(item._id)} className="p-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </td>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: OVERVIEW
  // ═══════════════════════════════════════════════════════════════════
  const renderOverview = () => {
    const stats = [
      { label: "Active Session", value: overviewData?.currentSession?.name || "—", icon: Calendar, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
      { label: "Academic Year", value: overviewData?.currentYear?.name || "—", icon: Calendar, color: "text-violet-600 bg-violet-50 border-violet-200" },
      { label: "Total Classes", value: overviewData?.totalClasses ?? "—", icon: Layers, color: "text-sky-600 bg-sky-50 border-sky-200" },
      { label: "Total Sections", value: overviewData?.totalSections ?? "—", icon: Grid3X3, color: "text-teal-600 bg-teal-50 border-teal-200" },
      { label: "Total Subjects", value: overviewData?.totalSubjects ?? "—", icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-200" },
      { label: "Teacher Assignments", value: overviewData?.teacherAssignments ?? "—", icon: UserCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
      { label: "Student Enrollments", value: overviewData?.enrollments ?? "—", icon: Users, color: "text-rose-600 bg-rose-50 border-rose-200" },
    ];

    const quickActions = [
      { label: "New Session", tab: "sessions", icon: Calendar },
      { label: "New Class", tab: "classes", icon: Layers },
      { label: "Enroll Student", tab: "enrollments", icon: Users },
      { label: "Promote Student", tab: "promotions", icon: ArrowUpRight },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Academic Overview</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
            Monitor academic configuration and structure at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewLoading
            ? Array.from({ length: 7 }).map((_, i) => <StatSkeleton key={i} />)
            : stats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 font-display">{s.value}</p>
                </div>
              ))
          }
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.tab}
                onClick={() => setActiveTab(qa.tab)}
                className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left cursor-pointer group"
              >
                <qa.icon className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{qa.label}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 ml-auto group-hover:text-slate-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Academic Activity</h3>
          <div className="space-y-3">
            {[
              "Academic session configured",
              "New class structure created",
              "Subject assignments updated",
              "Teacher allocations modified",
              "Student enrollments processed",
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-600">{activity}</span>
                <span className="text-[10px] text-slate-400 ml-auto">Recent</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // TAB: SESSIONS
  // ═══════════════════════════════════════════════════════════════════
  const defaultSessionForm = { name: "", startDate: "", endDate: "", isCurrent: false, status: "active" };

  const renderSessions = () => (
    <TableWrapper title="Academic Sessions" subtitle="Manage academic session periods" onAdd={() => openAddModal(defaultSessionForm)} addLabel="New Session">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Start Date</th>
                <th className="p-4 font-bold">End Date</th>
                <th className="p-4 font-bold text-center">Current</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={6} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-slate-400">No sessions found.</td></tr>
                ) : data.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{s.name}</td>
                    <td className="p-4">{fmt(s.startDate)}</td>
                    <td className="p-4">{fmt(s.endDate)}</td>
                    <td className="p-4 text-center"><Badge active={s.isCurrent} label={s.isCurrent ? "Current" : "No"} /></td>
                    <td className="p-4 text-center"><StatusBadge status={s.status} /></td>
                    <ActionCell item={s} onEdit={(item) => openEditModal(item, (x) => ({
                      name: x.name || "", startDate: x.startDate ? new Date(x.startDate).toISOString().split("T")[0] : "",
                      endDate: x.endDate ? new Date(x.endDate).toISOString().split("T")[0] : "", isCurrent: x.isCurrent || false, status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Session" : "New Session"} icon={Calendar}
        onSubmit={(e) => handleSave(e, academicService.createSession, academicService.updateSession, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <Input label="Session Name *" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2025-2026" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Start Date *</label>
            <input type="date" required value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400" /></div>
          <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">End Date *</label>
            <input type="date" required value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <CheckboxField label="Mark as Current Session" checked={form.isCurrent || false} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} />
        </div>
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: ACADEMIC YEARS
  // ═══════════════════════════════════════════════════════════════════
  const defaultYearForm = { name: "", session: "", startDate: "", endDate: "", isActive: false, status: "active" };

  const renderYears = () => (
    <TableWrapper title="Academic Years" subtitle="Manage academic year periods within sessions" onAdd={() => openAddModal(defaultYearForm)} addLabel="New Year">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Session</th>
                <th className="p-4 font-bold">Start Date</th>
                <th className="p-4 font-bold">End Date</th>
                <th className="p-4 font-bold text-center">Active</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={7} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-slate-400">No academic years found.</td></tr>
                ) : data.map((y) => (
                  <tr key={y._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{y.name}</td>
                    <td className="p-4">{y.session?.name || y.session || "—"}</td>
                    <td className="p-4">{fmt(y.startDate)}</td>
                    <td className="p-4">{fmt(y.endDate)}</td>
                    <td className="p-4 text-center"><Badge active={y.isActive} label={y.isActive ? "Active" : "No"} /></td>
                    <td className="p-4 text-center"><StatusBadge status={y.status} /></td>
                    <ActionCell item={y} onEdit={(item) => openEditModal(item, (x) => ({
                      name: x.name || "", session: x.session?._id || x.session || "",
                      startDate: x.startDate ? new Date(x.startDate).toISOString().split("T")[0] : "",
                      endDate: x.endDate ? new Date(x.endDate).toISOString().split("T")[0] : "",
                      isActive: x.isActive || false, status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Academic Year" : "New Academic Year"} icon={Calendar}
        onSubmit={(e) => handleSave(e, academicService.createYear, academicService.updateYear, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <Input label="Year Name *" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2025-2026" />
        <SelectField label="Session *" value={form.session || ""} onChange={(e) => setForm({ ...form, session: e.target.value })}
          options={sessionsList.map((s) => ({ value: s._id, label: s.name }))} placeholder="Select session..." />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Start Date *</label>
            <input type="date" required value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400" /></div>
          <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">End Date *</label>
            <input type="date" required value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <CheckboxField label="Mark as Active Year" checked={form.isActive || false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        </div>
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: CLASSES
  // ═══════════════════════════════════════════════════════════════════
  const defaultClassForm = { name: "", code: "", academicYear: "", displayOrder: 0, description: "", status: "active" };

  const renderClasses = () => (
    <TableWrapper title="Classes" subtitle="Manage class structures and academic levels" onAdd={() => openAddModal(defaultClassForm)} addLabel="New Class">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Code</th>
                <th className="p-4 font-bold">Academic Year</th>
                <th className="p-4 font-bold">Display Order</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={6} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-slate-400">No classes found.</td></tr>
                ) : data.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{c.code || "—"}</span></td>
                    <td className="p-4">{c.academicYear?.name || c.academicYear || "—"}</td>
                    <td className="p-4">{c.displayOrder ?? "—"}</td>
                    <td className="p-4 text-center"><StatusBadge status={c.status} /></td>
                    <ActionCell item={c} onEdit={(item) => openEditModal(item, (x) => ({
                      name: x.name || "", code: x.code || "", academicYear: x.academicYear?._id || x.academicYear || "",
                      displayOrder: x.displayOrder || 0, description: x.description || "", status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Class" : "New Class"} icon={Layers}
        onSubmit={(e) => handleSave(e, academicService.createClass, academicService.updateClass, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Class Name *" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grade 10" />
          <Input label="Class Code *" required value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. GR10" />
        </div>
        <SelectField label="Academic Year *" value={form.academicYear || ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
          options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Select academic year..." />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Display Order</label>
            <input type="number" value={form.displayOrder || 0} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400" /></div>
          <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
        </div>
        <Input label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: SECTIONS
  // ═══════════════════════════════════════════════════════════════════
  const defaultSectionForm = { class: "", name: "", classTeacher: "", capacity: "", roomNumber: "", status: "active" };

  const renderSections = () => (
    <TableWrapper title="Sections" subtitle="Manage class sections, teachers, and room allocations" onAdd={() => openAddModal(defaultSectionForm)} addLabel="New Section">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Section Name</th>
                <th className="p-4 font-bold">Class Teacher</th>
                <th className="p-4 font-bold">Capacity</th>
                <th className="p-4 font-bold">Room</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={7} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-slate-400">No sections found.</td></tr>
                ) : data.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{s.class?.name || s.class || "—"}</td>
                    <td className="p-4">{s.name}</td>
                    <td className="p-4">{s.classTeacher?.name || s.classTeacher || "—"}</td>
                    <td className="p-4">{s.capacity ?? "—"}</td>
                    <td className="p-4">{s.roomNumber || "—"}</td>
                    <td className="p-4 text-center"><StatusBadge status={s.status} /></td>
                    <ActionCell item={s} onEdit={(item) => openEditModal(item, (x) => ({
                      class: x.class?._id || x.class || "", name: x.name || "", classTeacher: x.classTeacher?._id || x.classTeacher || "",
                      capacity: x.capacity || "", roomNumber: x.roomNumber || "", status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Section" : "New Section"} icon={Grid3X3}
        onSubmit={(e) => handleSave(e, academicService.createSection, academicService.updateSection, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <SelectField label="Class *" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })}
          options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Select class..." />
        <Input label="Section Name *" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. A" />
        <SelectField label="Class Teacher" value={form.classTeacher || ""} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })}
          options={teachersList.map((t) => ({ value: t._id, label: t.name }))} placeholder="Select teacher..." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Capacity" type="number" value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 40" />
          <Input label="Room Number" value={form.roomNumber || ""} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. 101" />
        </div>
        <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: SUBJECTS
  // ═══════════════════════════════════════════════════════════════════
  const defaultSubjectForm = { name: "", code: "", class: "", academicYear: "", description: "", isOptional: false, status: "active" };

  const renderSubjects = () => (
    <TableWrapper title="Subjects" subtitle="Manage subject catalog and classifications" onAdd={() => openAddModal(defaultSubjectForm)} addLabel="New Subject">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Code</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold text-center">Optional</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={6} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-slate-400">No subjects found.</td></tr>
                ) : data.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{s.name}</td>
                    <td className="p-4"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{s.code || "—"}</span></td>
                    <td className="p-4">{s.class?.name || s.class || "—"}</td>
                    <td className="p-4 text-center"><Badge active={s.isOptional} label={s.isOptional ? "Optional" : "Core"} /></td>
                    <td className="p-4 text-center"><StatusBadge status={s.status} /></td>
                    <ActionCell item={s} onEdit={(item) => openEditModal(item, (x) => ({
                      name: x.name || "", code: x.code || "", class: x.class?._id || x.class || "",
                      academicYear: x.academicYear?._id || x.academicYear || "", description: x.description || "",
                      isOptional: x.isOptional || false, status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Subject" : "New Subject"} icon={BookOpen}
        onSubmit={(e) => handleSave(e, academicService.createSubject, academicService.updateSubject, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Subject Name *" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
          <Input label="Subject Code *" required value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Class *" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })}
            options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Select class..." />
          <SelectField label="Academic Year" value={form.academicYear || ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Select year..." />
        </div>
        <Input label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
        <div className="grid grid-cols-2 gap-4 items-center">
          <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <CheckboxField label="Optional Subject" checked={form.isOptional || false} onChange={(e) => setForm({ ...form, isOptional: e.target.checked })} />
        </div>
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: SUBJECT ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════════════
  const defaultSAForm = { subject: "", class: "", section: "", academicYear: "", weeklyHours: "", isElective: false };

  const renderSubjectAssignments = () => (
    <TableWrapper title="Subject Assignments" subtitle="Map subjects to class sections" onAdd={() => openAddModal(defaultSAForm)} addLabel="New Assignment">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Subject</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Section</th>
                <th className="p-4 font-bold">Weekly Hours</th>
                <th className="p-4 font-bold text-center">Elective</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={6} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-slate-400">No subject assignments found.</td></tr>
                ) : data.map((sa) => (
                  <tr key={sa._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">{sa.subject?.name || sa.subject || "—"}</td>
                    <td className="p-4">{sa.class?.name || sa.class || "—"}</td>
                    <td className="p-4">{sa.section?.name || sa.section || "—"}</td>
                    <td className="p-4">{sa.weeklyHours ?? "—"}</td>
                    <td className="p-4 text-center"><Badge active={sa.isElective} label={sa.isElective ? "Elective" : "Core"} /></td>
                    <ActionCell item={sa} onEdit={(item) => openEditModal(item, (x) => ({
                      subject: x.subject?._id || x.subject || "", class: x.class?._id || x.class || "",
                      section: x.section?._id || x.section || "", academicYear: x.academicYear?._id || x.academicYear || "",
                      weeklyHours: x.weeklyHours || "", isElective: x.isElective || false
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Subject Assignment" : "New Subject Assignment"} icon={ClipboardList}
        onSubmit={(e) => handleSave(e, academicService.createSubjectAssignment, academicService.updateSubjectAssignment, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <SelectField label="Subject *" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })}
          options={subjectsList.map((s) => ({ value: s._id, label: `${s.name} (${s.code || ""})` }))} placeholder="Select subject..." />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Class *" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value, section: "" })}
            options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Select class..." />
          <SelectField label="Section *" value={form.section || ""} onChange={(e) => setForm({ ...form, section: e.target.value })}
            options={sectionsList.filter((s) => !form.class || (s.class?._id || s.class) === form.class).map((s) => ({ value: s._id, label: s.name }))} placeholder="Select section..." />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <SelectField label="Academic Year" value={form.academicYear || ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Select year..." />
          <Input label="Weekly Hours" type="number" value={form.weeklyHours || ""} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} placeholder="e.g. 5" />
        </div>
        <CheckboxField label="Mark as Elective" checked={form.isElective || false} onChange={(e) => setForm({ ...form, isElective: e.target.checked })} />
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: TEACHER ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════════════
  const defaultTAForm = { teacher: "", subjectAssignment: "", workload: "", status: "active" };

  const renderTeacherAssignments = () => (
    <TableWrapper title="Teacher Assignments" subtitle="Allocate teachers to subject-section combinations" onAdd={() => openAddModal(defaultTAForm)} addLabel="New Assignment">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Teacher</th>
                <th className="p-4 font-bold">Subject + Section</th>
                <th className="p-4 font-bold">Workload</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={5} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400">No teacher assignments found.</td></tr>
                ) : data.map((ta) => {
                  const saLabel = ta.subjectAssignment
                    ? `${ta.subjectAssignment.subject?.name || "—"} / ${ta.subjectAssignment.section?.name || "—"}`
                    : "—";
                  return (
                    <tr key={ta._id} className="hover:bg-slate-50/40 transition-all">
                      <td className="p-4 font-bold text-slate-900">{ta.teacher?.name || ta.teacher || "—"}</td>
                      <td className="p-4">{saLabel}</td>
                      <td className="p-4">{ta.workload ?? "—"}</td>
                      <td className="p-4 text-center"><StatusBadge status={ta.status} /></td>
                      <ActionCell item={ta} onEdit={(item) => openEditModal(item, (x) => ({
                        teacher: x.teacher?._id || x.teacher || "", subjectAssignment: x.subjectAssignment?._id || x.subjectAssignment || "",
                        workload: x.workload || "", status: x.status || "active"
                      }))} />
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Teacher Assignment" : "New Teacher Assignment"} icon={UserCheck}
        onSubmit={(e) => handleSave(e, academicService.createTeacherAssignment, academicService.updateTeacherAssignment, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <SelectField label="Teacher *" value={form.teacher || ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
          options={teachersList.map((t) => ({ value: t._id, label: t.name }))} placeholder="Select teacher..." />
        <SelectField label="Subject Assignment *" value={form.subjectAssignment || ""} onChange={(e) => setForm({ ...form, subjectAssignment: e.target.value })}
          options={subjectAssignmentsList.map((sa) => ({
            value: sa._id,
            label: `${sa.subject?.name || "Subject"} — ${sa.class?.name || "Class"} / ${sa.section?.name || "Section"}`
          }))} placeholder="Select subject assignment..." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Workload (hrs/week)" type="number" value={form.workload || ""} onChange={(e) => setForm({ ...form, workload: e.target.value })} placeholder="e.g. 6" />
          <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
        </div>
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: ENROLLMENTS
  // ═══════════════════════════════════════════════════════════════════
  const defaultEnrollForm = { student: "", academicYear: "", class: "", section: "", rollNumber: "", admissionNumber: "", status: "active" };

  const renderEnrollments = () => (
    <TableWrapper title="Student Enrollments" subtitle="Manage student class enrollments and roll assignments" onAdd={() => openAddModal(defaultEnrollForm)} addLabel="Enroll Student">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Academic Year</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Section</th>
                <th className="p-4 font-bold">Roll No</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={7} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-slate-400">No enrollments found.</td></tr>
                ) : data.map((en) => (
                  <tr key={en._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">
                      {en.student?.firstName ? `${en.student.firstName} ${en.student.lastName || ""}` : en.student?.name || en.student || "—"}
                    </td>
                    <td className="p-4">{en.academicYear?.name || en.academicYear || "—"}</td>
                    <td className="p-4">{en.class?.name || en.class || "—"}</td>
                    <td className="p-4">{en.section?.name || en.section || "—"}</td>
                    <td className="p-4">{en.rollNumber || "—"}</td>
                    <td className="p-4 text-center"><StatusBadge status={en.status} /></td>
                    <ActionCell item={en} onEdit={(item) => openEditModal(item, (x) => ({
                      student: x.student?._id || x.student || "", academicYear: x.academicYear?._id || x.academicYear || "",
                      class: x.class?._id || x.class || "", section: x.section?._id || x.section || "",
                      rollNumber: x.rollNumber || "", admissionNumber: x.admissionNumber || "", status: x.status || "active"
                    }))} />
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      </div>

      <FormModal show={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Enrollment" : "Enroll Student"} icon={Users}
        onSubmit={(e) => handleSave(e, academicService.createEnrollment, academicService.updateEnrollment, form)}
        loading={formLoading} error={formError} success={formSuccess} isEdit={isEditMode}>
        <Input label="Student ID *" required value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Enter student ID..." />
        <SelectField label="Academic Year *" value={form.academicYear || ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
          options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Select academic year..." />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Class *" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value, section: "" })}
            options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Select class..." />
          <SelectField label="Section *" value={form.section || ""} onChange={(e) => setForm({ ...form, section: e.target.value })}
            options={sectionsList.filter((s) => !form.class || (s.class?._id || s.class) === form.class).map((s) => ({ value: s._id, label: s.name }))} placeholder="Select section..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Roll Number" value={form.rollNumber || ""} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="e.g. 001" />
          <Input label="Admission Number" value={form.admissionNumber || ""} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} placeholder="e.g. ADM-2025-001" />
        </div>
        <SelectField label="Status *" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "transferred", label: "Transferred" }, { value: "completed", label: "Completed" }]} />
      </FormModal>
    </TableWrapper>
  );

  // ═══════════════════════════════════════════════════════════════════
  // TAB: PROMOTIONS
  // ═══════════════════════════════════════════════════════════════════
  const renderPromotions = () => (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold font-display text-slate-900">Promotion Center</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Promote students across academic years and classes
        </p>
      </div>

      {/* Promotion Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Promotion Workflow</h3>

        {promotionError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{promotionError}</div>}
        {promotionSuccess && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{promotionSuccess}</div>}

        <form onSubmit={handlePromote} className="space-y-5 text-xs">
          {/* Student Selection */}
          <div className="space-y-1.5">
            <Input label="Student ID *" required value={promotionForm.student || ""} onChange={(e) => {
              setPromotionForm({ ...promotionForm, student: e.target.value });
              if (e.target.value.length >= 20) fetchPromotionHistory(e.target.value);
            }} placeholder="Enter student ID to search..." />
          </div>

          {/* Current Enrollment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="From Academic Year" value={promotionForm.fromAcademicYear || ""} onChange={(e) => setPromotionForm({ ...promotionForm, fromAcademicYear: e.target.value })}
              options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Current year..." />
            <SelectField label="From Class" value={promotionForm.fromClass || ""} onChange={(e) => setPromotionForm({ ...promotionForm, fromClass: e.target.value })}
              options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Current class..." />
            <SelectField label="From Section" value={promotionForm.fromSection || ""} onChange={(e) => setPromotionForm({ ...promotionForm, fromSection: e.target.value })}
              options={sectionsList.filter((s) => !promotionForm.fromClass || (s.class?._id || s.class) === promotionForm.fromClass).map((s) => ({ value: s._id, label: s.name }))} placeholder="Current section..." />
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center justify-center py-1">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Promote To</span>
            </div>
          </div>

          {/* Target */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField label="To Academic Year *" value={promotionForm.toAcademicYear || ""} onChange={(e) => setPromotionForm({ ...promotionForm, toAcademicYear: e.target.value })}
              options={yearsList.map((y) => ({ value: y._id, label: y.name }))} placeholder="Target year..." />
            <SelectField label="To Class *" value={promotionForm.toClass || ""} onChange={(e) => setPromotionForm({ ...promotionForm, toClass: e.target.value, toSection: "" })}
              options={classesList.map((c) => ({ value: c._id, label: c.name }))} placeholder="Target class..." />
            <SelectField label="To Section *" value={promotionForm.toSection || ""} onChange={(e) => setPromotionForm({ ...promotionForm, toSection: e.target.value })}
              options={sectionsList.filter((s) => !promotionForm.toClass || (s.class?._id || s.class) === promotionForm.toClass).map((s) => ({ value: s._id, label: s.name }))} placeholder="Target section..." />
            <Input label="New Roll Number" value={promotionForm.toRollNumber || ""} onChange={(e) => setPromotionForm({ ...promotionForm, toRollNumber: e.target.value })} placeholder="e.g. 001" />
          </div>

          <Input label="Remarks" value={promotionForm.remarks || ""} onChange={(e) => setPromotionForm({ ...promotionForm, remarks: e.target.value })} placeholder="Optional promotion remarks..." />

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm" disabled={promotionLoading} className="gap-1.5">
              {promotionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <ArrowUpRight className="w-4 h-4" /> Promote Student
            </Button>
          </div>
        </form>
      </div>

      {/* Promotion History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Promotion History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">From</th>
                <th className="p-4 font-bold">To</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Remarks</th>
              </tr>
            </thead>
            {promotionHistoryLoading ? <TableSkeleton cols={5} rows={3} /> : (
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {(!Array.isArray(promotionHistory) || promotionHistory.length === 0) ? (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400">
                    {promotionForm.student ? "No promotion history for this student." : "Enter a student ID to view promotion history."}
                  </td></tr>
                ) : promotionHistory.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-bold text-slate-900">
                      {p.student?.firstName ? `${p.student.firstName} ${p.student.lastName || ""}` : p.student?.name || "—"}
                    </td>
                    <td className="p-4">{p.fromClass?.name || "—"} / {p.fromSection?.name || "—"}</td>
                    <td className="p-4">{p.toClass?.name || "—"} / {p.toSection?.name || "—"}</td>
                    <td className="p-4">{fmt(p.createdAt || p.promotedAt)}</td>
                    <td className="p-4 max-w-[200px] truncate">{p.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 text-left">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "sessions" && renderSessions()}
      {activeTab === "years" && renderYears()}
      {activeTab === "classes" && renderClasses()}
      {activeTab === "sections" && renderSections()}
      {activeTab === "subjects" && renderSubjects()}
      {activeTab === "subject-assignments" && renderSubjectAssignments()}
      {activeTab === "teacher-assignments" && renderTeacherAssignments()}
      {activeTab === "enrollments" && renderEnrollments()}
      {activeTab === "promotions" && renderPromotions()}

      {/* Delete Confirmation Modal (shared) */}
      <DeleteConfirmModal
        show={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => handleDelete(getDeleteFn())}
        loading={deleteLoading}
      />
    </div>
  );
};
