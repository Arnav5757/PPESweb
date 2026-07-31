import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { scrollToSection } from "../../utils/scroll";

export const DropdownMenu = ({
  title,
  items = [],
  navigate,
  pathname,
  onLinkClick,
  light = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  // Close dropdown on ESC press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    setIsOpen(false);
    if (onLinkClick) onLinkClick();

    if (item.type === "section") {
      scrollToSection(item.section, navigate, pathname);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        light ? "text-slate-200 hover:text-white" : "text-slate-600 hover:text-slate-900"
      }`}
      >
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2.5 shadow-lg z-50 text-left focus:outline-none"
          >
            <div className="flex flex-col gap-1">
              {items.map((item, idx) => {
                if (item.type === "route") {
                  return (
                    <Link
                      key={idx}
                      to={item.route}
                      onClick={() => {
                        setIsOpen(false);
                        if (onLinkClick) onLinkClick();
                      }}
                      className="px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:bg-slate-50"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;
