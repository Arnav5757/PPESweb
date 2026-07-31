import React from "react";

export const PortalLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
};

export default PortalLayout;
