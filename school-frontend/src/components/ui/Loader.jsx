import React from "react";

export const Loader = ({
  text = "Syncing Node...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-slate-500 py-12 ${className}`}>
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
      {text && (
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
          {text}
        </p>
      )}
    </div>
  );
};
