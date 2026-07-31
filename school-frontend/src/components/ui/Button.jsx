import React from "react";

export const Button = React.forwardRef(({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  disabled = false,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900",
    text: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-[10px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-6 py-3.5 text-sm"
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
