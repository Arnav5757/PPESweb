import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Bell, AlertTriangle, Filter, Save } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { noticeService } from "../../../services/noticeService";

export const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "Medium",
    status: "Published",
    date: new Date().toISOString().split("T")[0]
  });

  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getNotices();
      setNotices(data.reverse()); // Show newest first
    } catch (err) {
      console.error("Error loading notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess("");
    try {
      await noticeService.createNotice(form);
      setFormSuccess("Notice logged successfully ✅");
      setForm({
        title: "",
        content: "",
        category: "General",
        priority: "Medium",
        status: "Published",
        date: new Date().toISOString().split("T")[0]
      });
      fetchNotices();
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      console.error("Error creating notice:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await noticeService.deleteNotice(id);
      fetchNotices();
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  const filtered = notices.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? n.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Notice Bulletin</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Post notices, select categories, and manage dynamic announcements
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Post Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Log Notice Bulletin</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input label="Notice Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Winter Break Schedule..." />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Category Tag *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                    {["General", "Academic", "Event", "Exam"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Priority Level *</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                    {["Low", "Medium", "High"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Log Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Status *</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Notice Content *</label>
                <textarea required rows="4" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Details description of announcement..." className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none resize-none" />
              </div>

              <Button type="submit" className="w-full justify-center gap-1.5"><Save className="w-4 h-4" /> Save Notice</Button>
            </form>
          </Card>
        </div>

        {/* Notices list */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Bulletins</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none">
                  <option value="">All Categories</option>
                  {["General", "Academic", "Event", "Exam"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing notices...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-xs">No notices found.</p>
              ) : (
                filtered.map((item) => (
                  <div key={item._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[8px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase text-slate-600">{item.category || "Notice"}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                          item.priority === "High" 
                            ? "bg-rose-50 text-rose-700 border border-rose-200" 
                            : item.priority === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-650 border border-slate-200"
                        }`}>{item.priority || "Medium"} Priority</span>
                        {item.status === "Draft" && <span className="text-[8px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold uppercase">Draft</span>}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-slate-550 font-light leading-relaxed">{item.content}</p>
                      <p className="text-[9px] text-slate-400">{item.date}</p>
                    </div>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-650 hover:bg-red-50 cursor-pointer transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
