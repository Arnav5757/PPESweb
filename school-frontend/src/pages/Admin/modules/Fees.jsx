import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, CreditCard, Filter, Save, CheckCircle, Clock } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { feeService } from "../../../services/feeService";
import { studentService } from "../../../services/studentService";

export const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    student: "",
    category: "Tuition Fee",
    amount: 1500,
    dueDate: new Date().toISOString().split("T")[0],
    remarks: ""
  });

  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const data = await feeService.getFees();
      setFees(data.fees || []);
    } catch (err) {
      console.error("Error loading fees list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents({ limit: 100 });
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error loading students list:", err);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setFormSuccess("");
    if (!form.student) return;

    try {
      await feeService.createFee(form);
      setFormSuccess("Fee invoice generated successfully ✅");
      setForm({
        student: "",
        category: "Tuition Fee",
        amount: 1500,
        dueDate: new Date().toISOString().split("T")[0],
        remarks: ""
      });
      fetchFees();
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      console.error("Error creating fee invoice:", err);
    }
  };

  const handlePayInvoice = async (id) => {
    if (!confirm("Confirm payment receipt registration?")) return;
    try {
      await feeService.payFee(id);
      fetchFees();
    } catch (err) {
      console.error("Error recording fee payment:", err);
    }
  };

  const filtered = fees.filter(f => {
    const matchesSearch = f.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? f.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Fees & Accounts ledgers</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Generate term invoices, register payments, and monitor active student collections
        </p>
      </div>

      {formSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{formSuccess}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Invoice Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Generate Fee Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Select Student *</label>
                <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                  <option value="">-- Choose student --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Fee Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                  {["Tuition Fee", "Admission Fee", "Activity Fee", "Transport Fee"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Invoice Amount *</label>
                <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Due Date *</label>
                <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none" />
              </div>

              <Input label="Remarks / Details" placeholder="Term 1 fee" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />

              <Button type="submit" className="w-full justify-center gap-1.5"><Plus className="w-4 h-4" /> Create Invoice</Button>
            </form>
          </Card>
        </div>

        {/* Ledger view list */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoices Ledger</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none">
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing invoices...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-xs">No invoices logged.</p>
              ) : (
                filtered.map((item) => (
                  <div key={item._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.student?.name || "Student"}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Category: {item.category} | Amount: ${item.amount}</p>
                      <p className="text-[9px] text-slate-400">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === "Paid" ? (
                        <span className="text-[8px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <>
                          <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-700 font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                          <Button size="sm" variant="outline" onClick={() => handlePayInvoice(item._id)} className="text-[10px] py-1 cursor-pointer">
                            Mark Paid
                          </Button>
                        </>
                      )}
                    </div>
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
