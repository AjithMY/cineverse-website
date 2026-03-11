import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Movie } from "../types";
import { api } from "../lib/api";

export const MovieCard = React.memo(({ movie, rank }: { movie: Movie; rank?: number }) => {
  const prefetch = () => {
    api.getMovieDetails(movie.id.toString());
    api.getMovieCredits(movie.id.toString());
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onMouseEnter={prefetch}
      className="relative"
    >
      {rank && (
        <div className="absolute -left-2 sm:-left-4 -top-2 sm:-top-4 z-20 pointer-events-none">
          <span className="text-[60px] sm:text-[120px] font-black leading-none text-white/10 italic tracking-tighter select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            {rank}
          </span>
        </div>
      )}
      <Link to={`/movie/${movie.id}`} className="group relative block aspect-[2/3] rounded-[24px] overflow-hidden bg-zinc-900 border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-emerald-500/30 hover:shadow-emerald-500/10">
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
          <div className="transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 tracking-tight">{movie.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">{movie.release_date?.split("-")[0]}</span>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full backdrop-blur-md">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[11px] font-bold tracking-tighter">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Default Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-white/10 flex items-center gap-1.5 group-hover:opacity-0 transition-all duration-300 shadow-xl">
          <Star className="w-3 h-3 text-emerald-400 fill-current" />
          {movie.vote_average.toFixed(1)}
        </div>

        {/* Subtle Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent" />
      </Link>
    </motion.div>
  );
});
