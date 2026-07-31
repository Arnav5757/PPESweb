import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import AuthActions from "./AuthActions";
import { scrollToSection } from "../../utils/scroll";

export const NavigationDrawer = ({
  isOpen,
  onClose,
  config = [],
  navigate,
  pathname
}) => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (idx) => {
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };

  const handleLinkClick = () => {
    onClose();
  };

  const handleSectionClick = (sectionId) => {
    onClose();
    scrollToSection(sectionId, navigate, pathname);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100vh" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 w-full bg-white z-40 px-6 pt-28 pb-12 flex flex-col justify-between lg:hidden overflow-y-auto text-left shadow-2xl"
        >
          {/* Main Links */}
          <div className="space-y-3">
            {config.map((item, idx) => {
              if (item.type === "dropdown") {
                const isExpanded = activeAccordion === idx;
                return (
                  <div key={idx} className="border-b border-slate-100/50 pb-2">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900 cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 mt-1 flex flex-col gap-2 border-l border-slate-100"
                        >
                          {item.children.map((child, cIdx) => {
                            if (child.type === "route") {
                              return (
                                <Link
                                  key={cIdx}
                                  to={child.route}
                                  onClick={handleLinkClick}
                                  className="py-1.5 text-[11px] font-medium text-slate-550 hover:text-slate-900"
                                >
                                  {child.label}
                                </Link>
                              );
                            }
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => handleSectionClick(child.section)}
                                className="w-full text-left py-1.5 text-[11px] font-medium text-slate-550 hover:text-slate-900 cursor-pointer"
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              if (item.type === "route") {
                return (
                  <Link
                    key={idx}
                    to={item.route}
                    onClick={handleLinkClick}
                    className="block py-2.5 border-b border-slate-100/50 text-xs font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900"
                  >
                    {item.title}
                  </Link>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSectionClick(item.section)}
                  className="w-full text-left py-2.5 border-b border-slate-100/50 text-xs font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900 cursor-pointer"
                >
                  {item.title}
                </button>
              );
            })}
          </div>

          {/* Bottom Portal Access */}
          <div className="pt-6 border-t border-slate-100">
            <AuthActions
              onActionClick={handleLinkClick}
              className="flex-col !items-stretch w-full gap-3"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationDrawer;
