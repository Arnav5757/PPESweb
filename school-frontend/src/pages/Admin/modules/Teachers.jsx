import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit, Trash2, ShieldCheck, Mail, Phone, Calendar, 
  BookOpen, Clock, Heart, Award, XCircle, Save, User, Eye 
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { teacherService } from "../../../services/teacherService";

export const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [teacherFormId, setTeacherFormId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: 0,
    status: "Active",
    photo: "",
    classesRaw: "",
    subjectsRaw: ""
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("Error loading teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setTeacherFormId(null);
    setFormError("");
    setFormSuccess("");
    setForm({
      name: "",
      email: "",
      phone: "",
      qualification: "",
      experience: 0,
      status: "Active",
      photo: "",
      classesRaw: "",
      subjectsRaw: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setIsEditMode(true);
    setTeacherFormId(t._id);
    setFormError("");
    setFormSuccess("");
    setForm({
      name: t.name || "",
      email: t.email || "",
      phone: t.phone || "",
      qualification: t.qualification || "",
      experience: t.experience || 0,
      status: t.status || "Active",
      photo: t.photo || "",
      classesRaw: Array.isArray(t.classes) ? t.classes.join(", ") : (t.classes || ""),
      subjectsRaw: Array.isArray(t.subjects) ? t.subjects.join(", ") : (t.subjects || "")
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Split raw classes and subjects
    const classes = form.classesRaw.split(",").map(c => c.trim()).filter(Boolean);
    const subjects = form.subjectsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      qualification: form.qualification,
      experience: parseInt(form.experience) || 0,
      status: form.status,
      photo: form.photo,
      classes,
      subjects
    };

    try {
      if (isEditMode) {
        await teacherService.updateTeacher(teacherFormId, payload);
        setFormSuccess("Teacher details updated successfully ✅");
      } else {
        await teacherService.createTeacher(payload);
        setFormSuccess("Teacher record registered successfully ✅");
      }
      fetchTeachers();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      setFormError(err.message || "Error saving teacher record.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher record?")) return;
    try {
      await teacherService.deleteTeacher(id);
      fetchTeachers();
      if (selectedTeacher && selectedTeacher._id === id) {
        setSelectedTeacher(null);
      }
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  const filtered = teachers.filter(t => 
    (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.qualification || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Teacher Directory</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
            Manage qualifications, subject allocations, and teacher registers
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-1.5 self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" /> Add Teacher Record
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <Button variant="secondary" size="sm" onClick={fetchTeachers}>Refresh</Button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Table List */}
        <div className={selectedTeacher ? "xl:col-span-7 space-y-4" : "xl:col-span-12 space-y-4"}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="p-4 font-bold">Photo</th>
                    <th className="p-4 font-bold">Teacher Name</th>
                    <th className="p-4 font-bold">Qualification</th>
                    <th className="p-4 font-bold">Experience</th>
                    <th className="p-4 font-bold text-center">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {loading ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading directory...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No teachers found.</td></tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/40 transition-all">
                        <td className="p-4">
                          {t.photo ? (
                            <img src={t.photo} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                              {t.name?.[0]}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-900">{t.name}</td>
                        <td className="p-4">{t.qualification}</td>
                        <td className="p-4">{t.experience} Yrs</td>
                        <td className="p-4 text-center">
                          <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            t.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedTeacher(t)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                              title="Inspect dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => openEditModal(t)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                              title="Edit teacher"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(t._id)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Dossier on Right */}
        {selectedTeacher && (
          <div className="xl:col-span-5">
            <Card className="p-6 border-slate-200/60 bg-white space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                {selectedTeacher.photo ? (
                  <img src={selectedTeacher.photo} alt={selectedTeacher.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg border border-slate-200">
                    {selectedTeacher.name?.[0]}
                  </div>
                )}
                <div className="text-left space-y-0.5">
                  <h3 className="font-extrabold text-slate-900 font-display text-base leading-tight">{selectedTeacher.name}</h3>
                  <span className="text-[8px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase text-slate-600">
                    {selectedTeacher.qualification}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Qualification</span>
                    <span className="font-semibold text-slate-800">{selectedTeacher.qualification}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Experience Index</span>
                    <span className="font-semibold text-slate-800">{selectedTeacher.experience} Yrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Staff Email</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedTeacher.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                    <span className="font-semibold text-slate-800">{selectedTeacher.phone}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-slate-850 uppercase tracking-wide">Academic Allocations</h4>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Subjects</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(selectedTeacher.subjects || []).length === 0 ? (
                        <span className="text-slate-400 italic">None allocated</span>
                      ) : (
                        selectedTeacher.subjects.map((sub, i) => (
                          <span key={i} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{sub}</span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Classes</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(selectedTeacher.classes || []).length === 0 ? (
                        <span className="text-slate-400 italic">None allocated</span>
                      ) : (
                        selectedTeacher.classes.map((cls, i) => (
                          <span key={i} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{cls}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedTeacher(null)}>Close details</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          <Card className="relative w-full max-w-lg bg-white p-6 md:p-8 shadow-2xl z-10 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  {isEditMode ? "Modify Teacher Profile" : "Register New Teacher"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-950 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{formError}</div>}
            {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Teacher Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input label="Email Address *" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone Number *" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Input label="Qualification *" required value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Experience (Years) *</label>
                  <input type="number" required value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Employment Status *</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <Input label="Assigned Classes (Comma separated)" placeholder="e.g. Grade 11, Grade 12" value={form.classesRaw} onChange={e => setForm({ ...form, classesRaw: e.target.value })} />
              <Input label="Allocated Subjects (Comma separated)" placeholder="e.g. Physics, IT Lab" value={form.subjectsRaw} onChange={e => setForm({ ...form, subjectsRaw: e.target.value })} />

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Staff Photo File Selector</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-550 focus:outline-none" />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Teacher</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
