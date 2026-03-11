export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  photoURL?: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  backdrop_path: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
  known_for_department: string;
}

export interface PersonMovieCredits {
  cast: Movie[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  movieId: number;
  rating: number;
  review: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: number;
  userId: number;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
}
