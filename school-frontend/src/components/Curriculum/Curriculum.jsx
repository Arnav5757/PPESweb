import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Award, Compass, Sparkles, Binary, Landmark } from "lucide-react";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

export const Curriculum = ({ cms }) => {
  const [activeTab, setActiveTab] = useState("primary");

  const levels = [
    {
      id: "primary",
      title: "Primary",
      subtitle: "Grades I - V",
      icon: Sparkles,
      desc: cms?.primaryDesc || "Focuses on building fundamental literacy, basic arithmetic, creative arts, and communication in a play-and-learn format.",
      subjects: cms?.primarySubjects 
        ? (typeof cms.primarySubjects === "string" ? cms.primarySubjects.split(",").map(s => s.trim()) : cms.primarySubjects)
        : ["English Language", "Mathematics", "Environmental Studies (EVS)", "Second Language (Hindi/Sanskrit)", "Art & Music", "Physical Education"],
      features: ["Play-way learning methods", "Interactive activity kits", "Patient foundational guidance"]
    },
    {
      id: "middle",
      title: "Middle",
      subtitle: "Grades VI - VIII",
      icon: Compass,
      desc: cms?.middleDesc || "Introduces structured laboratory science, social sciences, advanced mathematics, computer theory, and second/third languages.",
      subjects: cms?.middleSubjects
        ? (typeof cms.middleSubjects === "string" ? cms.middleSubjects.split(",").map(s => s.trim()) : cms.middleSubjects)
        : ["General Science", "Mathematics", "Social Sciences", "English & Literature", "Third Language", "Computer Applications"],
      features: ["Robotics & Coding workshops", "Science lab demonstrations", "Inter-house activities"]
    },
    {
      id: "secondary",
      title: "Secondary",
      subtitle: "Grades IX - X",
      icon: Binary,
      desc: cms?.secondaryDesc || "Prepares students for core board examinations, stressing laboratory work, problem-solving, and civic responsibility.",
      subjects: cms?.secondarySubjects
        ? (typeof cms.secondarySubjects === "string" ? cms.secondarySubjects.split(",").map(s => s.trim()) : cms.secondarySubjects)
        : ["Advanced Mathematics", "Physics, Chemistry & Biology", "History, Civics & Geography", "English Communicative", "Information Technology"],
      features: ["Board examination tutoring", "Career guidance counseling", "Physical & lab-based experiments"]
    },
    {
      id: "senior",
      title: "Senior Secondary",
      subtitle: "Grades XI - XII",
      icon: Landmark,
      desc: cms?.seniorDesc || "Offers specialized Commerce and Science streams with deep mentoring for engineering, medical, and financial college admissions.",
      subjects: cms?.seniorSubjects
        ? (typeof cms.seniorSubjects === "string" ? cms.seniorSubjects.split(",").map(s => s.trim()) : cms.seniorSubjects)
        : ["Science: Physics, Chemistry, Math, Biology", "Commerce: Accountancy, Business Studies, Economics", "Arts: History, Geography, Political Science, Economics", "Core English, Hindi", "Computer Science / Physical Education"],
      features: ["Specialized career streams", "College readiness preparation", "Advanced laboratory mentorship"]
    }
  ];

  const currentLevel = levels.find((l) => l.id === activeTab) || levels[0];
  const TabIcon = currentLevel.icon;

  return (
    <Section
      id="curriculum"
      background="gray"
      className="py-20 md:py-24 border-b border-slate-200/50"
      aria-labelledby="curriculum-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
            Scholastic Programs
          </div>

          <h2
            id="curriculum-heading"
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Academic Curriculum
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            Our curriculum balances fundamental academic theories with collaborative projects, physical sports, and technological literacy.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {levels.map((level) => {
            const Icon = level.icon;
            const active = level.id === activeTab;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setActiveTab(level.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer focus:outline-none ${
                  active
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                    : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-50/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{level.title}</span>
                <span className="text-[10px] opacity-60 font-light">({level.subtitle})</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="mt-10 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="p-8 md:p-10 border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.03)] rounded-[2rem] text-left">
                <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] items-start">
                  
                  {/* Left Column: Description & Methodology */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-150 text-blue-600">
                        <TabIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold font-display text-slate-950 leading-tight">
                          {currentLevel.title} Stage
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          {currentLevel.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-slate-500 font-light">
                      {currentLevel.desc}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Scholastic Highlights
                      </h4>
                      <div className="grid gap-2.5">
                        {currentLevel.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Subjects Offered */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-950 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Core Subjects
                    </h4>
                    <div className="grid gap-3">
                      {currentLevel.subjects.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-150/40 text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  );
};

export default Curriculum;
