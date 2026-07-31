import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, LogIn, ArrowLeft } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      if (user.role === "student") {
        navigate("/portal");
      } else {
        navigate("/admin");
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      if (data.user.role === "student") {
        login(data.user, data.token);
        navigate("/portal");
      } else {
        setError("This portal is for students. Please use the Admin Panel login.");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden text-left">
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-8 border-b border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-wide font-display">Student Portal</h2>
            <p className="text-xs text-slate-400 font-light mt-1">Authenticate access to academics and grades</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-5">
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-650 font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username / Registered Email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice or student@email.com"
            />

            <Input
              label="Portal Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center gap-1.5 mt-6 py-3.5"
            >
              {loading ? (
                <span>Accessing Profile...</span>
              ) : (
                <>
                  Log In to Dashboard
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 font-medium">
          Approved student credentials: <span className="font-semibold text-slate-750">alice@student.com</span> / <span className="font-semibold text-slate-750">student123</span>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
