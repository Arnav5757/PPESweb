import React, { useState, useEffect } from "react";
import { UserCheck, Calendar, Filter, Save, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { attendanceService } from "../../../services/attendanceService";
import { studentService } from "../../../services/studentService";

export const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState("Grade 11");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: "Present"|"Absent"|"Late" }
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  // Re-fetch when class/section/date parameters are chosen
  const handleLoadClass = async () => {
    setLoading(true);
    setFormSuccess("");
    try {
      // 1. Fetch all students in this class/section
      const sData = await studentService.getStudents({
        class: selectedClass,
        section: selectedSection,
        limit: 100
      });
      const classStudents = sData.students || [];
      setStudents(classStudents);

      // 2. Fetch attendance log for this date/class/section
      const attData = await attendanceService.getAttendance(selectedDate, selectedClass, selectedSection);
      
      const recordsMap = {};
      if (attData.record && attData.record.records) {
        attData.record.records.forEach(r => {
          recordsMap[r.student._id || r.student] = r.status;
        });
      } else {
        // Fallback: Default all students to "Present"
        classStudents.forEach(s => {
          recordsMap[s._id] = "Present";
        });
      }
      setAttendanceRecords(recordsMap);
    } catch (err) {
      console.error("Error loading daily class details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setFormSuccess("");
    const formattedRecords = Object.keys(attendanceRecords).map(studentId => ({
      student: studentId,
      status: attendanceRecords[studentId]
    }));

    const payload = {
      date: selectedDate,
      class: selectedClass,
      section: selectedSection,
      records: formattedRecords
    };

    try {
      await attendanceService.submitAttendance(payload);
      setFormSuccess("Class attendance ledger saved successfully ✅");
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      console.error("Error saving class attendance list:", err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Attendance Register</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Take daily class attendance and manage student status records
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

      {/* Class/Section/Date Filters Panel */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
          />

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
        <Button onClick={handleLoadClass} className="cursor-pointer">Load Directory</Button>
      </div>

      {/* Attendance Grid list */}
      <Card className="p-6 border-slate-200/60 bg-white">
        {loading ? (
          <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing class attendance list...</p>
        ) : students.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-xs">Choose a class level and click 'Load Directory' to record attendance.</p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="p-4 font-bold">Roll No</th>
                    <th className="p-4 font-bold">Student Name</th>
                    <th className="p-4 font-bold text-center">Present</th>
                    <th className="p-4 font-bold text-center">Absent</th>
                    <th className="p-4 font-bold text-center">Late</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {students.map((s) => {
                    const status = attendanceRecords[s._id] || "Present";
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-900">{s.rollNumber}</td>
                        <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusChange(s._id, "Present")}
                            className="cursor-pointer focus:outline-none"
                          >
                            <CheckCircle className={`w-5 h-5 mx-auto transition-colors ${status === "Present" ? "text-emerald-600 fill-emerald-50" : "text-slate-200"}`} />
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusChange(s._id, "Absent")}
                            className="cursor-pointer focus:outline-none"
                          >
                            <XCircle className={`w-5 h-5 mx-auto transition-colors ${status === "Absent" ? "text-rose-600 fill-rose-50" : "text-slate-200"}`} />
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusChange(s._id, "Late")}
                            className="cursor-pointer focus:outline-none"
                          >
                            <Clock className={`w-5 h-5 mx-auto transition-colors ${status === "Late" ? "text-amber-500 fill-amber-50" : "text-slate-200"}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={handleSave} className="gap-1.5 cursor-pointer">
                <Save className="w-4 h-4" /> Save Attendance Register
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
