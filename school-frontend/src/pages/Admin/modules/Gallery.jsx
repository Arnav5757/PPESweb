import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, CheckSquare, Square, Save } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { galleryService } from "../../../services/galleryService";

export const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoMessage, setPhotoMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    category: "Campus"
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const data = await galleryService.getGallery();
      setGallery(data || []);
    } catch (err) {
      console.error("Error loading gallery photos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, imageUrl: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setPhotoMessage("");
    if (!form.imageUrl) {
      setPhotoMessage("Please select an image file first.");
      return;
    }

    try {
      await galleryService.createGalleryItem(form);
      setPhotoMessage("Image added to gallery successfully! ✅");
      setForm({ title: "", imageUrl: "", category: "Campus" });
      const fileInput = document.getElementById("gallery-file-input");
      if (fileInput) fileInput.value = "";
      fetchPhotos();
      setTimeout(() => setPhotoMessage(""), 4000);
    } catch (err) {
      setPhotoMessage("Image upload failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    try {
      await galleryService.deleteGalleryItem(id);
      fetchPhotos();
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected photos?`)) return;

    try {
      setLoading(true);
      // Run sequentially or via Promise.all
      await Promise.all(selectedIds.map(id => galleryService.deleteGalleryItem(id)));
      setSelectedIds([]);
      fetchPhotos();
    } catch (err) {
      console.error("Error in bulk delete:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900">Media Gallery Manager</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Upload photos, assign category tags, and perform bulk deletions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Upload Campus Photo</h3>
            {photoMessage && <p className="text-xs text-rose-650 font-bold">{photoMessage}</p>}
            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <Input label="Photo Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Science Fair Lab Experiment..." />
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">Category Album *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none">
                  {["Campus", "Labs", "Sports", "Events", "Activities"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display mb-1.5">File Selector *</label>
                <input id="gallery-file-input" type="file" accept="image/*" required onChange={handleFileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-550 focus:outline-none" />
              </div>

              <Button type="submit" className="w-full justify-center gap-1.5"><Plus className="w-4 h-4" /> Upload Photo</Button>
            </form>
          </Card>
        </div>

        {/* Gallery Archive */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border-slate-200/60 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Archive</h3>
              {selectedIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-650 border-red-200 hover:bg-red-50 gap-1.5 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Bulk Delete ({selectedIds.length})
                </Button>
              )}
            </div>

            {loading ? (
              <p className="text-center py-10 text-slate-400 text-xs animate-pulse">Syncing photos...</p>
            ) : gallery.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-xs">No media photos found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {gallery.map((g) => {
                  const isSel = selectedIds.includes(g._id);
                  return (
                    <div key={g._id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video flex flex-col justify-end text-left shadow-sm">
                      <img src={g.imageUrl} alt={g.title} className="absolute inset-0 w-full h-full object-cover filter brightness-[0.8]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      
                      {/* Checkbox selector */}
                      <button 
                        onClick={() => handleToggleSelect(g._id)} 
                        className="absolute top-2.5 left-2.5 p-1 rounded bg-white/95 text-slate-600 hover:bg-white cursor-pointer border border-slate-100"
                      >
                        {isSel ? <CheckSquare className="w-3.5 h-3.5 text-slate-900" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      {/* Single delete */}
                      <button
                        onClick={() => handleDelete(g._id)}
                        className="absolute top-2.5 right-2.5 p-1 rounded bg-white/95 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer border border-slate-100"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-4 relative z-10">
                        <span className="text-[8px] px-2 py-0.5 bg-white/20 text-white font-bold uppercase tracking-wider rounded-full">{g.category}</span>
                        <h4 className="text-[11px] font-bold text-white mt-1.5 truncate">{g.title}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
