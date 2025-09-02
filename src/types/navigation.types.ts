
export type RootTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Trending: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  TabNavigator: undefined;
  MovieDetail: { movieId: number; movie?: Movie };
};

// Re-exportar tipos de película
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  // Campos adicionales para la app
  isFavorite?: boolean;
  userRating?: number; // Rating del usuario (1-5)
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
  production_countries: ProductionCountry[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Tipos para el usuario
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  favoriteMovies: number[];
  movieRatings: Record<number, number>; // movieId -> rating
  createdAt: string;
  updatedAt: string;
}

// Tipos para búsqueda
export interface SearchState {
  query: string;
  isVoiceSearching: boolean;
  results: Movie[];
  isLoading: boolean;
  error: string | null;
}

// Tipos para favoritos
export interface FavoriteMovie extends Movie {
  addedAt: string;
}

// Tipos para permisos
export type PermissionType = 'camera' | 'microphone' | 'media-library';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}