import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { Movie } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { MovieCard } from "../components/MovieCard";
import { BackButton } from "../components/BackButton";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const res = await api.searchMovies(query);
        setMovies(res.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  return (
    <PageWrapper>
      <div className="pt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto pb-24">
        <BackButton className="mb-8" />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold tracking-tight">
              Search: <span className="text-gradient-brand">{query}</span>
            </h1>
            <p className="text-white/40 font-medium">{movies.length} results found for your search</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-[24px]" />
            ))
          ) : movies.length === 0 ? (
            <div className="col-span-full text-center py-40 glass-card rounded-[40px] border border-white/[0.08] shadow-2xl">
              <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8 border border-white/[0.05]">
                <Search className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-white/30 font-medium">Try searching for something else</p>
            </div>
          ) : (
            movies.map(movie => <MovieCard key={movie.id} movie={movie} />)
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default SearchPage;
