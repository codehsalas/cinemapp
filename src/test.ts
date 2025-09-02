
import { MovieApiService } from './services/movieApi';

// Función para probar la API
export const testAPI = async () => {
  try {
    console.log('🎬 Probando conexión con TMDB API...');
    const movies = await MovieApiService.getPopularMovies(1);
    console.log('✅ API funcionando!', movies.results.length, 'películas encontradas');
    console.log('📽️ Primera película:', movies.results[0]?.title);
    return true;
  } catch (error) {
    console.error('❌ Error en API:', error);
    return false;
  }
};