import React from "react";
import { motion } from "framer-motion";
import { Compass, Target, ShieldAlert, Award, Heart, CheckCircle2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

const sectionMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const VisionMission = ({ cms }) => {
  const visionText = cms?.visionText || "To be a leading center of educational excellence, inspiring students to achieve high scholastic results, embrace technology, think critically, and lead with empathy in a globalized community.";
  const missionText = cms?.missionText || "To provide a supportive, disciplined learning ecosystem with rigorous academics, continuous parental involvement, smart lab integrations, and creative modules to build a well-rounded foundation for life.";

  const rawValues = cms?.values
    ? (typeof cms.values === "string" ? cms.values.split(",").map(v => v.trim()) : cms.values)
    : ["Academic Rigour & Integrity", "Inclusivity & Empathy", "Discipline & Civic Duty", "Lifelong Scientific Curiosity"];

  const icons = [CheckCircle2, Heart, Award, Compass];
  const values = rawValues.map((v, i) => ({
    text: v,
    icon: icons[i % icons.length]
  }));

  return (
    <Section
      id="vision-mission"
      background="white"
      className="py-20 md:py-24 border-b border-slate-200/50"
      aria-labelledby="vision-mission-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm"
          >
            Vision, Mission & Values
          </motion.div>

          <motion.h2
            id="vision-mission-heading"
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Our Commitment to the Future
          </motion.h2>

          <motion.p
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
            className="mt-5 text-base leading-8 text-slate-600"
          >
            At Pareek Public English School, we strive to build a pathway where scientific thinking meets character building, molding children into enlightened citizens.
          </motion.p>
        </div>

        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {/* Vision Card */}
          <motion.div
            variants={cardMotion}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="h-full"
          >
            <Card className="group h-full p-8 rounded-3xl border-slate-200 bg-gradient-to-b from-white to-slate-50/30 shadow-[0_15px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.06)] hover:border-slate-350 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-150 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight text-slate-950 font-display">
                Our Vision
              </h3>
              <p className="mt-4 text-xs md:text-sm leading-7 text-slate-500 font-light">
                {visionText}
              </p>
            </Card>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            variants={cardMotion}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="h-full"
          >
            <Card className="group h-full p-8 rounded-3xl border-slate-200 bg-gradient-to-b from-white to-slate-50/30 shadow-[0_15px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.06)] hover:border-slate-350 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-150 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight text-slate-950 font-display">
                Our Mission
              </h3>
              <p className="mt-4 text-xs md:text-sm leading-7 text-slate-500 font-light">
                {missionText}
              </p>
            </Card>
          </motion.div>

          {/* Core Values Card */}
          <motion.div
            variants={cardMotion}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="h-full"
          >
            <Card className="group h-full p-8 rounded-3xl border-slate-200 bg-gradient-to-b from-white to-slate-50/30 shadow-[0_15px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.06)] hover:border-slate-350 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-150 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight text-slate-950 font-display">
                Core Pillars
              </h3>
              <div className="mt-6 space-y-4">
                {values.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{v.text}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default VisionMission;
