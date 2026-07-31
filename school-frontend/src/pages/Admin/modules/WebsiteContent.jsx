import React, { useState, useEffect } from "react";
import { Award, Bell, Image as ImageIcon, Plus, Trash2, Edit, Save, XCircle, User } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { topperService } from "../../../services/topperService";
import { Notices } from "./Notices";
import { Gallery } from "./Gallery";

export const WebsiteContent = () => {
  const [subTab, setSubTab] = useState("topper"); // notice, gallery, topper
  const [toppers, setToppers] = useState([]);
  const [loadingToppers, setLoadingToppers] = useState(true);
  const [showTopperModal, setShowTopperModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [topperForm, setTopperForm] = useState({
    name: "",
    class: "",
    percentage: "",
    rank: "1st Rank",
    photo: "",
    color: "from-sky-400 to-blue-600"
  });

  const [topperMessage, setTopperMessage] = useState("");
  const [topperError, setTopperError] = useState("");

  const colorGradients = [
    { label: "Ocean Blue", value: "from-sky-400 to-blue-600" },
    { label: "Blossom Pink", value: "from-rose-400 to-pink-600" },
    { label: "Emerald Teal", value: "from-emerald-400 to-teal-600" },
    { label: "Royal Purple", value: "from-indigo-400 to-purple-600" },
    { label: "Sunset Amber", value: "from-amber-400 to-orange-600" }
  ];

  useEffect(() => {
    if (subTab === "topper") {
      fetchToppers();
    }
  }, [subTab]);

  const fetchToppers = async () => {
    setLoadingToppers(true);
    try {
      const data = await topperService.getToppers();
      setToppers(data || []);
    } catch (err) {
      console.error("Error fetching toppers database:", err);
    } finally {
      setLoadingToppers(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setTopperForm({ ...topperForm, photo: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleTopperSubmit = async (e) => {
    e.preventDefault();
    setTopperMessage("");
    setTopperError("");

    if (!topperForm.name || !topperForm.class || !topperForm.percentage || !topperForm.rank) {
      setTopperError("Name, Class, Percentage, and Rank are required fields.");
      return;
    }

    try {
      if (isEditMode) {
        await topperService.updateTopper(editId, topperForm);
        setTopperMessage("Topper profile updated successfully ✅");
      } else {
        await topperService.createTopper(topperForm);
        setTopperMessage("Topper profile added successfully ✅");
      }
      fetchToppers();
      setTimeout(() => {
        setShowTopperModal(false);
        setTopperMessage("");
      }, 1500);
    } catch (err) {
      setTopperError(err.message || "Failed to save topper info.");
    }
  };

  const handleEditClick = (topper) => {
    setIsEditMode(true);
    setEditId(topper._id);
    setTopperForm({
      name: topper.name || "",
      class: topper.class || "",
      percentage: topper.percentage || "",
      rank: topper.rank || "1st Rank",
      photo: topper.photo || "",
      color: topper.color || "from-sky-400 to-blue-600"
    });
    setTopperError("");
    setTopperMessage("");
    setShowTopperModal(true);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setTopperForm({
      name: "",
      class: "",
      percentage: "",
      rank: "1st Rank",
      photo: "",
      color: "from-sky-400 to-blue-600"
    });
    setTopperError("");
    setTopperMessage("");
    setShowTopperModal(true);
  };

  const handleDeleteTopper = async (id) => {
    if (!confirm("Are you sure you want to delete this topper record?")) return;
    try {
      await topperService.deleteTopper(id);
      fetchToppers();
    } catch (err) {
      console.error("Error deleting topper:", err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Sub Tabs Selection Navigation */}
      <div className="flex border-b border-slate-200 gap-1.5 pb-0">
        <button
          onClick={() => setSubTab("topper")}
          className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "topper"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          Our Toppers
        </button>
        <button
          onClick={() => setSubTab("notice")}
          className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "notice"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notices
        </button>
        <button
          onClick={() => setSubTab("gallery")}
          className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "gallery"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Gallery
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {subTab === "notice" && <Notices />}
      {subTab === "gallery" && <Gallery />}
      {subTab === "topper" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900">Academic Toppers Management</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Configure students featured in the public "Our Toppers" section
              </p>
            </div>
            <Button onClick={handleAddClick} className="flex items-center gap-2 text-xs py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md border-0 self-start sm:self-auto cursor-pointer">
              <Plus className="w-4 h-4" /> Add New Topper
            </Button>
          </div>

          {loadingToppers ? (
            <div className="py-12 text-center text-slate-500 text-xs font-semibold animate-pulse uppercase tracking-wider">
              Loading top achievers data...
            </div>
          ) : toppers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-250 rounded-2xl bg-white space-y-4">
              <Award className="w-12 h-12 text-slate-350 stroke-[1.2] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">No Toppers Added Yet</p>
                <p className="text-xs text-slate-450">Add toppers to showcase their profiles on the school homepage.</p>
              </div>
              <Button onClick={handleAddClick} className="text-xs py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-850 border-0 rounded-xl cursor-pointer">
                Create First Topper Record
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {toppers.map((student) => (
                <Card key={student._id} className="p-6 border-slate-200/60 bg-white relative flex flex-col justify-between items-center text-center group shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
                  {/* Rank Badge */}
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-extrabold uppercase tracking-wider">
                    {student.rank}
                  </span>

                  <div className="space-y-4 flex flex-col items-center w-full">
                    {/* Avatar */}
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${student.color || "from-sky-400 to-blue-600"} flex items-center justify-center text-white font-extrabold text-lg shadow-inner border border-white/10`}>
                        {student.avatarText}
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-slate-900">{student.name}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{student.class}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 w-full flex flex-col items-center">
                      <span className="text-xl font-black text-slate-850 leading-none">{student.percentage}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Aggregate Score</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5 w-full mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-900 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTopper(student._id)}
                      className="py-1.5 px-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-650 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer focus:outline-none"
                      title="Remove Topper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOPPER ADD / EDIT MODAL */}
      {showTopperModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowTopperModal(false)} className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-850" />
                <h3 className="text-base font-bold font-display text-slate-900">
                  {isEditMode ? "Modify Topper Profile" : "Add New Topper Entry"}
                </h3>
              </div>
              <button onClick={() => setShowTopperModal(false)} className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer focus:outline-none">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {topperError && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{topperError}</div>}
            {topperMessage && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">{topperMessage}</div>}

            <form onSubmit={handleTopperSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="flex flex-col items-center gap-3 pb-2 border-b border-slate-50">
                <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-400 relative">
                  {topperForm.photo ? (
                    <img src={topperForm.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 stroke-[1.2]" />
                  )}
                </div>
                <label className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-750 uppercase cursor-pointer transition-colors">
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>

              <Input
                label="Student Name *"
                required
                value={topperForm.name}
                onChange={e => setTopperForm({ ...topperForm, name: e.target.value })}
                placeholder="e.g. Pranav Pareek"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grade/Class Name *"
                  required
                  value={topperForm.class}
                  onChange={e => setTopperForm({ ...topperForm, class: e.target.value })}
                  placeholder="e.g. Grade XII (Science)"
                />
                <Input
                  label="Aggregate Score/Percentage *"
                  required
                  value={topperForm.percentage}
                  onChange={e => setTopperForm({ ...topperForm, percentage: e.target.value })}
                  placeholder="e.g. 98.8%"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 font-display">Rank Position *</label>
                  <select
                    value={topperForm.rank}
                    onChange={e => setTopperForm({ ...topperForm, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="1st Rank">1st Rank</option>
                    <option value="2nd Rank">2nd Rank</option>
                    <option value="3rd Rank">3rd Rank</option>
                    <option value="4th Rank">4th Rank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5 font-display">Avatar Theme Color</label>
                  <select
                    value={topperForm.color}
                    onChange={e => setTopperForm({ ...topperForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-850 font-medium focus:bg-white focus:outline-none"
                  >
                    {colorGradients.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowTopperModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-xl font-bold uppercase tracking-wider text-[10px] bg-white cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-0 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteContent;
