import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Play, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Movie } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { MovieSection } from "../components/MovieSection";

const HomePage = () => {
  const [data, setData] = useState({
    trending: [] as Movie[],
    hollywood: [] as Movie[],
    indian: [] as Movie[],
    popular: [] as Movie[],
    topRated: [] as Movie[],
    upcoming: [] as Movie[],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, h, i, p, tr, u] = await Promise.all([
          api.getTrending(),
          api.getHollywoodMovies(),
          api.getIndianMovies(),
          api.getPopular(),
          api.getTopRated(),
          api.getUpcoming()
        ]);
        setData({
          trending: t.results || [],
          hollywood: h.results || [],
          indian: i.results || [],
          popular: p.results || [],
          topRated: tr.results || [],
          upcoming: u.results || [],
          loading: false
        });
      } catch (err) {
        console.error(err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  const { trending, hollywood, indian, popular, topRated, upcoming, loading } = data;
  const heroMovie = trending[0];

  return (
    <PageWrapper>
      <Helmet>
        <title>CineVerse | Discover Your Next Favorite Movie</title>
        <meta name="description" content="Explore the latest trending movies, read reviews, and manage your watchlist on CineVerse. Powered by TMDB and AI." />
        <link rel="canonical" href="https://ais-pre-2tm2bfsasnb6u3fbroompt-382584457049.asia-southeast1.run.app/" />
      </Helmet>
      <div className="relative h-[80vh] sm:h-screen min-h-[500px] sm:min-h-[700px] w-full overflow-hidden">
        {loading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : heroMovie && (
          <>
            <img
              src={`https://image.tmdb.org/t/p/w1280${heroMovie.backdrop_path}`}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-[slow-zoom_20s_infinite_alternate]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/20 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md">
                    TRENDING NOW
                  </span>
                  <div className="flex items-center gap-1.5 text-white/60 font-bold text-xs sm:text-sm">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 fill-current" />
                    {heroMovie.vote_average.toFixed(1)} Rating
                  </div>
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-4 sm:mb-8 leading-[0.95] tracking-tight text-white">
                  {heroMovie.title}
                </h1>
                <p className="text-white/60 text-sm sm:text-lg md:text-xl max-w-xl line-clamp-2 sm:line-clamp-3 mb-8 sm:mb-12 font-medium leading-relaxed">
                  {heroMovie.overview}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
                  <Link to={`/movie/${heroMovie.id}`} className="bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> WATCH NOW
                  </Link>
                  <Link to={`/movie/${heroMovie.id}`} className="bg-white/[0.05] backdrop-blur-xl text-white border border-white/[0.1] px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/[0.1] transition-all duration-500">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" /> MORE INFO
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <div className="px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto -mt-16 sm:-mt-32 relative z-10 space-y-8 sm:space-y-12 pb-24">
        <MovieSection title="Trending Hollywood" movies={hollywood} loading={loading} horizontal />
        <MovieSection title="Trending Indian" movies={indian} loading={loading} horizontal />
        <MovieSection title="Most Popular" movies={popular} loading={loading} horizontal />
        <MovieSection title="Top Rated" movies={topRated} loading={loading} horizontal />
        <MovieSection title="Upcoming Releases" movies={upcoming} loading={loading} horizontal />
      </div>
    </PageWrapper>
  );
};

export default HomePage;
