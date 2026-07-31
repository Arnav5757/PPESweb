import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Eye, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";
import { galleryService } from "../services/galleryService";

export const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeImageIdx, setActiveImageIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Campus", "Events", "Sports", "Academics", "Activities"];

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Gallery Items
  useEffect(() => {
    galleryService.getGallery()
      .then((data) => {
        setItems(data);
        setFilteredItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading gallery, using fallbacks:", err);
        const fallback = [
          { _id: "g1", title: "Primary Activity Wing (Grades 1-5)", imageUrl: "/gallery/gallery_primary.png", category: "Activities" },
          { _id: "g2", title: "Middle School AV Library (Grades 6-8)", imageUrl: "/gallery/gallery_middle.png", category: "Campus" },
          { _id: "g3", title: "Secondary Science Laboratories (Grades 9-10)", imageUrl: "/gallery/gallery_secondary.png", category: "Academics" },
          { _id: "g4", title: "Higher Secondary Physics & IT Lab (Grades 11-12)", imageUrl: "/gallery/gallery_senior.png", category: "Academics" },
          { _id: "g5", title: "Main Academy Assembly Auditorium", imageUrl: "/gallery/gallery_auditorium.png", category: "Events" },
          { _id: "g6", title: "Junior & Senior Outdoor Athletics Arena", imageUrl: "/gallery/gallery_sports.png", category: "Sports" }
        ];
        setItems(fallback);
        setFilteredItems(fallback);
        setLoading(false);
      });
  }, []);

  // Filter Items when activeFilter changes
  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category?.toLowerCase() === activeFilter.toLowerCase()));
    }
  }, [activeFilter, items]);

  // Lightbox Keyboard Navigation Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeImageIdx === null) return;
      if (e.key === "Escape") setActiveImageIdx(null);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIdx, filteredItems]);

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  const activeImage = activeImageIdx !== null ? filteredItems[activeImageIdx] : null;

  return (
    <PublicLayout>
      <div className="py-12 px-6 md:px-12 w-full max-w-7xl mx-auto">
        <div className="space-y-12">
          
          {/* Header */}
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-bold tracking-widest text-indigo-650 uppercase">Campus Archive</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tight font-display">
              Campus Gallery
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-light leading-relaxed">
              Explore academic wings, modern laboratories, athletic fields, and dynamic student life events that define our school community.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200/50 pb-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-450 font-bold uppercase tracking-wider mr-2">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  setActiveImageIdx(null); // Reset lightbox active state
                }}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                  activeFilter === cat
                    ? "bg-[#0f172a] text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-500 hover:text-[#0f172a] hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Layout with framer-motion */}
          {loading ? (
            <p className="text-center py-20 text-slate-400 text-sm animate-pulse">Loading campus gallery...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center py-20 text-slate-400 text-sm">No moments found under this category.</p>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    layout
                    key={item._id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setActiveImageIdx(idx)}
                    className="group relative rounded-3xl overflow-hidden border border-slate-100 bg-white cursor-pointer shadow-sm hover:shadow-md aspect-video md:aspect-[4/3] transition-shadow duration-300"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.98]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-3.5 rounded-full bg-white text-slate-900 shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 text-left pointer-events-none z-10">
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-2.5 leading-tight tracking-wide font-display">
                        {item.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>

      {/* Cinematic Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImageIdx(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Lightbox Content Wrap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative max-w-5xl w-full flex flex-col items-center gap-4 z-10"
            >
              {/* Top Controls Bar */}
              <div className="w-full flex items-center justify-between px-2 text-white">
                <div className="text-left">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
                    {activeImage.category}
                  </span>
                  <h3 className="text-sm md:text-base font-bold mt-2 font-display">{activeImage.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-semibold font-display">
                    {activeImageIdx + 1} / {filteredItems.length}
                  </span>
                  <button
                    onClick={() => setActiveImageIdx(null)}
                    className="p-2.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                    title="Close (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Image Frame with Navigation */}
              <div className="relative w-full flex items-center justify-center min-h-[40vh] max-h-[75vh]">
                {/* Left arrow button */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer hidden md:flex"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Displaying Image */}
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl max-w-full max-h-[70vh]">
                  <img
                    src={activeImage.imageUrl}
                    alt={activeImage.title}
                    className="w-full h-auto object-contain max-h-[70vh] max-w-full mx-auto"
                  />
                </div>

                {/* Right arrow button */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer hidden md:flex"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation Arrows */}
              <div className="flex md:hidden items-center gap-6 mt-2">
                <button
                  onClick={handlePrevImage}
                  className="p-2.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="p-2.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
};

export default Gallery;
