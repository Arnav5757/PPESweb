import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Plus, Trash2, Printer, Save } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { studentService } from "../../../services/studentService";

export const Results = () => {
  const [selectedClass, setSelectedClass] = useState("Grade 11");
  const [selectedSection, setSelectedSection] = useState("A");
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  const [resultsList, setResultsList] = useState([]);
  const [newResult, setNewResult] = useState({ subject: "", marks: 0, maxMarks: 100 });

  const handleLoadClass = async () => {
    setLoading(true);
    setSelectedStudent(null);
    setResultsList([]);
    try {
      const data = await studentService.getStudents({
        class: selectedClass,
        section: selectedSection,
        limit: 100
      });
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (stud) => {
    setSelectedStudent(stud);
    setResultsList(stud.results || []);
    setFormSuccess("");
  };

  const handleAddResult = () => {
    if (!newResult.subject) return;
    setResultsList(prev => [...prev, newResult]);
    setNewResult({ subject: "", marks: 0, maxMarks: 100 });
  };

  const handleDeleteResult = (idx) => {
    setResultsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setFormSuccess("");
    try {
      const updated = await studentService.updateStudent(selectedStudent._id, {
        results: resultsList
      });
      setFormSuccess("Student report grades saved successfully ✅");
      setSelectedStudent(updated);
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      console.error("Error saving student grades:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Academic Results Center</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Record student grades, manage report cards, and generate certificates
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

      {/* Class Filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex gap-3 items-center">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
        <Button onClick={handleLoadClass}>Load Students</Button>
      </div>

      {/* Main Grid: Student list on left, Grade entry sheet on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Student list */}
        <div className="lg:col-span-4 print:hidden">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Active Students</h3>
            {loading ? (
              <p className="text-center py-6 text-slate-400 text-xs animate-pulse">Syncing student logs...</p>
            ) : students.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">No class records loaded.</p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                {students.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleSelectStudent(s)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      selectedStudent?._id === s._id
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {s.name} (Roll: {s.rollNumber})
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Grade entry sheet */}
        <div className="lg:col-span-8 w-full">
          {selectedStudent ? (
            <Card className="p-6 md:p-8 border-slate-200/60 bg-white space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Report card header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-widest block font-display print:hidden">Student Report Card</span>
                  <h2 className="text-2xl font-black text-slate-950 font-display leading-tight">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-500 font-light">
                    Grade level: {selectedStudent.class} (Sec {selectedStudent.section}) | Adm Number: {selectedStudent.admissionNumber}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 cursor-pointer print:hidden">
                  <Printer className="w-3.5 h-3.5" /> Print Report
                </Button>
              </div>

              {/* Enter new subject result - Forms */}
              <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl flex flex-wrap gap-4 items-end text-xs print:hidden">
                <div className="flex-1 min-w-[150px]">
                  <Input
                    label="Subject Title"
                    value={newResult.subject}
                    onChange={e => setNewResult({ ...newResult, subject: e.target.value })}
                    placeholder="e.g. Physics"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Marks *</label>
                  <input type="number" value={newResult.marks} onChange={e => setNewResult({ ...newResult, marks: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none" />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Max Marks *</label>
                  <input type="number" value={newResult.maxMarks} onChange={e => setNewResult({ ...newResult, maxMarks: parseInt(e.target.value) || 100 })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none" />
                </div>
                <Button variant="secondary" size="sm" onClick={handleAddResult} className="cursor-pointer gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* Table details list */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-bold">Subject</th>
                      <th className="pb-3 font-bold text-center">Marks Obtained</th>
                      <th className="pb-3 font-bold text-center">Max Marks</th>
                      <th className="pb-3 font-bold text-center">Percentage</th>
                      <th className="pb-3 font-bold text-right print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {resultsList.length === 0 ? (
                      <tr><td colSpan="5" className="py-6 text-center text-slate-400">No subject reports recorded.</td></tr>
                    ) : (
                      resultsList.map((res, idx) => {
                        const pct = res.maxMarks > 0 ? Math.round((res.marks / res.maxMarks) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-semibold text-slate-800">{res.subject}</td>
                            <td className="py-3 text-center">{res.marks}</td>
                            <td className="py-3 text-center">{res.maxMarks}</td>
                            <td className="py-3 text-center font-bold text-slate-800">{pct}%</td>
                            <td className="py-3 text-right print:hidden">
                              <button onClick={() => handleDeleteResult(idx)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-650 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
                <Button onClick={handleSave} className="gap-1.5 cursor-pointer">
                  <Save className="w-4 h-4" /> Save Student Results
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-10 border-slate-200/60 bg-white text-center text-slate-400 text-xs">
              Select a student from the directory to review and record their academic marks.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
