import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StudentDashboard from "./StudentDashboard";
import StudentLogin from "./StudentLogin";

export const Portal = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (token && user) {
    if (user.role === "student") {
      return <StudentDashboard />;
    }
    // If admin is logged in, redirect to admin console
    return <Navigate to="/admin" replace />;
  }

  return <StudentLogin />;
};

export default Portal;
