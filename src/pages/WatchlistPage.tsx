import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { WatchlistItem } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { MovieCard } from "../components/MovieCard";
import { BackButton } from "../components/BackButton";

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const list = await api.getWatchlist();
        setWatchlist(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchWatchlist();
  }, [user]);

  return (
    <PageWrapper>
      <div className="pt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto pb-24">
        <BackButton className="mb-8" />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold tracking-tight text-gradient-brand">
              My Watchlist
            </h1>
            <p className="text-white/40 font-medium">Your personal collection of must-watch movies</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-3 shadow-xl">
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">{watchlist.length} Movies Saved</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-[24px]" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-40 glass-card rounded-[40px] border border-white/[0.08] shadow-2xl">
            <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8 border border-white/[0.05]">
              <Heart className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Your watchlist is empty</h3>
            <p className="text-white/30 font-medium mb-12 max-w-md mx-auto">Start exploring and save your favorite movies to watch them later.</p>
            <Link to="/" className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-bold text-xs hover:bg-emerald-400 transition-all duration-500 transform active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] uppercase tracking-widest">
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {watchlist.map((item) => (
              <MovieCard 
                key={item.movieId} 
                movie={{ 
                  id: item.movieId, 
                  title: item.movieTitle, 
                  poster_path: item.moviePoster,
                  vote_average: 0,
                  overview: "",
                  release_date: ""
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default WatchlistPage;
