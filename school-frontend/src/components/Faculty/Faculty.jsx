import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Sparkles, BookOpen } from "lucide-react";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { teacherService } from "../../services/teacherService";

export const Faculty = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackFaculty = [
    {
      name: "Dr. Anita Sharma",
      role: "School Principal",
      qualification: "Ph.D. in Education, M.Sc. Chemistry",
      experience: 18,
      subjects: ["Academic Coordination"],
      avatarText: "AS",
      color: "from-sky-400 to-blue-600"
    },
    {
      name: "Mr. Vikrant Verma",
      role: "Head of Science Department",
      qualification: "M.Sc. in Physics, B.Ed.",
      experience: 12,
      subjects: ["Physics", "Mechanics"],
      avatarText: "VV",
      color: "from-emerald-400 to-teal-600"
    },
    {
      name: "Mrs. Sneha Singhal",
      role: "Head of Commerce Department",
      qualification: "M.Com., MBA (Finance), B.Ed.",
      experience: 10,
      subjects: ["Accountancy", "Economics"],
      avatarText: "SS",
      color: "from-rose-400 to-pink-600"
    },
    {
      name: "Mr. Amit Patel",
      role: "Senior Robotics & ICT Mentor",
      qualification: "B.Tech. in Computer Science",
      experience: 8,
      subjects: ["Robotics", "Computer Science"],
      avatarText: "AP",
      color: "from-indigo-400 to-purple-600"
    }
  ];

  useEffect(() => {
    // Only attempt fetch, catch auth or network errors silently and use fallback
    teacherService.getTeachers()
      .then((data) => {
        if (data && data.teachers && data.teachers.length > 0) {
          // Map backend teacher format
          const formatted = data.teachers
            .filter((t) => t.status === "Active")
            .map((t) => ({
              name: t.name,
              role: t.qualification.includes("Principal") ? "Principal" : "Faculty Specialist",
              qualification: t.qualification,
              experience: t.experience || 0,
              subjects: t.subjects || [],
              photo: t.photo,
              avatarText: t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
              color: "from-blue-500 to-indigo-600"
            }));
          setTeachers(formatted.length > 0 ? formatted : fallbackFaculty);
        } else {
          setTeachers(fallbackFaculty);
        }
      })
      .catch(() => {
        // Fallback for public visitors
        setTeachers(fallbackFaculty);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const cardContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardMotion = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Section
      id="faculty"
      background="white"
      className="py-20 md:py-24 border-b border-slate-200/50"
      aria-labelledby="faculty-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            Guiding Mentors
          </div>

          <h2
            id="faculty-heading"
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Meet Our Faculty
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            A dedicated team of experienced mentors, patient educators, and subject-matter specialists committed to shaping future thinkers.
          </p>
        </div>

        {/* Faculty Grid */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {teachers.map((member, idx) => (
            <motion.div
              key={idx}
              variants={cardMotion}
              transition={{ duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <Card className="group h-full p-6 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 shadow-[0_10px_35px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-300 flex flex-col items-center justify-between text-center relative overflow-hidden">
                
                {/* Visual Avatar / Photo */}
                <div className="space-y-4 flex flex-col items-center w-full">
                  {member.photo ? (
                    <div className="w-20 h-20 rounded-full border border-slate-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-white font-extrabold text-xl shadow-inner border border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                      <span className="relative z-10 font-display">{member.avatarText}</span>
                      <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display leading-tight group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-3.5 text-left">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Qualification
                    </p>
                    <p className="text-xs text-slate-700 font-light truncate" title={member.qualification}>
                      {member.qualification}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        Experience
                      </p>
                      <p className="text-xs text-slate-800 font-medium">
                        {member.experience}+ Years
                      </p>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        Subjects
                      </p>
                      <p className="text-xs text-slate-800 font-medium truncate max-w-[100px]" title={member.subjects.join(", ")}>
                        {member.subjects.join(", ") || "General"}
                      </p>
                    </div>
                  </div>
                </div>

              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default Faculty;
