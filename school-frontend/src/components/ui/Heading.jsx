import React from "react";

export const Heading = ({
  children,
  level = 2, // 1: Hero, 2: Section, 3: Card/Sub, 4: Small
  className = "",
  ...props
}) => {
  const styles = {
    1: "text-4xl md:text-6xl font-extrabold tracking-tight font-display text-slate-900",
    2: "text-3xl md:text-5xl font-extrabold tracking-tight font-display text-slate-900",
    3: "text-base font-bold text-slate-900 font-display",
    4: "text-xs font-bold uppercase tracking-widest text-slate-500"
  };

  const Tag = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";

  return (
    <Tag
      className={`${styles[level]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};
