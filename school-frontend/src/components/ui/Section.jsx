import React from "react";

export const Section = ({
  children,
  id,
  className = "",
  background = "white", // white, gray, transparent
  ...props
}) => {
  const backgrounds = {
    white: "bg-white",
    gray: "bg-slate-50",
    transparent: "bg-transparent"
  };

  return (
    <section
      id={id}
      className={`relative py-24 overflow-hidden ${backgrounds[background]} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};
