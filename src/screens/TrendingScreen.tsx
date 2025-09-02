
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
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Movie, RootStackParamList } from '../types/navigation.types';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MovieApiService } from '../services/movieApi';
import { StorageService } from '../services/storageService';
import { SafeAreaView } from 'react-native-safe-area-context';

type TrendingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TabNavigator'>;

interface TrendingScreenProps {
  navigation: TrendingScreenNavigationProp;
}

type TrendingTimeWindow = 'day' | 'week';

export const TrendingScreen: React.FC<TrendingScreenProps> = ({ navigation }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [timeWindow, setTimeWindow] = useState<TrendingTimeWindow>('week');
  
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

  const fetchTrendingMovies = async (
    window: TrendingTimeWindow = timeWindow,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      // Usando la API de películas populares como trending
      // En una implementación real, usarías el endpoint específico de trending
      const response = await MovieApiService.getPopularMovies(page);

      if (append) {
        setMovies(prevMovies => [...prevMovies, ...response.results]);
      } else {
        setMovies(response.results);
      }

      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las películas trending. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadInitialMovies = async () => {
    setLoading(true);
    await fetchTrendingMovies(timeWindow, 1, false);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTrendingMovies(timeWindow, 1, false),
      loadUserData(),
    ]);
    setRefreshing(false);
  };

  const loadMoreMovies = async () => {
    if (currentPage < totalPages && !loadingMore) {
      setLoadingMore(true);
      await fetchTrendingMovies(timeWindow, currentPage + 1, true);
      setLoadingMore(false);
    }
  };

  const changeTimeWindow = async (window: TrendingTimeWindow) => {
    if (window !== timeWindow) {
      setTimeWindow(window);
      setLoading(true);
      await fetchTrendingMovies(window, 1, false);
      setLoading(false);
    }
  };

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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Ionicons name="trending-up" size={28} color="#FF6B35" />
        <Text style={styles.title}>Lo Más Visto</Text>
      </View>

      <View style={styles.timeWindowContainer}>
        <Text style={styles.subtitle}>Tendencias de:</Text>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              timeWindow === 'day' && styles.toggleButtonActive
            ]}
            onPress={() => changeTimeWindow('day')}
          >
            <Text style={[
              styles.toggleText,
              timeWindow === 'day' && styles.toggleTextActive
            ]}>
              Hoy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonRight,
              timeWindow === 'week' && styles.toggleButtonActive
            ]}
            onPress={() => changeTimeWindow('week')}
          >
            <Text style={[
              styles.toggleText,
              timeWindow === 'week' && styles.toggleTextActive
            ]}>
              Esta Semana
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          Las películas más populares y comentadas
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="trending-up-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No hay películas trending</Text>
      <Text style={styles.emptyStateText}>
        Verifica tu conexión a internet e intenta de nuevo
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando tendencias..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={movies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => `trending-${item.id}-${timeWindow}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  timeWindowContainer: {
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
  },
  toggleButtonRight: {
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B35',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
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
  },
});