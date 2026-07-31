import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const Admin = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (token && user) {
    if (user.role === "admin") {
      return <AdminDashboard />;
    }
    // If student is logged in, redirect to student portal
    return <Navigate to="/portal" replace />;
  }

  return <AdminLogin />;
};

export default Admin;
