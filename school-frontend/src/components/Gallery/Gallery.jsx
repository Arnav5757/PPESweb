import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Image as ImageIcon, Images, RefreshCw, X } from "lucide-react";
import { galleryService } from "../../services/galleryService";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

const PREVIEW_LIMIT = 6;

const headerMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const gridMotion = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardMotion = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

const getGalleryTime = (item) => {
  const parsed = new Date(item?.createdAt || item?.date || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getPreviewItems = (items) => {
  return [...items]
    .sort((a, b) => getGalleryTime(b) - getGalleryTime(a))
    .slice(0, PREVIEW_LIMIT);
};

const getCardSpanClass = (index) => {
  const spans = [
    "lg:col-span-2 lg:row-span-2",
    "",
    "",
    "",
    "lg:col-span-2",
    ""
  ];

  return spans[index] || "";
};

const GallerySkeleton = ({ index }) => (
  <div
    className={`min-h-[230px] animate-pulse rounded-[1.5rem] bg-slate-100 shadow-sm ${getCardSpanClass(index)} ${index === 0 ? "lg:min-h-[480px]" : ""}`}
    aria-hidden="true"
  />
);

const GalleryCard = ({ item, index, onOpen }) => (
  <motion.button
    type="button"
    variants={cardMotion}
    transition={{ duration: 0.34, ease: "easeOut" }}
    onClick={() => onOpen(index)}
    className={`group relative min-h-[230px] overflow-hidden rounded-[1.5rem] bg-slate-100 text-left shadow-[0_16px_45px_rgba(15,23,42,0.08)] outline-none ring-slate-900/10 transition-shadow duration-300 hover:shadow-[0_24px_65px_rgba(15,23,42,0.13)] focus-visible:ring-2 focus-visible:ring-offset-2 ${getCardSpanClass(index)} ${index === 0 ? "lg:min-h-[480px]" : ""}`}
    aria-label={`Open gallery image: ${item.title || "Campus image"}`}
  >
    <img
      src={item.imageUrl}
      alt={item.title || "Campus life at Pareek Public English School"}
      loading={index < 2 ? "eager" : "lazy"}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/35" />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-5 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
      <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-800 shadow-sm">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          View
        </span>
      </div>
      <div className="mt-3">
        {item.category && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/75">
            {item.category}
          </span>
        )}
        <h3 className="mt-1 text-sm font-bold leading-6 text-white font-display">
          {item.title || "Campus Moment"}
        </h3>
      </div>
    </div>
  </motion.button>
);

const GalleryLightbox = ({ items, activeIndex, onClose, onNext, onPrevious }) => {
  const closeButtonRef = useRef(null);
  const activeImage = items[activeIndex];

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (!activeImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-lightbox-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-4 text-white">
          <div className="text-left">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-200">
              {activeImage.category || "Campus Life"}
            </span>
            <h3 id="gallery-lightbox-title" className="mt-3 text-base font-bold leading-6 font-display md:text-lg">
              {activeImage.title || "Campus Moment"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">
              {activeIndex + 1} / {items.length}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Close gallery preview"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[45vh] items-center justify-center rounded-[1.5rem] border border-white/10 bg-slate-950 shadow-2xl">
          {items.length > 1 && (
            <button
              type="button"
              onClick={onPrevious}
              className="absolute left-3 z-20 hidden rounded-full border border-white/10 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 md:flex"
              aria-label="View previous image"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <img
            src={activeImage.imageUrl}
            alt={activeImage.title || "Campus life at Pareek Public English School"}
            className="max-h-[72vh] w-auto max-w-full rounded-[1.5rem] object-contain"
          />

          {items.length > 1 && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 z-20 hidden rounded-full border border-white/10 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 md:flex"
              aria-label="View next image"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-4 md:hidden">
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-full border border-white/10 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="View previous image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-full border border-white/10 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="View next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const navigate = useNavigate();

  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await galleryService.getGallery();
      setItems(Array.isArray(data) ? getPreviewItems(data) : []);
    } catch (err) {
      console.error("Error loading gallery preview:", err);
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const activeImage = activeImageIndex !== null ? items[activeImageIndex] : null;

  const handleCloseLightbox = useCallback(() => {
    setActiveImageIndex(null);
  }, []);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((current) => {
      if (current === null || items.length === 0) return current;
      return current === items.length - 1 ? 0 : current + 1;
    });
  }, [items.length]);

  const handlePreviousImage = useCallback(() => {
    setActiveImageIndex((current) => {
      if (current === null || items.length === 0) return current;
      return current === 0 ? items.length - 1 : current - 1;
    });
  }, [items.length]);

  const skeletonItems = useMemo(() => Array.from({ length: PREVIEW_LIMIT }), []);

  return (
    <Section id="gallery" background="gray" className="py-20 md:py-24" aria-labelledby="gallery-preview-heading">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm"
          >
            <ImageIcon className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
            Campus Life
          </motion.div>
          <motion.h2
            id="gallery-preview-heading"
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Explore Moments at Pareek Public English School
          </motion.h2>
          <motion.p
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
            className="mt-5 text-base leading-8 text-slate-600"
          >
            A curated glimpse of classrooms, activities, campus spaces, and school life. Open any image for a closer look, or continue to the full gallery.
          </motion.p>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid auto-rows-[230px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4" aria-label="Loading campus gallery preview" aria-live="polite">
              {skeletonItems.map((_, index) => (
                <GallerySkeleton key={index} index={index} />
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-xl rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.05)]" role="status">
              <Images className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-slate-800">We could not load the campus gallery right now.</p>
              <p className="mt-2 text-xs leading-6 text-slate-500">Please try again in a moment.</p>
              <Button variant="secondary" size="sm" onClick={loadGallery} className="mt-5 gap-2">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.05)]" role="status">
              <Images className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-slate-800">Our gallery will be updated soon.</p>
              <p className="mt-2 text-xs leading-6 text-slate-500">Campus photographs and school moments will appear here when available.</p>
            </div>
          ) : (
            <motion.div
              variants={gridMotion}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="grid auto-rows-[230px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {items.map((item, index) => (
                <GalleryCard key={item._id || `${item.title}-${index}`} item={item} index={index} onOpen={setActiveImageIndex} />
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.34, delay: 0.12, ease: "easeOut" }}
          className="mt-10 flex justify-center"
        >
          <Button size="lg" onClick={() => navigate("/gallery")} className="gap-2 shadow-md shadow-slate-900/10" aria-label="Explore full campus gallery">
            Explore Full Gallery
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.div>
      </Container>

      <AnimatePresence>
        {activeImage && (
          <GalleryLightbox
            items={items}
            activeIndex={activeImageIndex}
            onClose={handleCloseLightbox}
            onNext={handleNextImage}
            onPrevious={handlePreviousImage}
          />
        )}
      </AnimatePresence>
    </Section>
  );
};

export default Gallery;