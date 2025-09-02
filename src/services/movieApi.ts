
import { MovieResponse, MovieDetail } from '../types/navigation.types';

const BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_API_KEY || 'YOUR_ACCESS_TOKEN';

export class MovieApiService {
  private static async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const url = `${BASE_URL}${endpoint}`;
      console.log('Fetching:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  static async getPopularMovies(page: number = 1): Promise<MovieResponse> {
    return this.fetchData<MovieResponse>(`/movie/popular?page=${page}&language=es-ES`);
  }

  static async getTopRatedMovies(page: number = 1): Promise<MovieResponse> {
    return this.fetchData<MovieResponse>(`/movie/top_rated?page=${page}&language=es-ES`);
  }

  static async getNowPlayingMovies(page: number = 1): Promise<MovieResponse> {
    return this.fetchData<MovieResponse>(`/movie/now_playing?page=${page}&language=es-ES`);
  }

  static async getMovieDetail(movieId: number): Promise<MovieDetail> {
    return this.fetchData<MovieDetail>(`/movie/${movieId}?language=es-ES`);
  }

  static async searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData<MovieResponse>(`/search/movie?query=${encodedQuery}&page=${page}&language=es-ES`);
  }

  static getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  static getPosterUrl(posterPath: string | null): string {
    return this.getImageUrl(posterPath, 'w500');
  }

  static getBackdropUrl(backdropPath: string | null): string {
    return this.getImageUrl(backdropPath, 'w780');
  }
}