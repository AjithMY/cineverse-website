import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Person, Movie } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { MovieCard } from "../components/MovieCard";
import { BackButton } from "../components/BackButton";
import { Calendar, MapPin, User as UserIcon } from "lucide-react";

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [p, m] = await Promise.all([
          api.getPersonDetails(id),
          api.getPersonMovieCredits(id)
        ]);
        setPerson(p);
        setMovies(m.cast?.sort((a: Movie, b: Movie) => b.vote_average - a.vote_average).slice(0, 12) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="pt-32 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-12">
        <Skeleton className="w-64 h-96 rounded-3xl" />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );

  if (!person) return <div className="pt-32 text-center text-2xl font-black">Person not found</div>;

  return (
    <PageWrapper>
      <div className="pt-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto pb-24">
        <BackButton className="mb-12" />
        
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="aspect-[2/3] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
              <img
                src={person.profile_path ? `https://image.tmdb.org/t/p/h632${person.profile_path}` : "https://via.placeholder.com/500x750?text=No+Image"}
                alt={person.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-6xl sm:text-8xl font-extrabold mb-8 leading-none tracking-tight text-gradient-brand">
              {person.name}
            </h1>
            
            <div className="flex flex-wrap gap-6 mb-12">
              {person.birthday && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-bold text-white/60">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {new Date(person.birthday).toLocaleDateString()}
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-bold text-white/60">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {person.place_of_birth}
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-bold text-white/60">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                {person.known_for_department}
              </div>
            </div>

            <section className="mb-20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                Biography
              </h2>
              <div className="glass-card p-8 rounded-[32px] border border-white/[0.08]">
                <p className="text-white/60 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                  {person.biography || "No biography available."}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                Known For
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PersonDetailPage;
