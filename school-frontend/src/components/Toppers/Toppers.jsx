import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { studentService } from "../../services/studentService";

export const Toppers = () => {
  const [toppersList, setToppersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackToppers = [
    {
      name: "Pranav Pareek",
      class: "Grade XII (Science)",
      percentage: "98.8%",
      color: "from-sky-400 to-blue-600",
      avatarText: "PP",
      rank: "1st Rank"
    },
    {
      name: "Ananya Sharma",
      class: "Grade XII (Commerce)",
      percentage: "98.2%",
      color: "from-rose-400 to-pink-600",
      avatarText: "AS",
      rank: "2nd Rank"
    },
    {
      name: "Rohan Verma",
      class: "Grade X (Science)",
      percentage: "97.6%",
      color: "from-emerald-400 to-teal-600",
      avatarText: "RV",
      rank: "1st Rank"
    },
    {
      name: "Sneha Gupta",
      class: "Grade X (Science)",
      percentage: "97.2%",
      color: "from-indigo-400 to-purple-600",
      avatarText: "SG",
      rank: "2nd Rank"
    }
  ];

  useEffect(() => {
    studentService.getToppers()
      .then((data) => {
        if (data && data.length > 0) {
          setToppersList(data);
        } else {
          setToppersList(fallbackToppers);
        }
      })
      .catch((err) => {
        console.error("Error loading toppers database:", err);
        setToppersList(fallbackToppers);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayToppers = toppersList.length > 0 ? toppersList : fallbackToppers;

  return (
    <section id="toppers" className="relative py-24 px-6 md:px-12 bg-slate-50 overflow-hidden text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Academic Laurels</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight font-display text-center">
            Our Toppers
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed text-center">
            Celebrating our top-ranking scholars who have demonstrated outstanding academic brilliance and dedication.
          </p>
        </div>

        {/* Toppers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayToppers.map((student, idx) => {
            const getRankBorder = (rank) => {
              if (!rank) return "border-t-slate-200";
              const r = rank.toLowerCase();
              if (r.includes("1st")) return "border-t-amber-500";
              if (r.includes("2nd")) return "border-t-pink-500";
              if (r.includes("3rd")) return "border-t-emerald-500";
              return "border-t-indigo-500";
            };

            return (
              <motion.div
                key={student._id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`group p-6 rounded-2xl border-t-4 border-x border-b border-slate-100 bg-white hover:border-slate-250 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.04)] hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center justify-between relative overflow-hidden ${getRankBorder(student.rank)}`}
              >
              {/* Badge for Rank */}
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-bold uppercase tracking-wider">
                {student.rank}
              </div>

              <div className="space-y-4 flex flex-col items-center">
                {/* Photo or SVG Placeholder */}
                {student.photo ? (
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-20 h-20 rounded-full object-cover border border-slate-200 relative overflow-hidden group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${student.color || "from-sky-400 to-blue-600"} flex items-center justify-center text-white font-extrabold text-2xl shadow-inner border border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                    <span className="relative z-10 font-display">{student.avatarText}</span>
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    <div className="absolute inset-1 rounded-full border border-white/10" />
                  </div>
                )}

                {/* Name and Grade */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0f172a] font-display transition-colors group-hover:text-slate-800">
                    {student.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                    {student.class || student.grade}
                  </p>
                </div>
              </div>

              {/* Score Display */}
              <div className="w-full pt-5 mt-5 border-t border-slate-100 flex flex-col items-center">
                <span className="text-2xl font-black text-[#0f172a] font-display leading-none">
                  {student.percentage}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Aggregate Score
                </span>
              </div>
            </motion.div>
          );
        })}
        </div>

      </div>
    </section>
  );
};

export default Toppers;
