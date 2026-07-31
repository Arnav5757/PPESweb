import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const AuthActions = ({ className = "", onActionClick, light = false }) => {
  const { token, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onActionClick) onActionClick();
  };

  const handleLinkClick = () => {
    if (onActionClick) onActionClick();
  };

  if (token && user) {
    const dashboardPath = user.role === "admin" ? "/admin" : "/portal";
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          to={dashboardPath}
          onClick={handleLinkClick}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            light 
              ? "border-white bg-white text-slate-900 hover:bg-slate-100 hover:shadow-sm" 
              : "border-slate-250 bg-[#0f172a] text-white hover:bg-[#1e293b] hover:shadow-sm"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          type="button"
          className={`px-3.5 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
            light
              ? "border-white/20 hover:bg-white/10 text-slate-200 hover:text-white"
              : "border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-650"
          }`}
        >
          Logout
        </button>
      </div>
    );
  }

  // Not authenticated
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Secondary Button: Admin Login */}
      <Link
        to="/admin"
        onClick={handleLinkClick}
        className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border border-transparent transition-all ${
          light
            ? "text-slate-200 hover:text-white hover:border-white/20"
            : "text-slate-500 hover:text-slate-900 hover:border-slate-200"
        }`}
      >
        Admin Panel
      </Link>
      
      {/* Primary Button: Portal Login */}
      <Link
        to="/portal"
        onClick={handleLinkClick}
        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] hover:shadow-sm text-white text-xs font-bold uppercase tracking-wider transition-all duration-300"
      >
        Portal Login
      </Link>
    </div>
  );
};

export default AuthActions;
