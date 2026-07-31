import React from "react";
import { 
  Users, UserCheck, Bell, Image as ImageIcon, CreditCard, 
  ArrowRight, ShieldCheck, Activity, LogIn, Plus
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export const Overview = ({ 
  analytics, 
  recentLogs = [], 
  recentAdmissions = [], 
  setActiveTab 
}) => {
  // SVG Chart data helper
  const admissionTrendData = [10, 15, 30, 45, 60, 80];
  const attendanceTrendData = [92, 88, 95, 91, 93, 96];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const stats = [
    { label: "Total Students", value: analytics?.totalStudents || 0, color: "text-[#0f172a]", icon: Users },
    { label: "Today's Attendance", value: "92%", color: "text-emerald-700", icon: UserCheck },
    { label: "Pending Admissions", value: analytics?.pendingAdmissions || 0, color: "text-amber-700", icon: LogIn },
    { label: "Active Notices", value: analytics?.totalNotices || 0, color: "text-indigo-700", icon: Bell },
    { label: "Gallery Images", value: analytics?.totalGallery || 0, color: "text-slate-500", icon: ImageIcon },
    { label: "Pending Invoices", value: "3", color: "text-rose-700", icon: CreditCard }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-900">ERP System Overview</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Executive operations summary and quick controls
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {stats.map((card, idx) => (
          <Card key={idx} hoverLift className="p-5 border-slate-200/60 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {card.label}
              </span>
              <card.icon className="w-4 h-4 text-slate-400" />
            </div>
            <p className={`text-2xl font-black font-display mt-3 ${card.color}`}>
              {card.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <Card className="p-6 border-slate-200/60 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Admissions Growth Trend</h3>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-600">Monthly</span>
          </div>
          <div className="h-44 w-full flex items-end justify-between relative pt-6 pb-2 px-4">
            {/* Draw SVG Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-slate-200" />
              ))}
            </div>
            {/* SVG line */}
            <svg className="absolute inset-x-0 bottom-6 h-28 w-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                points={admissionTrendData.map((val, idx) => `${idx * 18 + 5}%,${100 - (val / 100) * 100}`).join(" ")}
                className="transition-all duration-500"
              />
              {/* Dots */}
              {admissionTrendData.map((val, idx) => (
                <circle
                  key={idx}
                  cx={`${idx * 18 + 5}%`}
                  cy={`${100 - (val / 100) * 100}%`}
                  r="4"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />
              ))}
            </svg>
            {/* Labels */}
            {months.map((m, idx) => (
              <span key={idx} className="text-[9px] font-bold text-slate-450 uppercase mt-auto z-10">{m}</span>
            ))}
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6 border-slate-200/60 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Daily Attendance Rate</h3>
            <span className="text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-emerald-700">Average 92%</span>
          </div>
          <div className="h-44 w-full flex items-end justify-around relative pt-6 pb-2 px-4">
            {/* SVG Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-slate-200" />
              ))}
            </div>
            {/* Bars */}
            {attendanceTrendData.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 z-10 w-8">
                <span className="text-[8px] font-bold text-slate-400">{val}%</span>
                <div 
                  style={{ height: `${val * 1.1}px` }} 
                  className="w-4 bg-slate-900 rounded-t-md hover:bg-slate-800 transition-all duration-300"
                />
                <span className="text-[9px] font-bold text-slate-450 uppercase">{months[idx]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom section: Recent admissions & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Admissions list */}
        <Card className="lg:col-span-8 p-6 border-slate-200/60 bg-white space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Applications</h3>
            <Button variant="text" size="sm" onClick={() => setActiveTab("admissions")} className="gap-1">
              Review all <ArrowRight className="w-3" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Applicant</th>
                  <th className="pb-3 font-bold">Grade</th>
                  <th className="pb-3 font-bold text-center">Status</th>
                  <th className="pb-3 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">No recent applications registered.</td>
                  </tr>
                ) : (
                  recentAdmissions.slice(0, 4).map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3">{item.class}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                          item.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Log and Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Button onClick={() => setActiveTab("students")} className="w-full justify-between group">
                Register Student
                <Plus className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button variant="secondary" onClick={() => setActiveTab("attendance")} className="w-full justify-between">
                Daily Attendance Grid
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("cms")} className="w-full justify-between">
                Update Homepage CMS
                <Activity className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Audit Log Card */}
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Audit Log activity
            </h3>
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <p className="text-[10px] text-slate-400 py-4 text-center">No operations audited yet.</p>
              ) : (
                recentLogs.slice(0, 3).map((log, idx) => (
                  <div key={log._id || idx} className="text-left text-[10px] space-y-0.5 border-l-2 border-slate-200 pl-3">
                    <p className="font-bold text-slate-700 leading-tight">{log.action}</p>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>By: {log.user}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
