import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export const PublicLayout = ({ children, contact }) => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const offsetClass = isHomepage ? "mt-0" : "mt-[70px] md:mt-[70px]";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 ${offsetClass}`}>
        {children}
      </main>
      <Footer contact={contact} />
    </div>
  );
};

export default PublicLayout;
