import React from "react";

export const Card = ({
  children,
  className = "",
  hoverLift = true,
  onClick,
  ...props
}) => {
  const baseStyles = "bg-white border border-slate-150 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300";
  const hoverStyles = hoverLift ? "hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-slate-250" : "";
  const cursorStyles = onClick ? "cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${cursorStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
