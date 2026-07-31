import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Send, CheckCircle } from "lucide-react";
import heroImg from "../../assets/hero.jpg";
import { request } from "../../services/api";

const Hero = ({ cms }) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    age: "",
    email: "",
    parentName: "",
    phone: "",
    address: ""
  });
  const [submitStatus, setSubmitStatus] = useState({ success: false, loading: false, message: "" });
  
  const heroData = {
    badge: cms?.badge || "Now Enrolling for Academic Year 2026-27",
    title: cms?.title || "In pursuit of academic excellence.",
    description: cms?.description || "Pareek Public English School balances standard studies with arts, athletics, and collaborative programs to prepare students for college and global values."
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ success: false, loading: true, message: "" });

    try {
      await request("/admission", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      setSubmitStatus({
        success: true,
        loading: false,
        message: "Your application has been received. Our admissions office will contact you via email shortly. ✅"
      });
      setFormData({ name: "", class: "", age: "", email: "", parentName: "", phone: "", address: "" });
    } catch (err) {
      setSubmitStatus({
        success: false,
        loading: false,
        message: err.message || "Failed to connect to school server. Please try again. ❌"
      });
    }
  };

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.82] saturate-[1.08]"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-slate-900/15" />

      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-20 w-full z-10 text-center flex flex-col justify-center items-center min-h-screen">
        <div className="space-y-8 max-w-3xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mx-auto"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-100 uppercase">
              {heroData.badge}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-display"
          >
            {heroData.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-xl text-slate-200 max-w-xl mx-auto font-light leading-relaxed tracking-wide"
          >
            {heroData.description}
          </motion.p>



          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#0f172a] font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102 flex items-center gap-2 cursor-pointer text-sm"
            >
              Apply Now
              <ArrowRight className="w-4.5 h-4.5 text-[#0f172a]" />
            </button>
            <button 
              onClick={() => handleScrollTo("gallery")}
              className="px-7 py-3.5 rounded-full border border-white/30 hover:border-white bg-transparent text-white font-bold tracking-wide hover:bg-white/5 transition-all duration-300 cursor-pointer text-sm"
            >
              Explore Campus
            </button>
          </motion.div>
        </div>
      </div>

      {/* Admission Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl overflow-hidden max-h-[90vh] flex flex-col text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#0f172a] font-display">Admission Application</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Student Entry Form</p>
                </div>
                <button 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-[#0f172a] transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="overflow-y-auto pt-6 space-y-5">
                {submitStatus.success ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0f172a] font-display">Application Logged</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      {submitStatus.message}
                    </p>
                    <button
                      onClick={() => {
                        setIsApplyModalOpen(false);
                        setSubmitStatus({ success: false, loading: false, message: "" });
                      }}
                      className="px-6 py-2 rounded-full bg-[#0f172a] text-white font-bold hover:bg-[#1e293b] transition-colors text-xs cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Desired Grade</label>
                        <select 
                          name="class"
                          value={formData.class}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                        >
                          <option value="">Select Grade</option>
                          {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student Age</label>
                        <input 
                          type="number" 
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 15"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. parent@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Parent/Guardian Name</label>
                        <input 
                          type="text" 
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Robert Vance"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. (555) 012-3456"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Residential Address</label>
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows="2"
                        placeholder="Input home address details..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {submitStatus.message && !submitStatus.success && (
                      <p className="text-xs text-red-500 font-semibold">{submitStatus.message}</p>
                    )}

                    <button 
                      type="submit" 
                      disabled={submitStatus.loading}
                      className="w-full py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
                    >
                      {submitStatus.loading ? (
                        <span>Processing Application...</span>
                      ) : (
                        <>
                          Submit Application
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hero;
