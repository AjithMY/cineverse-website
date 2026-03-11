import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Film, User as UserIcon, LogOut, X, Menu, Sparkles, Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "motion/react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.05] py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
              <Film className="w-5 h-5 text-black" />
            </div>
            <span className="hidden sm:block tracking-tight font-extrabold">CINEVERSE</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <form onSubmit={handleSearch} className="relative group hidden sm:block">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search movies..."
                className="bg-white/[0.03] border border-white/[0.08] rounded-full pl-11 pr-4 py-2 text-sm w-48 lg:w-64 focus:w-64 lg:focus:w-80 focus:bg-white/[0.06] focus:border-emerald-500/30 transition-all duration-500 text-white placeholder:text-white/20 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className={cn("text-sm font-semibold transition-all hover:text-emerald-400", location.pathname === "/" ? "text-emerald-400" : "text-white/60")}>Home</Link>
              <Link to="/trending" className={cn("text-sm font-semibold transition-all hover:text-emerald-400", location.pathname === "/trending" ? "text-emerald-400" : "text-white/60")}>Trending</Link>
              <Link to="/ai" className={cn("flex items-center gap-1.5 text-sm font-semibold transition-all hover:text-emerald-400", location.pathname === "/ai" ? "text-emerald-400" : "text-white/60")}>
                <Sparkles className="w-3.5 h-3.5" />
                AI Assistant
              </Link>
              {user && (
                <Link to="/watchlist" className={cn("text-sm font-semibold transition-all hover:text-emerald-400", location.pathname === "/watchlist" ? "text-emerald-400" : "text-white/60")}>Watchlist</Link>
              )}
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 pl-4 border-l border-white/[0.08] group relative cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/50 transition-all overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="absolute top-full right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] translate-y-2 group-hover:translate-y-0">
                    <div className="px-4 py-3 border-b border-white/[0.05] mb-1">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] mb-1">Account</p>
                      <p className="text-sm font-bold truncate text-white/90">{user.name}</p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 rounded-xl transition-all font-medium">
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/5 active:scale-95">
                SIGN IN
              </Link>
            )}
            
            <button 
              className="sm:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Search"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          <button 
            className="md:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[150] bg-[#050505] flex flex-col pt-24 px-6 pb-8"
          >
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-lg outline-none focus:border-emerald-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="flex flex-col gap-2">
                <Link to="/" className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.05] transition-all">
                  <span className="text-xl font-bold">Home</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Film className="w-4 h-4 text-emerald-400" />
                  </div>
                </Link>
                <Link to="/trending" className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.05] transition-all">
                  <span className="text-xl font-bold">Trending</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Star className="w-4 h-4 text-emerald-400" />
                  </div>
                </Link>
                <Link to="/ai" className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all">
                  <span className="text-xl font-bold text-emerald-400">AI Assistant</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                </Link>
                {user && (
                  <Link to="/watchlist" className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.05] transition-all">
                    <span className="text-xl font-bold">Watchlist</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Film className="w-4 h-4 text-emerald-400" />
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-auto pt-8 border-t border-white/10">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-xl overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-sm text-white/40">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      to="/profile"
                      className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <UserIcon className="w-5 h-5" /> Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/auth" 
                    className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black text-center block hover:bg-emerald-400 transition-all"
                  >
                    SIGN IN
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
