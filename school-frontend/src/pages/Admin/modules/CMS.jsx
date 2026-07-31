import React, { useState, useEffect } from "react";
import { Save, Info, ArrowRight, BookOpen, User, Phone, Compass, Binary, ClipboardList } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { cmsService } from "../../../services/cmsService";

export const CMS = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [cmsData, setCmsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Section fields templates
  const [heroForm, setHeroForm] = useState({ badge: "", title: "", description: "" });
  const [whyForm, setWhyForm] = useState({ badge: "", title: "", description: "" });
  const [directorForm, setDirectorForm] = useState({ title: "", content: "" });
  const [contactForm, setContactForm] = useState({ address: "", phone: "", email: "" });

  const [visionMissionForm, setVisionMissionForm] = useState({ visionText: "", missionText: "", values: "" });
  
  const [curriculumForm, setCurriculumForm] = useState({
    primaryDesc: "", primarySubjects: "",
    middleDesc: "", middleSubjects: "",
    secondaryDesc: "", secondarySubjects: "",
    seniorDesc: "", seniorSubjects: ""
  });

  const [admissionsForm, setAdmissionsForm] = useState({
    step1Title: "", step1Desc: "",
    step2Title: "", step2Desc: "",
    step3Title: "", step3Desc: "",
    step4Title: "", step4Desc: "",
    docChecklist: "",
    faq1Q: "", faq1A: "",
    faq2Q: "", faq2A: "",
    faq3Q: "", faq3A: "",
    faq4Q: "", faq4A: ""
  });

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const data = await cmsService.getCMS();
      const cms = data.cms || {};
      setCmsData(cms);

      // Map values or fall back to empty
      setHeroForm({
        badge: cms.hero?.badge || "Academic Session 2026-27",
        title: cms.hero?.title || "Where Futuristic Minds Learn, Create & Excel",
        description: cms.hero?.description || "Providing a standard STEAM curriculum, advanced robotics lab modules, and holistic mentorship."
      });

      setWhyForm({
        badge: cms.why?.badge || "Why Choose Us",
        title: cms.why?.title || "Why choose Pareek Public English School?",
        description: cms.why?.description || "Parents look for a school that is academically sincere, emotionally supportive, and consistent in everyday discipline."
      });

      setDirectorForm({
        title: cms.director?.title || "Welcome to Pareek Academy",
        content: cms.director?.content || "Dear parents, students, and educators. Our vision is to empower young minds with digital literacy, critical thinking, and social values."
      });

      setContactForm({
        address: cms.contact?.address || "Maruti Nagar, Ralayata-Guradiya road, Mandsaur M.P. - 458002",
        phone: cms.contact?.phone || "+91 9926677011",
        email: cms.contact?.email || "admissions@pareek.edu"
      });

      setVisionMissionForm({
        visionText: cms.vision_mission?.visionText || "To be a leading center of educational excellence, inspiring students to achieve high scholastic results, embrace technology, think critically, and lead with empathy in a globalized community.",
        missionText: cms.vision_mission?.missionText || "To provide a supportive, disciplined learning ecosystem with rigorous academics, continuous parental involvement, smart lab integrations, and creative modules to build a well-rounded foundation for life.",
        values: (cms.vision_mission?.values || []).join(", ") || "Academic Rigour & Integrity, Inclusivity & Empathy, Discipline & Civic Duty, Lifelong Scientific Curiosity"
      });

      setCurriculumForm({
        primaryDesc: cms.curriculum?.primaryDesc || "Focuses on building fundamental literacy, basic arithmetic, creative arts, and communication in a play-and-learn format.",
        primarySubjects: (cms.curriculum?.primarySubjects || []).join(", ") || "English Language, Mathematics, Environmental Studies (EVS), Second Language (Hindi/Sanskrit), Art & Music, Physical Education",
        middleDesc: cms.curriculum?.middleDesc || "Introduces structured laboratory science, social sciences, advanced mathematics, computer theory, and second/third languages.",
        middleSubjects: (cms.curriculum?.middleSubjects || []).join(", ") || "General Science, Mathematics, Social Sciences, English & Literature, Third Language, Computer Applications",
        secondaryDesc: cms.curriculum?.secondaryDesc || "Prepares students for core board examinations, stressing laboratory work, problem-solving, and civic responsibility.",
        secondarySubjects: (cms.curriculum?.secondarySubjects || []).join(", ") || "Advanced Mathematics, Physics, Chemistry & Biology, History, Civics & Geography, English Communicative, Information Technology",
        seniorDesc: cms.curriculum?.seniorDesc || "Offers specialized Commerce and Science streams with deep mentoring for engineering, medical, and financial college admissions.",
        seniorSubjects: (cms.curriculum?.seniorSubjects || []).join(", ") || "Science: Physics, Chemistry, Math, Biology, Commerce: Accountancy, Business Studies, Economics, Arts: History, Geography, Political Science, Economics, Core English, Hindi, Computer Science / Physical Education"
      });

      setAdmissionsForm({
        step1Title: cms.admissions?.step1Title || "Online Inquiry / Visit",
        step1Desc: cms.admissions?.step1Desc || "Fill the admission form online or visit the school campus to consult our counsellors.",
        step2Title: cms.admissions?.step2Title || "Document Submission",
        step2Desc: cms.admissions?.step2Desc || "Submit Aadhaar card, past reports, birth certificate, and transfer certificate copies.",
        step3Title: cms.admissions?.step3Title || "Student Assessment",
        step3Desc: cms.admissions?.step3Desc || "A friendly aptitude interaction and evaluation to understand the student's level.",
        step4Title: cms.admissions?.step4Title || "Seat Allocation & Fees",
        step4Desc: cms.admissions?.step4Desc || "Upon selection, complete the fee submission to confirm class registration.",
        docChecklist: (cms.admissions?.docChecklist || []).join(", ") || "Original Birth Certificate of the student, Transfer Certificate (TC) from the previous recognized school, Previous Class Progress Report / Marksheet, Recent Passport-size Photographs (Student & Parents), Photocopy of Student Aadhaar Card, Migration Certificate (only for Grade XI admissions, if applicable)",
        faq1Q: cms.admissions?.faq1Q || "What is the age criteria for grade admission?",
        faq1A: cms.admissions?.faq1A || "For entry into Grade 9, the student must be at least 14 years of age as of March 31st of the academic year. Similar standard guidelines apply to higher grades.",
        faq2Q: cms.admissions?.faq2Q || "Is there a school transport facility available?",
        faq2A: cms.admissions?.faq2A || "Yes, the school operates a well-managed fleet of buses covering key residential hubs in Maruti Nagar, Guradiya, and major routes in Mandsaur.",
        faq3Q: cms.admissions?.faq3Q || "What are the fee payment options?",
        faq3A: cms.admissions?.faq3A || "Quarterly school fees can be paid digitally via UPI/Debit/Credit card through the Student Portal login dashboard, or physically at the school fee desk.",
        faq4Q: cms.admissions?.faq4Q || "Which board syllabus does the school follow?",
        faq4A: cms.admissions?.faq4A || "We follow a comprehensive standard syllabus modeled around MPBSE (a board of education for madhya pradesh), emphasizing robotics, ICT literacy, and competitive exam readiness."
      });

    } catch (err) {
      console.error("Error loading CMS details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    setFormSuccess("");
    setFormError("");
    try {
      await cmsService.saveCMS(key, value);
      setFormSuccess("Website content updated successfully! Instantly live ✅");
      setTimeout(() => setFormSuccess(""), 4000);
      fetchCms();
    } catch (err) {
      setFormError("CMS save failed. Please check backend connections.");
    }
  };

  const handleSaveVisionMission = async (e) => {
    e.preventDefault();
    const payload = {
      visionText: visionMissionForm.visionText,
      missionText: visionMissionForm.missionText,
      values: visionMissionForm.values.split(",").map(v => v.trim()).filter(Boolean)
    };
    handleSave("vision_mission", payload);
  };

  const handleSaveCurriculum = async (e) => {
    e.preventDefault();
    const payload = {
      primaryDesc: curriculumForm.primaryDesc,
      primarySubjects: curriculumForm.primarySubjects.split(",").map(s => s.trim()).filter(Boolean),
      middleDesc: curriculumForm.middleDesc,
      middleSubjects: curriculumForm.middleSubjects.split(",").map(s => s.trim()).filter(Boolean),
      secondaryDesc: curriculumForm.secondaryDesc,
      secondarySubjects: curriculumForm.secondarySubjects.split(",").map(s => s.trim()).filter(Boolean),
      seniorDesc: curriculumForm.seniorDesc,
      seniorSubjects: curriculumForm.seniorSubjects.split(",").map(s => s.trim()).filter(Boolean)
    };
    handleSave("curriculum", payload);
  };

  const handleSaveAdmissions = async (e) => {
    e.preventDefault();
    const payload = {
      step1Title: admissionsForm.step1Title,
      step1Desc: admissionsForm.step1Desc,
      step2Title: admissionsForm.step2Title,
      step2Desc: admissionsForm.step2Desc,
      step3Title: admissionsForm.step3Title,
      step3Desc: admissionsForm.step3Desc,
      step4Title: admissionsForm.step4Title,
      step4Desc: admissionsForm.step4Desc,
      docChecklist: admissionsForm.docChecklist.split(",").map(d => d.trim()).filter(Boolean),
      faq1Q: admissionsForm.faq1Q,
      faq1A: admissionsForm.faq1A,
      faq2Q: admissionsForm.faq2Q,
      faq2A: admissionsForm.faq2A,
      faq3Q: admissionsForm.faq3Q,
      faq3A: admissionsForm.faq3A,
      faq4Q: admissionsForm.faq4Q,
      faq4A: admissionsForm.faq4A
    };
    handleSave("admissions", payload);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Website CMS Manager</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Edit landing page blocks and contact details dynamically
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}
      {formError && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{formError}</div>}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: CMS section selector */}
        <div className="lg:col-span-4 space-y-3">
          {[
            { id: "hero", label: "Hero Banner", icon: BookOpen },
            { id: "why", label: "Why Choose Us", icon: Info },
            { id: "vision_mission", label: "Vision & Mission", icon: Compass },
            { id: "director", label: "Director Message", icon: User },
            { id: "curriculum", label: "Curriculum Stages", icon: Binary },
            { id: "admissions", label: "Admissions & FAQs", icon: ClipboardList },
            { id: "contact", label: "Contact Info", icon: Phone }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                setFormSuccess("");
                setFormError("");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border text-left cursor-pointer ${
                activeSection === sec.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <sec.icon className="w-4 h-4" />
                {sec.label}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Right Side: Edit Input fields form */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8 border-slate-200/60 bg-white">
            {loading ? (
              <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing website content details...</p>
            ) : (
              <div className="space-y-6">
                {/* 1. HERO SECTION FORM */}
                {activeSection === "hero" && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave("hero", heroForm); }} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Hero Banner Configuration</h3>
                    <Input label="Section Badge" value={heroForm.badge} onChange={e => setHeroForm({ ...heroForm, badge: e.target.value })} />
                    <Input label="Main Heading / Title Text" value={heroForm.title} onChange={e => setHeroForm({ ...heroForm, title: e.target.value })} />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Description Copy</label>
                      <textarea rows="3" value={heroForm.description} onChange={e => setHeroForm({ ...heroForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Hero Section</Button>
                    </div>
                  </form>
                )}

                {/* 2. WHY CHOOSE US FORM */}
                {activeSection === "why" && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave("why", whyForm); }} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Why Choose Us Summary Configuration</h3>
                    <Input label="Section Badge" value={whyForm.badge} onChange={e => setWhyForm({ ...whyForm, badge: e.target.value })} />
                    <Input label="Why Choose Us Heading" value={whyForm.title} onChange={e => setWhyForm({ ...whyForm, title: e.target.value })} />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Sub-paragraph / Details Description</label>
                      <textarea rows="3" value={whyForm.description} onChange={e => setWhyForm({ ...whyForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Summary section</Button>
                    </div>
                  </form>
                )}

                {/* 3. VISION & MISSION FORM */}
                {activeSection === "vision_mission" && (
                  <form onSubmit={handleSaveVisionMission} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Vision, Mission & Pillars Configuration</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Our Vision Statement</label>
                      <textarea rows="3" value={visionMissionForm.visionText} onChange={e => setVisionMissionForm({ ...visionMissionForm, visionText: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Our Mission Statement</label>
                      <textarea rows="3" value={visionMissionForm.missionText} onChange={e => setVisionMissionForm({ ...visionMissionForm, missionText: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <Input label="Core Value Pillars (Comma separated)" value={visionMissionForm.values} onChange={e => setVisionMissionForm({ ...visionMissionForm, values: e.target.value })} />
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Vision & Values</Button>
                    </div>
                  </form>
                )}

                {/* 4. DIRECTOR MESSAGE FORM */}
                {activeSection === "director" && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave("director", directorForm); }} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Director's Welcome Message</h3>
                    <Input label="Section Title" value={directorForm.title} onChange={e => setDirectorForm({ ...directorForm, title: e.target.value })} />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Director message content (Use double enter \n\n for new paragraphs)</label>
                      <textarea rows="6" value={directorForm.content} onChange={e => setDirectorForm({ ...directorForm, content: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Welcome message</Button>
                    </div>
                  </form>
                )}

                {/* 5. CURRICULUM FORM */}
                {activeSection === "curriculum" && (
                  <form onSubmit={handleSaveCurriculum} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Academics Curriculum Stages</h3>
                    
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <h4 className="font-bold text-blue-600">Primary Stage (Grades I - V)</h4>
                      <Input label="Stage Description" value={curriculumForm.primaryDesc} onChange={e => setCurriculumForm({ ...curriculumForm, primaryDesc: e.target.value })} />
                      <Input label="Core Subjects (Comma separated)" value={curriculumForm.primarySubjects} onChange={e => setCurriculumForm({ ...curriculumForm, primarySubjects: e.target.value })} />
                    </div>

                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <h4 className="font-bold text-emerald-600">Middle Stage (Grades VI - VIII)</h4>
                      <Input label="Stage Description" value={curriculumForm.middleDesc} onChange={e => setCurriculumForm({ ...curriculumForm, middleDesc: e.target.value })} />
                      <Input label="Core Subjects (Comma separated)" value={curriculumForm.middleSubjects} onChange={e => setCurriculumForm({ ...curriculumForm, middleSubjects: e.target.value })} />
                    </div>

                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <h4 className="font-bold text-indigo-600">Secondary Stage (Grades IX - X)</h4>
                      <Input label="Stage Description" value={curriculumForm.secondaryDesc} onChange={e => setCurriculumForm({ ...curriculumForm, secondaryDesc: e.target.value })} />
                      <Input label="Core Subjects (Comma separated)" value={curriculumForm.secondarySubjects} onChange={e => setCurriculumForm({ ...curriculumForm, secondarySubjects: e.target.value })} />
                    </div>

                    <div className="space-y-2 pb-4">
                      <h4 className="font-bold text-amber-600">Senior Secondary Stage (Grades XI - XII)</h4>
                      <Input label="Stage Description" value={curriculumForm.seniorDesc} onChange={e => setCurriculumForm({ ...curriculumForm, seniorDesc: e.target.value })} />
                      <Input label="Core Subjects (Comma separated)" value={curriculumForm.seniorSubjects} onChange={e => setCurriculumForm({ ...curriculumForm, seniorSubjects: e.target.value })} />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Curriculum Details</Button>
                    </div>
                  </form>
                )}

                {/* 6. ADMISSIONS & FAQS FORM */}
                {activeSection === "admissions" && (
                  <form onSubmit={handleSaveAdmissions} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">Admissions Timeline, Checklist & FAQs</h3>
                    
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <h4 className="font-bold text-slate-900">Admission Process Steps</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Step 1 Title" value={admissionsForm.step1Title} onChange={e => setAdmissionsForm({ ...admissionsForm, step1Title: e.target.value })} />
                        <Input label="Step 1 Desc" value={admissionsForm.step1Desc} onChange={e => setAdmissionsForm({ ...admissionsForm, step1Desc: e.target.value })} />
                        <Input label="Step 2 Title" value={admissionsForm.step2Title} onChange={e => setAdmissionsForm({ ...admissionsForm, step2Title: e.target.value })} />
                        <Input label="Step 2 Desc" value={admissionsForm.step2Desc} onChange={e => setAdmissionsForm({ ...admissionsForm, step2Desc: e.target.value })} />
                        <Input label="Step 3 Title" value={admissionsForm.step3Title} onChange={e => setAdmissionsForm({ ...admissionsForm, step3Title: e.target.value })} />
                        <Input label="Step 3 Desc" value={admissionsForm.step3Desc} onChange={e => setAdmissionsForm({ ...admissionsForm, step3Desc: e.target.value })} />
                        <Input label="Step 4 Title" value={admissionsForm.step4Title} onChange={e => setAdmissionsForm({ ...admissionsForm, step4Title: e.target.value })} />
                        <Input label="Step 4 Desc" value={admissionsForm.step4Desc} onChange={e => setAdmissionsForm({ ...admissionsForm, step4Desc: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <h4 className="font-bold text-slate-900">Checklist</h4>
                      <Input label="Required Documents (Comma separated)" value={admissionsForm.docChecklist} onChange={e => setAdmissionsForm({ ...admissionsForm, docChecklist: e.target.value })} />
                    </div>

                    <div className="space-y-2 pb-4">
                      <h4 className="font-bold text-slate-900">Frequently Asked Questions (FAQ Accordion)</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <Input label="FAQ #1: Question" value={admissionsForm.faq1Q} onChange={e => setAdmissionsForm({ ...admissionsForm, faq1Q: e.target.value })} />
                          <Input label="FAQ #1: Answer" value={admissionsForm.faq1A} onChange={e => setAdmissionsForm({ ...admissionsForm, faq1A: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <Input label="FAQ #2: Question" value={admissionsForm.faq2Q} onChange={e => setAdmissionsForm({ ...admissionsForm, faq2Q: e.target.value })} />
                          <Input label="FAQ #2: Answer" value={admissionsForm.faq2A} onChange={e => setAdmissionsForm({ ...admissionsForm, faq2A: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <Input label="FAQ #3: Question" value={admissionsForm.faq3Q} onChange={e => setAdmissionsForm({ ...admissionsForm, faq3Q: e.target.value })} />
                          <Input label="FAQ #3: Answer" value={admissionsForm.faq3A} onChange={e => setAdmissionsForm({ ...admissionsForm, faq3A: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <Input label="FAQ #4: Question" value={admissionsForm.faq4Q} onChange={e => setAdmissionsForm({ ...admissionsForm, faq4Q: e.target.value })} />
                          <Input label="FAQ #4: Answer" value={admissionsForm.faq4A} onChange={e => setAdmissionsForm({ ...admissionsForm, faq4A: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Admission Info</Button>
                    </div>
                  </form>
                )}

                {/* 7. CONTACT INFO FORM */}
                {activeSection === "contact" && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave("contact", contactForm); }} className="space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-2">School Contact & Footer Information</h3>
                    <Input label="Registered Address" value={contactForm.address} onChange={e => setContactForm({ ...contactForm, address: e.target.value })} />
                    <Input label="Contact Phone Number" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
                    <Input label="Registered Admissions Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button type="submit" size="sm" className="gap-1.5"><Save className="w-4 h-4" /> Save Contact Details</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
