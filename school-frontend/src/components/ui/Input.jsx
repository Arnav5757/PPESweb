import React from "react";

export const Input = React.forwardRef(({
  label,
  type = "text",
  placeholder = "",
  error = "",
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 text-left w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-all focus:ring-2 focus:ring-blue-500/25"
        {...props}
      />
      {error && (
        <p className="text-[10px] text-red-500 font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
