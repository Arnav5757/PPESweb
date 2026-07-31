import React, { useState, useEffect } from "react";
import { Save, ShieldCheck, Mail, Phone, MapPin, Sliders } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { settingsService } from "../../../services/settingsService";

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [schoolForm, setSchoolForm] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    academicYear: ""
  });

  const [smtpForm, setSmtpForm] = useState({
    host: "",
    port: 587,
    user: "",
    pass: ""
  });

  const [classesList, setClassesList] = useState("");
  const [sectionsList, setSectionsList] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      const settings = data.settings || {};
      
      setSchoolForm({
        schoolName: settings.schoolName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        academicYear: settings.academicYear || ""
      });

      setSmtpForm({
        host: settings.smtp?.host || "",
        port: settings.smtp?.port || 587,
        user: settings.smtp?.user || "",
        pass: settings.smtp?.pass || ""
      });

      setClassesList((settings.classes || []).join(", "));
      setSectionsList((settings.sections || []).join(", "));
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setFormSuccess("");
    setFormError("");

    const classes = classesList.split(",").map(c => c.trim()).filter(Boolean);
    const sections = sectionsList.split(",").map(s => s.trim()).filter(Boolean);

    const payload = {
      ...schoolForm,
      smtp: smtpForm,
      classes,
      sections
    };

    try {
      await settingsService.updateSettings(payload);
      setFormSuccess("Global settings configurations saved successfully ✅");
      setTimeout(() => setFormSuccess(""), 4000);
      fetchSettings();
    } catch (err) {
      setFormError("Failed to save global configurations.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">ERP System Settings</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Configure school profiles, active academic registries, SMTP, and portal themes
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}
      {formError && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-750 font-semibold">{formError}</div>}

      {loading ? (
        <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing settings configurations...</p>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-slate-705">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* School Profile */}
            <Card className="p-6 md:p-8 border-slate-200/60 bg-white space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> School Profile Details
              </h3>
              <Input label="School Name *" value={schoolForm.schoolName} onChange={e => setSchoolForm({ ...schoolForm, schoolName: e.target.value })} required />
              <Input label="Registered Address *" value={schoolForm.address} onChange={e => setSchoolForm({ ...schoolForm, address: e.target.value })} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Admissions Phone *" value={schoolForm.phone} onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })} required />
                <Input label="Admissions Email *" value={schoolForm.email} onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })} required />
              </div>
              <Input label="Current Academic Year *" value={schoolForm.academicYear} onChange={e => setSchoolForm({ ...schoolForm, academicYear: e.target.value })} required />
            </Card>

            {/* Academic Registers & SMTP */}
            <div className="space-y-6">
              <Card className="p-6 md:p-8 border-slate-200/60 bg-white space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Academic Registers
                </h3>
                <Input label="Active Classes (Comma separated)" value={classesList} onChange={e => setClassesList(e.target.value)} />
                <Input label="Active Sections (Comma separated)" value={sectionsList} onChange={e => setSectionsList(e.target.value)} />
              </Card>

              <Card className="p-6 md:p-8 border-slate-200/60 bg-white space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> SMTP Email Logs Config
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input label="SMTP Host" value={smtpForm.host} onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Port</label>
                    <input type="number" value={smtpForm.port} onChange={e => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SMTP User" value={smtpForm.user} onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })} />
                  <Input label="SMTP Pass" type="password" value={smtpForm.pass} onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })} />
                </div>
              </Card>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-250 flex justify-end">
            <Button type="submit" className="gap-1.5 cursor-pointer"><Save className="w-4 h-4" /> Save Settings Configuration</Button>
          </div>
        </form>
      )}
    </div>
  );
};
