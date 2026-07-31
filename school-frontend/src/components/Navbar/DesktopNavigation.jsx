import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { scrollToSection } from "../../utils/scroll";

export const DesktopNavigation = ({
  config = [],
  navigate,
  pathname,
  light = false
}) => {
  const isLinkActive = (item) => {
    if (item.type === "route") {
      return pathname === item.route || pathname.startsWith(item.route + "/");
    }
    if (item.type === "section") {
      return pathname === "/" && item.section === "home"; // default home highlighted when on landing
    }
    return false;
  };

  return (
    <nav className={`hidden lg:flex items-center gap-1 backdrop-blur-md rounded-full px-3 py-1.5 transition-all duration-300 ${
      light 
        ? "bg-white/10 border border-white/10 shadow-none" 
        : "bg-slate-100/50 border border-slate-200/30 shadow-inner"
    }`}>
      {config.map((item, idx) => {
        if (item.type === "dropdown") {
          return (
            <DropdownMenu
              key={idx}
              title={item.title}
              items={item.children}
              navigate={navigate}
              pathname={pathname}
              light={light}
            />
          );
        }

        if (item.type === "route") {
          const active = isLinkActive(item);
          return (
            <Link
              key={idx}
              to={item.route}
              className={`relative px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-white text-blue-600 shadow-sm border border-slate-250/20"
                  : light
                    ? "text-slate-200 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.title}
            </Link>
          );
        }

        // Section link
        const active = isLinkActive(item);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToSection(item.section, navigate, pathname)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
              active && pathname === "/"
                ? "bg-white text-blue-600 shadow-sm border border-slate-250/20"
                : light
                  ? "text-slate-200 hover:text-white focus:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 focus:bg-slate-200/40"
            }`}
          >
            {item.title}
          </button>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation;
