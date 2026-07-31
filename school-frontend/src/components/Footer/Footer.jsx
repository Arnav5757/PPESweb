import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { scrollToSection } from "../../utils/scroll";

const Footer = ({ contact }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="contact" className="relative py-16 px-6 md:px-12 bg-[#0f172a] text-slate-350 border-t border-slate-950 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold tracking-widest text-[#818cf8] leading-none font-display">
                PAREEK
              </h2>
              <div className="h-4 w-[1px] bg-slate-700" />
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Public English School</span>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-sm">
              Shaping future-ready scholars through a standard academic curriculum, individual mentorship, and holistic personal development.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { 
                  icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, 
                  href: "#" 
                },
                { 
                  icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>, 
                  href: "#" 
                },
                { 
                  icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>, 
                  href: "#" 
                },
                { 
                  icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12z"/></svg>, 
                  href: "#" 
                }
              ].map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/35 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all duration-300"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display">Navigation</h4>
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={() => scrollToSection("home", navigate, location.pathname)} className="text-xs text-slate-400 hover:text-white text-left transition-colors cursor-pointer focus:outline-none">Home</button>
              <button type="button" onClick={() => scrollToSection("highlights", navigate, location.pathname)} className="text-xs text-slate-400 hover:text-white text-left transition-colors cursor-pointer focus:outline-none">Academics</button>
              <button type="button" onClick={() => scrollToSection("notices", navigate, location.pathname)} className="text-xs text-slate-400 hover:text-white text-left transition-colors cursor-pointer focus:outline-none">Admissions</button>
              <button type="button" onClick={() => scrollToSection("gallery", navigate, location.pathname)} className="text-xs text-slate-400 hover:text-white text-left transition-colors cursor-pointer focus:outline-none">Gallery</button>
              <button type="button" onClick={() => scrollToSection("toppers", navigate, location.pathname)} className="text-xs text-slate-400 hover:text-white text-left transition-colors cursor-pointer focus:outline-none">Our Toppers</button>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display">Connect</h4>
            <div className="space-y-3.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">
                  {contact?.address || "Maruti Nagar, Ralayata-Guradiya road, mandsaur M.P. - 458002"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="font-light">
                  {contact?.email || "admissions@pareek.edu"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="font-light">
                  {contact?.phone || "+91 9926677011"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display">Newsletter</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Subscribe for periodic academic briefings and community journals.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-slate-500 focus:outline-none transition-colors pr-10"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 transition-colors cursor-pointer"
                title="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-[10px] text-white font-bold tracking-wide animate-pulse">Subscription logged successfully! 📢</p>
            )}
          </div>

        </div>

        {/* Divider */}
        <div className="h-[1px] bg-slate-800" />

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <p>© {new Date().getFullYear()} Pareek Public English School. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/portal" className="hover:text-slate-300 transition-colors">Student Portal</Link>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-700"></span>
            <Link to="/admin" className="hover:text-slate-300 transition-colors">Admin Panel</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
