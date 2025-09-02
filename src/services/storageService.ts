
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, UserProfile } from '../types/navigation.types';

// Keys para AsyncStorage
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  FAVORITE_MOVIES: 'favorite_movies',
  MOVIE_RATINGS: 'movie_ratings',
  SEARCH_HISTORY: 'search_history',
} as const;

export class StorageService {
  // === PERFIL DE USUARIO ===
  
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!profileJson) {
        return null;
      }
      return JSON.parse(profileJson);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE, 
        JSON.stringify(updatedProfile)
      );
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  static async createDefaultProfile(): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: 'Usuario',
      favoriteMovies: [],
      movieRatings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  // === PELÍCULAS FAVORITAS ===

  static async getFavoriteMovies(): Promise<number[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_MOVIES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addToFavorites(movieId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteMovies();
      if (!favorites.includes(movieId)) {
        favorites.push(movieId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.FAVORITE_MOVIES, 
          JSON.stringify(favorites)
        );
        
        // Actualizar también en el perfil de usuario
        const profile = await this.getUserProfile();
        if (profile) {
          profile.favoriteMovies = favorites;
          await this.saveUserProfile(profile);
        }
      }
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  static async removeFromFavorites(movieId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteMovies();
      const updatedFavorites = favorites.filter(id => id !== movieId);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITE_MOVIES, 
        JSON.stringify(updatedFavorites)
      );

      // Actualizar también en el perfil de usuario
      const profile = await this.getUserProfile();
      if (profile) {
        profile.favoriteMovies = updatedFavorites;
        await this.saveUserProfile(profile);
      }

      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static async isFavorite(movieId: number): Promise<boolean> {
    const favorites = await this.getFavoriteMovies();
    return favorites.includes(movieId);
  }

  // === RATINGS DE PELÍCULAS ===

  static async getMovieRatings(): Promise<Record<number, number>> {
    try {
      const ratingsJson = await AsyncStorage.getItem(STORAGE_KEYS.MOVIE_RATINGS);
      return ratingsJson ? JSON.parse(ratingsJson) : {};
    } catch (error) {
      console.error('Error getting movie ratings:', error);
      return {};
    }
  }

  static async setMovieRating(movieId: number, rating: number): Promise<boolean> {
    try {
      const ratings = await this.getMovieRatings();
      
      if (rating === 0) {
        // Si rating es 0, eliminar el rating
        delete ratings[movieId];
      } else {
        ratings[movieId] = rating;
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.MOVIE_RATINGS, 
        JSON.stringify(ratings)
      );

      // Actualizar también en el perfil de usuario
      const profile = await this.getUserProfile();
      if (profile) {
        profile.movieRatings = ratings;
        await this.saveUserProfile(profile);
      }

      return true;
    } catch (error) {
      console.error('Error setting movie rating:', error);
      return false;
    }
  }

  static async getMovieRating(movieId: number): Promise<number> {
    const ratings = await this.getMovieRatings();
    return ratings[movieId] || 0;
  }

  // === HISTORIAL DE BÚSQUEDA ===

  static async getSearchHistory(): Promise<string[]> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  static async addToSearchHistory(query: string): Promise<boolean> {
    try {
      if (!query.trim()) return false;

      const history = await this.getSearchHistory();
      
      // Remover si ya existe para evitar duplicados
      const filteredHistory = history.filter(item => 
        item.toLowerCase() !== query.toLowerCase()
      );

      // Agregar al inicio y limitar a 20 elementos
      const updatedHistory = [query, ...filteredHistory].slice(0, 20);

      await AsyncStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY, 
        JSON.stringify(updatedHistory)
      );

      return true;
    } catch (error) {
      console.error('Error adding to search history:', error);
      return false;
    }
  }

  static async clearSearchHistory(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      return true;
    } catch (error) {
      console.error('Error clearing search history:', error);
      return false;
    }
  }

  // === UTILIDADES GENERALES ===

  static async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.FAVORITE_MOVIES,
        STORAGE_KEYS.MOVIE_RATINGS,
        STORAGE_KEYS.SEARCH_HISTORY,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  static async getStorageSize(): Promise<{ keys: number; totalSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      return {
        keys: keys.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      console.error('Error getting storage size:', error);
      return { keys: 0, totalSize: '0 KB' };
    }
  }

  // === EXPORTAR/IMPORTAR DATOS ===

  static async exportUserData(): Promise<string | null> {
    try {
      const profile = await this.getUserProfile();
      const favorites = await this.getFavoriteMovies();
      const ratings = await this.getMovieRatings();
      const searchHistory = await this.getSearchHistory();

      const userData = {
        profile,
        favorites,
        ratings,
        searchHistory,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  static async importUserData(dataJson: string): Promise<boolean> {
    try {
      const userData = JSON.parse(dataJson);
      
      if (userData.profile) {
        await this.saveUserProfile(userData.profile);
      }
      
      if (userData.favorites) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.FAVORITE_MOVIES, 
          JSON.stringify(userData.favorites)
        );
      }
      
      if (userData.ratings) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.MOVIE_RATINGS, 
          JSON.stringify(userData.ratings)
        );
      }
      
      if (userData.searchHistory) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SEARCH_HISTORY, 
          JSON.stringify(userData.searchHistory)
        );
      }

      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}