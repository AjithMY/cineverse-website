import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Calendar, Clock, Play, Check, Plus, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Movie, Review, Cast, Video } from "../types";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { BackButton } from "../components/BackButton";
import { cn } from "../lib/utils";

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 10, text: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [m, c, v, r] = await Promise.all([
          api.getMovieDetails(id),
          api.getMovieCredits(id),
          api.getMovieVideos(id),
          api.getReviews(Number(id))
        ]);
        setMovie(m);
        setCast(c.cast?.slice(0, 12) || []);
        setVideos(v.results?.filter((v: any) => v.type === "Trailer" || v.type === "Teaser") || []);
        setReviews(r || []);

        if (user) {
          const watchlist = await api.getWatchlist();
          setInWatchlist(watchlist.some((item: any) => item.movieId === Number(id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await api.removeFromWatchlist(Number(id));
        setInWatchlist(false);
      } else {
        await api.addToWatchlist({
          movieId: Number(id),
          movieTitle: movie!.title,
          moviePoster: movie!.poster_path
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.postReview({
        movieId: Number(id),
        rating: newReview.rating,
        review: newReview.text
      });
      setNewReview({ rating: 10, text: "" });
      const r = await api.getReviews(Number(id));
      setReviews(r);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="pt-32 px-6 max-w-7xl mx-auto space-y-12">
      <Skeleton className="w-full h-[60vh]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );

  if (!movie) return <div className="pt-32 text-center text-2xl font-black">Movie not found</div>;

  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "image": `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    "description": movie.overview,
    "datePublished": movie.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": reviews.length || 100
    }
  };

  return (
    <PageWrapper>
      <Helmet>
        <title>{`${movie.title} | CineVerse`}</title>
        <meta name="description" content={movie.overview.substring(0, 160)} />
        <meta property="og:title" content={`${movie.title} | CineVerse`} />
        <meta property="og:description" content={movie.overview.substring(0, 160)} />
        <meta property="og:image" content={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`} />
        <script type="application/ld+json">
          {JSON.stringify(movieSchema)}
        </script>
      </Helmet>
      {/* Backdrop Hero */}
      <div className="relative h-[85vh] w-full min-h-[700px] overflow-hidden">
        <div className="absolute top-32 left-6 sm:left-12 lg:left-24 z-50">
          <BackButton />
        </div>
        <img
          src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover scale-105 animate-[slow-zoom_30s_infinite_alternate]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 lg:p-24 flex flex-col md:flex-row gap-16 items-end max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-48 sm:w-80 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/[0.08] hidden md:block z-10 shrink-0"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <div className="flex-1 z-10 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.genres?.map(g => (
                  <span key={g.id} className="bg-white/[0.05] backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/[0.08] uppercase tracking-widest text-white/60">{g.name}</span>
                ))}
              </div>
              
              <h1 className="text-5xl sm:text-8xl font-extrabold mb-8 leading-[0.95] tracking-tight text-white">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-white/50 mb-10">
                <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl backdrop-blur-md">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xl font-bold tracking-tighter">{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-emerald-400" /> 
                  <span>{movie.release_date?.split("-")[0]}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-emerald-400" /> 
                  <span>{movie.runtime} min</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-5">
                <button className="bg-white text-black px-10 py-4.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-400 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                  <Play className="w-5 h-5 fill-current" /> WATCH TRAILER
                </button>
                <button onClick={handleWatchlist} className={cn(
                  "flex items-center gap-3 px-10 py-4.5 rounded-2xl font-bold transition-all duration-500 border border-white/[0.1] backdrop-blur-xl transform hover:scale-105 active:scale-95",
                  inWatchlist ? "bg-white text-black" : "bg-white/[0.05] hover:bg-white/[0.1] text-white"
                )}>
                  {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {inWatchlist ? "IN WATCHLIST" : "ADD TO WATCHLIST"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 py-32 grid grid-cols-1 lg:grid-cols-3 gap-32">
        <div className="lg:col-span-2 space-y-24">
          <section>
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-4 tracking-tight">
              <span className="w-1.5 h-8 bg-emerald-500 rounded-full" />
              Storyline
            </h2>
            <p className="text-white/50 leading-relaxed text-xl font-medium tracking-tight">{movie.overview}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-12 flex items-center gap-4 tracking-tight">
              <span className="w-1.5 h-8 bg-emerald-500 rounded-full" />
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10">
              {cast.map(person => (
                <Link to={`/person/${person.id}`} key={person.id} className="group text-center block">
                  <div className="aspect-square rounded-[32px] overflow-hidden mb-5 border border-white/[0.05] group-hover:border-emerald-500/50 transition-all duration-500 shadow-2xl">
                    <img
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "https://via.placeholder.com/185x185?text=No+Image"}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">{person.name}</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{person.character}</p>
                </Link>
              ))}
            </div>
          </section>

          {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-12 flex items-center gap-4 tracking-tight">
                <span className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Trailers & Clips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {videos.slice(0, 2).map(video => (
                  <div key={video.id} className="aspect-video rounded-[32px] overflow-hidden border border-white/[0.05] bg-zinc-900 shadow-2xl group">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}`}
                      className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      allowFullScreen
                      title={video.name}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-12">
          <section className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] p-10 border border-white/[0.05] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] sticky top-32">
            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 tracking-tight">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              Reviews
            </h2>
            
            {user ? (
              <form onSubmit={submitReview} className="mb-12 space-y-6">
                <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Your Rating</span>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="bg-transparent font-bold text-emerald-400 outline-none cursor-pointer text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => 10 - i).map(n => (
                      <option key={n} value={n} className="bg-[#0a0a0a]">{n} Stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Share your thoughts..."
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[24px] p-6 text-sm focus:border-emerald-500/30 transition-all h-32 resize-none outline-none font-medium placeholder:text-white/20"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  required
                />
                <button type="submit" className="w-full bg-white text-black py-4.5 rounded-2xl font-bold hover:bg-emerald-400 transition-all duration-500 transform active:scale-95 shadow-lg shadow-white/5">
                  POST REVIEW
                </button>
              </form>
            ) : (
              <div className="bg-white/[0.03] rounded-[32px] p-10 text-center mb-12 border border-white/[0.05]">
                <p className="text-white/30 font-semibold mb-6 text-sm">Sign in to share your review</p>
                <Link to="/auth" className="inline-block bg-emerald-500 text-black px-10 py-3.5 rounded-2xl font-bold text-xs tracking-widest hover:bg-emerald-400 transition-all">LOGIN</Link>
              </div>
            )}

            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {reviews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-[10px]">No reviews yet</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="group bg-white/[0.02] rounded-[24px] p-6 border border-white/[0.03] hover:border-white/[0.08] transition-all duration-500">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-emerald-500/20">
                          {review.userName[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-white/90">{review.userName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold tracking-tighter">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 font-medium leading-relaxed italic mb-5">"{review.review}"</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.1em]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {user && user.id === review.userId && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete this review?")) {
                              await api.deleteReview(review.id);
                              const r = await api.getReviews(Number(id));
                              setReviews(r);
                            }
                          }}
                          className="text-[10px] font-bold text-red-500/40 hover:text-red-400 uppercase tracking-[0.1em] transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MovieDetailPage;
