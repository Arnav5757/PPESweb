import React from "react";

export const Container = ({
  children,
  className = "",
  fluid = false,
  ...props
}) => {
  const widthClass = fluid ? "w-full" : "max-w-7xl";
  return (
    <div
      className={`${widthClass} mx-auto px-6 md:px-12 w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
