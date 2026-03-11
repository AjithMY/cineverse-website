import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Movie } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { MovieCard } from "../components/MovieCard";
import { BackButton } from "../components/BackButton";
import { cn } from "../lib/utils";

const TrendingPage = () => {
  const [hollywood, setHollywood] = useState<Movie[]>([]);
  const [indian, setIndian] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const [hRes, iRes] = await Promise.all([
          api.getHollywoodMovies(),
          api.getIndianMovies()
        ]);
        setHollywood(hRes.results?.slice(0, 10) || []);
        setIndian(iRes.results?.slice(0, 10) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <PageWrapper>
      <div className="pt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto pb-24">
        <BackButton className="mb-8" />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold tracking-tight text-gradient-brand">
              Trending Now
            </h1>
            <p className="text-white/40 font-medium">Top 10 movies globally and in India</p>
          </div>
        </div>

        {/* Hollywood Section */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-extrabold tracking-tight">Hollywood Top 10</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-12">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-[24px]" />
              ))
            ) : (
              hollywood.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} rank={index + 1} />
              ))
            )}
          </div>
        </section>

        {/* Indian Section */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-extrabold tracking-tight">Indian Top 10</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-12">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-[24px]" />
              ))
            ) : (
              indian.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} rank={index + 1} />
              ))
            )}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default TrendingPage;
