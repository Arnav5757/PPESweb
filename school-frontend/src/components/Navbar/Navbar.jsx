import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";
import DesktopNavigation from "./DesktopNavigation";
import NavigationDrawer from "./NavigationDrawer";
import AuthActions from "./AuthActions";
import { navigationConfig, NAVBAR_SCROLL_THRESHOLD } from "../../constants/navigation";
import { useScroll } from "../../hooks/useScroll";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useScroll(NAVBAR_SCROLL_THRESHOLD);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHomepage = location.pathname === "/";
  const showScrolledStyle = isScrolled || !isHomepage;
  const useLightText = isHomepage && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 ${
          showScrolledStyle
            ? "bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm py-1.5"
            : "bg-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Branding */}
          <Brand light={useLightText} />

          {/* Center Links (Desktop) */}
          <DesktopNavigation
            config={navigationConfig}
            navigate={navigate}
            pathname={location.pathname}
            light={useLightText}
          />

          {/* Right Action Buttons (Desktop) */}
          <AuthActions className="hidden lg:flex" light={useLightText} />

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            type="button"
            onClick={handleToggleMobileMenu}
            className={`lg:hidden p-2.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/25 ${
              useLightText
                ? "bg-white/10 border border-white/10 text-slate-200 hover:text-white hover:bg-white/20"
                : "bg-slate-50 border border-slate-100 text-slate-600 hover:text-[#0f172a] hover:bg-slate-100"
            }`}
            aria-label="Toggle Menu"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Overlay */}
      <NavigationDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        config={navigationConfig}
        navigate={navigate}
        pathname={location.pathname}
      />
    </>
  );
};

export default Navbar;
