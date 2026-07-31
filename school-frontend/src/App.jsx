import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";

// Portal & Admin Page Imports
import Portal from "./pages/Portal/Portal";
import StudentLogin from "./pages/Portal/StudentLogin";
import StudentDashboard from "./pages/Portal/StudentDashboard";

import Admin from "./pages/Admin/Admin";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import { useAuth } from "./hooks/useAuth";

// Route protection guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={allowedRole === "admin" ? "/admin/login" : "/portal/login"} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* Dynamic Portals Selectors */}
        <Route path="/portal" element={<Portal />} />
        <Route path="/admin" element={<Admin />} />

        {/* Student Portal Legacy Links */}
        <Route path="/portal/login" element={<StudentLogin />} />
        <Route 
          path="/portal/dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Console Legacy Links */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;