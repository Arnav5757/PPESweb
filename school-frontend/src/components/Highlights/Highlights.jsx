import { motion } from "framer-motion";
import { BookOpen, Building, GraduationCap, Trophy, Users, Heart, ShieldCheck } from "lucide-react";

export const Highlights = () => {
  const cards = [
    {
      icon: BookOpen,
      title: "Smart Learning",
      desc: "Interactive curriculum blending standard studies with creative technology, programming, and digital collaboration modules.",
      borderColor: "border-t-blue-500",
      iconBg: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
      accentGlow: "group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.06)]"
    },
    {
      icon: Building,
      title: "Modern Campus",
      desc: "Spacious academic grounds featuring clean design, modern classrooms, specialized science labs, and athletic fields.",
      borderColor: "border-t-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
      accentGlow: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)]"
    },
    {
      icon: GraduationCap,
      title: "Student Excellence",
      desc: "Comprehensive mentoring programs supporting collegiate readiness, personal discipline, and civic leadership development.",
      borderColor: "border-t-amber-500",
      iconBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-600",
      accentGlow: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.06)]"
    }
  ];

  const stats = [
    {
      icon: Trophy,
      value: "15+ Years",
      label: "Educational Legacy",
      desc: "Sincere academic dedication since 2011",
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-50 text-amber-600"
    },
    {
      icon: Users,
      value: "500+",
      label: "Alumni Network",
      desc: "Scholars studying in premium colleges",
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600"
    },
    {
      icon: Heart,
      value: "25+",
      label: "Pedagogic Mentors",
      desc: "Experienced, patient guiding faculty",
      color: "from-rose-500 to-pink-600",
      iconBg: "bg-rose-50 text-rose-600"
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Safety & Security",
      desc: "Completely safe, supportive environment",
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <section id="highlights" className="relative py-24 px-6 md:px-12 bg-slate-50 overflow-hidden text-left">
      {/* Decorative gradient radial glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-50/50 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-blue-50/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Section 1: Pillars of Education */}
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-block px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Academy Core</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight font-display text-center">
              Pillars of Education
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed text-center">
              A balanced approach prioritizing scholastic achievement, character building, and creative development.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`group p-8 rounded-2xl border-t-4 border-x border-b border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${card.borderColor} ${card.accentGlow}`}
                >
                  <div className="space-y-5">
                    <div className={`w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:text-white group-hover:scale-105 ${card.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-[#0f172a] font-display">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Divider line */}
        <div className="w-full h-px bg-slate-200/60" />

        {/* Section 2: School Statistics Counter Dashboard */}
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-block px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Impact & Scale</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight font-display text-center">
              School at a Glance
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed text-center">
              Our credentials reflect years of educational dedication, student progress, and parental confidence.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                      <StatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-display`}>
                        {stat.value}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {stat.label}
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-1 leading-normal font-light">
                        {stat.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Highlights;
