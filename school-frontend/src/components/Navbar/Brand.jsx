import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { TYPOGRAPHY } from "../../constants/typography";

export const Brand = ({ light = false }) => {
  return (
    <Link to="/" className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-10 h-10 rounded-xl overflow-hidden p-1 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow ${
        light ? "border border-white/20 bg-white/10 backdrop-blur-sm" : "border border-slate-200/80 bg-white"
      }`}>
        <img src={logo} alt="Pareek Logo" className="w-7.5 h-7.5 object-contain" />
      </div>
      <div className="text-left">
        <h1 
          className={`text-lg md:text-xl lg:text-2xl font-black tracking-widest leading-none font-display uppercase ${
            light ? "text-white" : "text-[#0f172a]"
          }`}
          style={{ color: light ? "white" : "#0f172a" }}
        >
          PAREEK
        </h1>
        <p className={`${TYPOGRAPHY.metadata} mt-0.5 ${
          light ? "text-slate-200" : "text-slate-700"
        }`}>
          Public English School
        </p>
        <p className={`text-[8px] uppercase font-semibold mt-0.5 tracking-wider ${
          light ? "text-slate-300" : "text-slate-455 text-slate-400"
        }`}>
          Mandsaur, Madhya Pradesh
        </p>
      </div>
    </Link>
  );
};

export default Brand;
