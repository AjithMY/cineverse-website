import { User, Movie, Cast, Video, Review, WatchlistItem } from "../types";

const API_BASE = typeof window !== 'undefined' ? window.location.origin + "/api" : "/api";

const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type");
  
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error(`Expected JSON but received ${contentType || 'nothing'}. Raw response:`, text.substring(0, 500));
    
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    throw new Error("Invalid JSON response from server (received HTML or text instead)");
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    throw new Error("Failed to parse JSON response from server");
  }
  
  if (!res.ok) {
    throw new Error(data.error || data.status_message || `Request failed with status ${res.status}`);
  }
  
  return data;
};

export const api = {
  // Auth
  async login(credentials: any) {
    return apiFetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },
  async register(data: any) {
    return apiFetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async logout() {
    return apiFetch(`${API_BASE}/auth/logout`, { method: "POST" });
  },
  async getMe() {
    return apiFetch(`${API_BASE}/auth/me`);
  },
  async updateProfile(data: { name: string; bio?: string; photoURL?: string }) {
    return apiFetch(`${API_BASE}/auth/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // TMDB Proxy
  async getTrending(timeWindow: "day" | "week" = "week") {
    return apiFetch(`${API_BASE}/tmdb/trending?timeWindow=${timeWindow}`);
  },
  async getPopular() {
    return apiFetch(`${API_BASE}/tmdb/popular`);
  },
  async getTopRated() {
    return apiFetch(`${API_BASE}/tmdb/top-rated`);
  },
  async getUpcoming() {
    return apiFetch(`${API_BASE}/tmdb/upcoming`);
  },
  async getHollywoodMovies() {
    return apiFetch(`${API_BASE}/tmdb/discover?with_original_language=en&sort_by=popularity.desc`);
  },
  async getIndianMovies() {
    return apiFetch(`${API_BASE}/tmdb/discover?with_origin_country=IN&sort_by=popularity.desc`);
  },
  async getMovieDetails(id: string) {
    return apiFetch(`${API_BASE}/tmdb/movie/${id}`);
  },
  async getMovieCredits(id: string) {
    return apiFetch(`${API_BASE}/tmdb/movie/${id}/credits`);
  },
  async getMovieVideos(id: string) {
    return apiFetch(`${API_BASE}/tmdb/movie/${id}/videos`);
  },
  async searchMovies(query: string) {
    return apiFetch(`${API_BASE}/tmdb/search/movie?query=${encodeURIComponent(query)}`);
  },
  async getPersonDetails(id: string) {
    return apiFetch(`${API_BASE}/tmdb/person/${id}`);
  },
  async getPersonMovieCredits(id: string) {
    return apiFetch(`${API_BASE}/tmdb/person/${id}/movie_credits`);
  },
  async getWatchProviders(id: string) {
    return apiFetch(`${API_BASE}/tmdb/movie/${id}/watch/providers`);
  },

  // Reviews
  async getReviews(movieId: number) {
    return apiFetch(`${API_BASE}/reviews/${movieId}`);
  },
  async postReview(data: { movieId: number; rating: number; review: string }) {
    return apiFetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async deleteReview(id: number) {
    return apiFetch(`${API_BASE}/reviews/${id}`, { method: "DELETE" });
  },

  // Watchlist
  async getWatchlist() {
    return apiFetch(`${API_BASE}/watchlist`);
  },
  async addToWatchlist(data: { movieId: number; movieTitle: string; moviePoster: string }) {
    return apiFetch(`${API_BASE}/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async removeFromWatchlist(movieId: number) {
    return apiFetch(`${API_BASE}/watchlist/${movieId}`, { method: "DELETE" });
  },
};
