import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { PageWrapper } from "../components/PageWrapper";
import { BackButton } from "../components/BackButton";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-6 pb-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <BackButton className="mb-12 relative z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[40px] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-white/40 font-medium text-sm">
              {isLogin ? "Enter your credentials to continue" : "Join our community of movie lovers"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-4.5 focus:border-emerald-500/30 outline-none transition-all font-semibold placeholder:text-white/10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-4.5 focus:border-emerald-500/30 outline-none transition-all font-semibold placeholder:text-white/10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-4.5 focus:border-emerald-500/30 outline-none transition-all font-semibold placeholder:text-white/10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">
                  {error}
                </p>
              </motion.div>
            )}

            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-bold hover:bg-emerald-400 transition-all duration-500 transform active:scale-95 mt-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] uppercase tracking-widest text-xs">
              {isLogin ? "Sign In" : "Register Now"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] hover:text-emerald-400 transition-colors">
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default AuthPage;
