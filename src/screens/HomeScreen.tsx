
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Movie, RootStackParamList } from '../types/navigation.types';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MovieApiService } from '../services/movieApi';
import { StorageService } from '../services/storageService';
import { Image } from 'react-native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TabNavigator'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

type MovieCategory = 'popular' | 'top_rated' | 'now_playing';

// Componente CategoryButton mejorado
interface CategoryButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ title, isActive, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons
      name={icon}
      size={18}
      color={isActive ? '#fff' : '#666'}
      style={styles.categoryIcon}
    />
    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Estados principales
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Estados de categoría y búsqueda
  const [selectedCategory, setSelectedCategory] = useState<MovieCategory>('popular');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Estados de usuario
  const [favoriteMovies, setFavoriteMovies] = useState<number[]>([]);
  const [movieRatings, setMovieRatings] = useState<Record<number, number>>({});

  // Cargar datos de usuario al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const [favorites, ratings] = await Promise.all([
        StorageService.getFavoriteMovies(),
        StorageService.getMovieRatings(),
      ]);

      setFavoriteMovies(favorites);
      setMovieRatings(ratings);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchMovies = async (
    category: MovieCategory = selectedCategory,
    page: number = 1,
    append: boolean = false,
    query?: string
  ) => {
    try {
      let response;

      if (query && query.trim()) {
        // Búsqueda por query
        response = await MovieApiService.searchMovies(query.trim(), page);
      } else {
        // Búsqueda por categoría
        switch (category) {
          case 'popular':
            response = await MovieApiService.getPopularMovies(page);
            break;
          case 'top_rated':
            response = await MovieApiService.getTopRatedMovies(page);
            break;
          case 'now_playing':
            response = await MovieApiService.getNowPlayingMovies(page);
            break;
          default:
            response = await MovieApiService.getPopularMovies(page);
        }
      }

      if (append) {
        setMovies(prevMovies => [...prevMovies, ...response.results]);
      } else {
        setMovies(response.results);
      }

      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching movies:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las películas. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadInitialMovies = async () => {
    setLoading(true);
    setIsSearching(false);
    await fetchMovies(selectedCategory, 1, false);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMovies(selectedCategory, 1, false),
      loadUserData(),
    ]);
    setRefreshing(false);
  };

  const loadMoreMovies = async () => {
    if (currentPage < totalPages && !loadingMore && !isSearching) {
      setLoadingMore(true);
      await fetchMovies(selectedCategory, currentPage + 1, true);
      setLoadingMore(false);
    }
  };

  const changeCategory = async (category: MovieCategory) => {
    if (category !== selectedCategory && !isSearching) {
      setSelectedCategory(category);
      setLoading(true);
      await fetchMovies(category, 1, false);
      setLoading(false);
    }
  };

  // Función de búsqueda optimizada con useCallback
  const handleSearch = useCallback(async (query: string) => {
    console.log('🔍 Búsqueda recibida:', query);

    if (query.trim().length > 0) {
      console.log('🔍 Buscando:', query);
      setIsSearching(true);
      setLoading(true);
      await fetchMovies('popular', 1, false, query);
      setLoading(false);
    } else {
      console.log('🧹 Limpiando búsqueda');
      setIsSearching(false);
      setLoading(true);
      await fetchMovies(selectedCategory, 1, false);
      setLoading(false);
    }
  }, [selectedCategory]);

  // Manejar favoritos
  const handleToggleFavorite = async (movieId: number) => {
    const isFav = favoriteMovies.includes(movieId);

    if (isFav) {
      const success = await StorageService.removeFromFavorites(movieId);
      if (success) {
        setFavoriteMovies(prev => prev.filter(id => id !== movieId));
      }
    } else {
      const success = await StorageService.addToFavorites(movieId);
      if (success) {
        setFavoriteMovies(prev => [...prev, movieId]);
      }
    }
  };

  // Manejar ratings
  const handleRate = async (movieId: number, rating: number) => {
    const success = await StorageService.setMovieRating(movieId, rating);
    if (success) {
      setMovieRatings(prev => ({
        ...prev,
        [movieId]: rating,
      }));
    }
  };

  const navigateToMovieDetail = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movieId: movie.id, movie });
  };

  useEffect(() => {
    loadInitialMovies();
  }, []);

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <MovieCard
      movie={item}
      onPress={() => navigateToMovieDetail(item)}
      onToggleFavorite={handleToggleFavorite}
      onRate={handleRate}
      isFavorite={favoriteMovies.includes(item.id)}
      userRating={movieRatings[item.id] || 0}
      showRating={true}
    />
  );

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo/header-logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>
        {isSearching ? 'Resultados de búsqueda' : 'Películas'}
      </Text>

      <SearchBar
        placeholder="Buscar películas..."
        onSearch={handleSearch}
      />

      {!isSearching && (
        <View style={styles.categoryContainer}>
          <CategoryButton
            title="Populares"
            icon="flame"
            isActive={selectedCategory === 'popular'}
            onPress={() => changeCategory('popular')}
          />
          <CategoryButton
            title="Top Rated"
            icon="star"
            isActive={selectedCategory === 'top_rated'}
            onPress={() => changeCategory('top_rated')}
          />
          <CategoryButton
            title="En Cines"
            icon="videocam"
            isActive={selectedCategory === 'now_playing'}
            onPress={() => changeCategory('now_playing')}
          />
        </View>
      )}

      {isSearching && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchResults}>
            {movies.length} resultado{movies.length !== 1 ? 's' : ''} encontrado{movies.length !== 1 ? 's' : ''}
          </Text>
          {movies.length > 0 && (
            <TouchableOpacity
              style={styles.backToMoviesButton}
              onPress={() => handleSearch('')}
            >
              <Ionicons name="arrow-back" size={16} color="#007AFF" />
              <Text style={styles.backToMoviesText}>Volver a películas</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  ), [isSearching, selectedCategory, movies.length, handleSearch]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={isSearching ? "search-outline" : "film-outline"}
        size={80}
        color="#ccc"
      />
      <Text style={styles.emptyStateTitle}>
        {isSearching ? 'No se encontraron películas' : 'No hay películas disponibles'}
      </Text>
      <Text style={styles.emptyStateText}>
        {isSearching
          ? 'Intenta con una búsqueda diferente'
          : 'Verifica tu conexión a internet'
        }
      </Text>
      {isSearching && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => handleSearch('')}
        >
          <Text style={styles.emptyStateButtonText}>Ver todas las películas</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando películas..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={movies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => `${item.id}-${selectedCategory}-${isSearching}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    alignItems: 'left',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    elevation: 4,
    shadowOpacity: 0.25,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  searchInfo: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchResults: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  backToMoviesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
  },
  backToMoviesText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-evenly',
    paddingHorizontal: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});