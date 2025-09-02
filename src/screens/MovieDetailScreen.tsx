
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MovieDetail, RootStackParamList } from '../types/navigation.types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RatingStars } from '../components/RatingStars';
import { MovieApiService } from '../services/movieApi';
import { StorageService } from '../services/storageService';
import { SafeAreaView } from 'react-native-safe-area-context';

type MovieDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MovieDetail'>;
type MovieDetailScreenRouteProp = RouteProp<RootStackParamList, 'MovieDetail'>;

interface MovieDetailScreenProps {
  navigation: MovieDetailScreenNavigationProp;
  route: MovieDetailScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { movieId, movie: movieFromRoute } = route.params;
  
  // Estados principales
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estados de usuario
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      
      // Obtener detalles de la película
      const movieDetail = await MovieApiService.getMovieDetail(movieId);
      setMovie(movieDetail);
      
      // Cargar estado de favoritos y rating del usuario
      const [favoriteStatus, rating] = await Promise.all([
        StorageService.getFavoriteMovies(),
        StorageService.getMovieRatings(),
      ]);
      
      setIsFavorite(favoriteStatus.includes(movieId));
      setUserRating(rating[movieId] || 0);
      
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar la información de la película.',
        [
          { text: 'Reintentar', onPress: fetchMovieDetail },
          { text: 'Volver', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        const success = await StorageService.removeFromFavorites(movieId);
        if (success) {
          setIsFavorite(false);
        }
      } else {
        const success = await StorageService.addToFavorites(movieId);
        if (success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      const success = await StorageService.setMovieRating(movieId, rating);
      if (success) {
        setUserRating(rating);
      }
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  };

  // Funciones de formateo
  const formatRuntime = (minutes: number): string => {
    if (!minutes) return 'Duración desconocida';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatMoney = (amount: number): string => {
    if (!amount) return 'No disponible';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando detalles..." />;
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="film-outline" size={80} color="#ccc" />
          <Text style={styles.errorTitle}>
            No se pudo cargar la película
          </Text>
          <Text style={styles.errorText}>
            Verifica tu conexión a internet e intenta de nuevo
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMovieDetail}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const backdropUrl = MovieApiService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = MovieApiService.getPosterUrl(movie.poster_path);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Backdrop Image */}
        <View style={styles.backdropContainer}>
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noBackdrop}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "#FF6B6B" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Movie Info */}
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            {/* Poster */}
            <View style={styles.posterContainer}>
              {posterUrl ? (
                <Image
                  source={{ uri: posterUrl }}
                  style={styles.poster}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noPoster}>
                  <Ionicons name="film-outline" size={40} color="#ccc" />
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.basicInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              
              {movie.tagline && (
                <Text style={styles.tagline}>"{movie.tagline}"</Text>
              )}

              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {formatDate(movie.release_date)}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {formatRuntime(movie.runtime)}
                  </Text>
                </View>
              </View>

              <View style={styles.ratingContainer}>
                <View style={styles.tmdbRating}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.tmdbRatingText}>
                    {movie.vote_average.toFixed(1)}
                  </Text>
                  <Text style={styles.voteCount}>
                    ({movie.vote_count.toLocaleString()})
                  </Text>
                </View>
              </View>

              {/* User Rating */}
              <View style={styles.userRatingSection}>
                <Text style={styles.userRatingLabel}>Tu puntuación:</Text>
                <RatingStars
                  rating={userRating}
                  onRatingChange={handleRating}
                  size={24}
                />
                {userRating > 0 && (
                  <Text style={styles.userRatingValue}>
                    {userRating}/5
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Géneros</Text>
              <View style={styles.genresContainer}>
                {movie.genres.map((genre) => (
                  <View key={genre.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.overview}>
              {movie.overview || 'No hay sinopsis disponible.'}
            </Text>
          </View>

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Estado</Text>
                <Text style={styles.detailValue}>{movie.status}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Idioma Original</Text>
                <Text style={styles.detailValue}>
                  {movie.original_language.toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Presupuesto</Text>
                <Text style={styles.detailValue}>
                  {formatMoney(movie.budget)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Recaudación</Text>
                <Text style={styles.detailValue}>
                  {formatMoney(movie.revenue)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Popularidad</Text>
                <Text style={styles.detailValue}>
                  {Math.round(movie.popularity)}
                </Text>
              </View>
            </View>
          </View>

          {/* Production Companies */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productoras</Text>
              {movie.production_companies.slice(0, 5).map((company) => (
                <Text key={company.id} style={styles.companyText}>
                  • {company.name}
                </Text>
              ))}
            </View>
          )}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: width,
    height: '100%',
  },
  noBackdrop: {
    width: width,
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  headerSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  posterContainer: {
    width: 120,
    height: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  noPoster: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaInfo: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    marginBottom: 15,
  },
  tmdbRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tmdbRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  userRatingSection: {
    alignItems: 'flex-start',
  },
  userRatingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  userRatingValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
  },
  companyText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    paddingLeft: 10,
  },
  bottomPadding: {
    height: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});