import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckSquare, HelpCircle, ChevronDown, Landmark, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

export const AdmissionsInfo = ({ cms }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const steps = [
    {
      num: "01",
      title: cms?.step1Title || "Online Inquiry / Visit",
      desc: cms?.step1Desc || "Fill the admission form online or visit the school campus to consult our counsellors."
    },
    {
      num: "02",
      title: cms?.step2Title || "Document Submission",
      desc: cms?.step2Desc || "Submit Aadhaar card, past reports, birth certificate, and transfer certificate copies."
    },
    {
      num: "03",
      title: cms?.step3Title || "Student Assessment",
      desc: cms?.step3Desc || "A friendly aptitude interaction and evaluation to understand the student's level."
    },
    {
      num: "04",
      title: cms?.step4Title || "Seat Allocation & Fees",
      desc: cms?.step4Desc || "Upon selection, complete the fee submission to confirm class registration."
    }
  ];

  const docs = cms?.docChecklist
    ? (typeof cms.docChecklist === "string" ? cms.docChecklist.split(",").map(d => d.trim()) : cms.docChecklist)
    : [
        "Original Birth Certificate of the student",
        "Transfer Certificate (TC) from the previous recognized school",
        "Previous Class Progress Report / Marksheet",
        "Recent Passport-size Photographs (Student & Parents)",
        "Photocopy of Student Aadhaar Card",
        "Migration Certificate (only for Grade XI admissions, if applicable)"
      ];

  const faqs = [
    {
      q: cms?.faq1Q || "What is the age criteria for grade admission?",
      a: cms?.faq1A || "For entry into Grade 9, the student must be at least 14 years of age as of March 31st of the academic year. Similar standard guidelines apply to higher grades."
    },
    {
      q: cms?.faq2Q || "Is there a school transport facility available?",
      a: cms?.faq2A || "Yes, the school operates a well-managed fleet of buses covering key residential hubs in Maruti Nagar, Guradiya, and major routes in Mandsaur."
    },
    {
      q: cms?.faq3Q || "What are the fee payment options?",
      a: cms?.faq3A || "Quarterly school fees can be paid digitally via UPI/Debit/Credit card through the Student Portal login dashboard, or physically at the school fee desk."
    },
    {
      q: cms?.faq4Q || "Which board syllabus does the school follow?",
      a: cms?.faq4A || "We follow a comprehensive standard syllabus modeled around MPBSE (a board of education for madhya pradesh), emphasizing robotics, ICT literacy, and competitive exam readiness."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <Section
      id="admissions-info"
      background="gray"
      className="py-20 md:py-24 border-b border-slate-200/50 text-left"
      aria-labelledby="admissions-info-heading"
    >
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
            Admissions Hub
          </div>

          <h2
            id="admissions-info-heading"
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Admissions Guide
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            A comprehensive overview of our onboarding steps, standard document requirements, and frequently asked parent queries.
          </p>
        </div>

        {/* Timeline & Documents Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          
          {/* Column 1: Admission Steps */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-slate-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Step-by-Step Process
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, idx) => (
                <Card key={idx} className="p-6 border-slate-200 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:border-slate-300 transition-all duration-300">
                  <span className="text-2xl font-black text-blue-600/20 font-display block mb-3">
                    {step.num}
                  </span>
                  <h4 className="text-sm font-bold text-slate-950 font-display">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-xs leading-6 text-slate-500 font-light">
                    {step.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Column 2: Documents Required */}
          <div className="flex flex-col">
            <Card className="h-full p-6 md:p-8 border-slate-200 bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(15,23,42,0.02)] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-950 flex items-center gap-2 mb-6">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  Required Documents
                </h3>

                <div className="space-y-4">
                  {docs.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 shrink-0 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-slate-600 leading-normal">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-5">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">
                  Note: Bring original files along with two copies of photocopies during assessment.
                </p>
              </div>
            </Card>
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="mt-16 max-w-3xl mx-auto space-y-6">
          <h3 className="text-xl font-bold font-display text-slate-950 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-xs sm:text-sm text-slate-950 hover:bg-slate-50/50 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 border-t border-slate-100/60 pt-4 text-xs sm:text-sm text-slate-500 font-light leading-7">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </Container>
    </Section>
  );
};

export default AdmissionsInfo;
