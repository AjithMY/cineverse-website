import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "./Skeleton";
import { Movie } from "../types";

export const MovieSection = React.memo(({ title, movies, loading, horizontal = false }: { title: string; movies: Movie[]; loading: boolean; horizontal?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-12 relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
        <h2 className="text-xl sm:text-3xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
          <span className="w-1 h-6 sm:w-1.5 sm:h-8 bg-emerald-500 rounded-full" />
          {title}
        </h2>
        {horizontal && (
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => scroll('left')} 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {horizontal ? (
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-8 scrollbar-hide snap-x px-2"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-36 sm:w-56 aspect-[2/3]" />
            ))
          ) : (
            movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-36 sm:w-56 snap-start">
                <MovieCard movie={movie} />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8 px-2">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))
          ) : (
            movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
          )}
        </div>
      )}
    </section>
  );
});
