import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Film } from "lucide-react";
import { AuthProvider } from "./hooks/useAuth";
import { Navbar } from "./components/Navbar";
import { FloatingAI } from "./components/FloatingAI";

// --- Lazy Pages ---
const HomePage = lazy(() => import("./pages/HomePage"));
const MovieDetailPage = lazy(() => import("./pages/MovieDetailPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const PersonDetailPage = lazy(() => import("./pages/PersonDetailPage"));
const AIRecommenderPage = lazy(() => import("./pages/AIRecommenderPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
          <Navbar />
          <FloatingAI />
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MovieDetailPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/person/:id" element={<PersonDetailPage />} />
                <Route path="/ai" element={<AIRecommenderPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
          
          <footer className="border-t border-white/5 py-24 px-6 sm:px-12 lg:px-24 bg-zinc-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
              <div className="md:col-span-2">
                <Link to="/" className="flex items-center gap-3 text-3xl font-black tracking-tighter text-white mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Film className="w-7 h-7 text-black" />
                  </div>
                  <span>CINEVERSE</span>
                </Link>
                <p className="text-white/40 max-w-md font-medium leading-relaxed mb-8">
                  Your ultimate destination for cinematic exploration. Discover trending movies, 
                  save your favorites, and join a community of movie enthusiasts.
                </p>
                <div className="flex gap-4">
                  {['Twitter', 'Instagram', 'YouTube'].map(social => (
                    <button key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all">
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5 bg-current opacity-20" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-8 text-emerald-500">Navigation</h4>
                <ul className="space-y-4 text-white/60 font-bold">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/trending" className="hover:text-white transition-colors">Trending</Link></li>
                  <li><Link to="/ai" className="hover:text-white transition-colors">AI Assistant</Link></li>
                  <li><Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-8 text-emerald-500">Legal</h4>
                <ul className="space-y-4 text-white/60 font-bold">
                  <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                  <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
                </ul>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/20 text-xs font-black uppercase tracking-widest">
                © 2026 CINEVERSE. ALL RIGHTS RESERVED.
              </p>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                POWERED BY TMDB
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
