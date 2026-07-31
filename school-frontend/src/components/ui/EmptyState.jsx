import React from "react";

export const EmptyState = ({
  message = "No records found matching query.",
  className = ""
}) => {
  return (
    <div className={`p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 ${className}`}>
      <p className="text-xs font-medium leading-none">
        {message}
      </p>
    </div>
  );
};
