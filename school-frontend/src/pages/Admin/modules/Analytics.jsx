import React from "react";
import { Award, UserCheck, ShieldCheck, BarChart2 } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export const Analytics = () => {
  // SVG Graphic trends data
  const growthMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthValues = [40, 50, 48, 65, 78, 95];
  const distributionData = [
    { label: "Primary (1-5)", value: 45, color: "bg-blue-600", width: "45%" },
    { label: "Middle (6-8)", value: 30, color: "bg-emerald-600", width: "30%" },
    { label: "Secondary (9-12)", value: 25, color: "bg-slate-900", width: "25%" }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Analytics & Reports</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Detailed metrics, school population charts, and academic audits
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200/60 bg-white flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average GPA Percentage</span>
            <span className="text-2xl font-black font-display text-slate-900">88.5%</span>
          </div>
          <Award className="w-8 h-8 text-indigo-500 stroke-[1.2]" />
        </Card>
        <Card className="p-6 border-slate-200/60 bg-white flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Attendance Ratio</span>
            <span className="text-2xl font-black font-display text-slate-900">91.8%</span>
          </div>
          <UserCheck className="w-8 h-8 text-emerald-500 stroke-[1.2]" />
        </Card>
        <Card className="p-6 border-slate-200/60 bg-white flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fee Collection Ratio</span>
            <span className="text-2xl font-black font-display text-slate-900">96.2%</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-teal-500 stroke-[1.2]" />
        </Card>
      </div>

      {/* Visual Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Student Growth Chart */}
        <Card className="lg:col-span-8 p-6 border-slate-200/60 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Student Enrollment Growth Index</h3>
            <span className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-600">6 Months</span>
          </div>
          
          <div className="h-48 w-full flex items-end justify-between relative pt-6 pb-2 px-4">
            {/* SVG Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-slate-200" />
              ))}
            </div>
            
            <svg className="absolute inset-x-0 bottom-6 h-32 w-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                points={growthValues.map((val, idx) => `${idx * 18 + 5}%,${100 - (val / 100) * 100}`).join(" ")}
              />
              {growthValues.map((val, idx) => (
                <circle
                  key={idx}
                  cx={`${idx * 18 + 5}%`}
                  cy={`${100 - (val / 100) * 100}%`}
                  r="4"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              ))}
            </svg>

            {growthMonths.map((m, idx) => (
              <span key={idx} className="text-[9px] font-bold text-slate-450 mt-auto z-10">{m}</span>
            ))}
          </div>
        </Card>

        {/* Population Distribution */}
        <Card className="lg:col-span-4 p-6 border-slate-200/60 bg-white space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3">Population Distribution</h3>
          
          <div className="space-y-4 pt-2">
            {distributionData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div style={{ width: item.width }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
