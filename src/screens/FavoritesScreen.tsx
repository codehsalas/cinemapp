
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
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

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TabNavigator'>;

interface FavoritesScreenProps {
  navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [movieRatings, setMovieRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Cargar favoritos cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Obtener IDs de favoritos y ratings del usuario
      const [favoriteIds, ratings] = await Promise.all([
        StorageService.getFavoriteMovies(),
        StorageService.getMovieRatings(),
      ]);

      setMovieRatings(ratings);

      if (favoriteIds.length === 0) {
        setFavoriteMovies([]);
        setLoading(false);
        return;
      }

      // Obtener detalles de cada película favorita
      const moviePromises = favoriteIds.map(movieId => 
        MovieApiService.getMovieDetail(movieId).catch(error => {
          console.error(`Error loading movie ${movieId}:`, error);
          return null;
        })
      );

      const movies = await Promise.all(moviePromises);
      
      // Filtrar películas que se cargaron correctamente y marcarlas como favoritas
      const validMovies = movies
        .filter((movie): movie is Movie => movie !== null)
        .map(movie => ({ ...movie, isFavorite: true }));

      setFavoriteMovies(validMovies);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFromFavorites = async (movieId: number) => {
    try {
      const success = await StorageService.removeFromFavorites(movieId);
      if (success) {
        setFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleRate = async (movieId: number, rating: number) => {
    try {
      const success = await StorageService.setMovieRating(movieId, rating);
      if (success) {
        setMovieRatings(prev => ({
          ...prev,
          [movieId]: rating,
        }));
      }
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  };

  const navigateToMovieDetail = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movieId: movie.id, movie });
  };

  const clearAllFavorites = async () => {
    try {
      // Confirmar acción
      const favoriteIds = await StorageService.getFavoriteMovies();
      
      for (const movieId of favoriteIds) {
        await StorageService.removeFromFavorites(movieId);
      }
      
      setFavoriteMovies([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <MovieCard
      movie={item}
      onPress={() => navigateToMovieDetail(item)}
      onToggleFavorite={handleRemoveFromFavorites}
      onRate={handleRate}
      isFavorite={true} // Todas las películas aquí son favoritas
      userRating={movieRatings[item.id] || 0}
      showRating={true}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Ionicons name="heart" size={28} color="#FF6B6B" />
        <Text style={styles.title}>Mis Favoritas</Text>
      </View>
      
      {favoriteMovies.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {favoriteMovies.length} película{favoriteMovies.length !== 1 ? 's' : ''}
          </Text>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFavorites}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No tienes favoritas</Text>
      <Text style={styles.emptyStateText}>
        Explora películas y toca el corazón para agregarlas a tus favoritas
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}
      >
        <Ionicons name="search" size={20} color="#fff" />
        <Text style={styles.exploreButtonText}>Explorar Películas</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando favoritas..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={favoriteMovies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => `favorite-${item.id}`}
        numColumns={2}
        columnWrapperStyle={favoriteMovies.length > 1 ? styles.row : null}
        contentContainerStyle={[
          styles.listContent,
          favoriteMovies.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE5E5',
    borderRadius: 15,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  emptyListContent: {
    flexGrow: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});