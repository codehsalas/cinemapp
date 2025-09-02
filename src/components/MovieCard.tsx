
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/navigation.types';
import { MovieApiService } from '../services/movieApi';
import { RatingStars } from './RatingStars';

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  onToggleFavorite: (movieId: number) => void;
  onRate: (movieId: number, rating: number) => void;
  isFavorite?: boolean;
  userRating?: number;
  showRating?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onPress, 
  onToggleFavorite,
  onRate,
  isFavorite = false,
  userRating = 0,
  showRating = true
}) => {
  const posterUrl = MovieApiService.getPosterUrl(movie.poster_path);
  
  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const handleFavoritePress = (event: any) => {
    event.stopPropagation();
    onToggleFavorite(movie.id);
  };

  const handleRatingChange = (rating: number) => {
    onRate(movie.id, rating);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
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
            <Text style={styles.noPosterText}>Sin imagen</Text>
          </View>
        )}
        
        {/* Botón de favoritos superpuesto */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF6B6B" : "#fff"}
          />
        </TouchableOpacity>

        {/* Rating TMDB */}
        <View style={styles.tmdbRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.tmdbRatingText}>
            {formatRating(movie.vote_average)}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.year}>
            {formatDate(movie.release_date)}
          </Text>
          
          <View style={styles.popularityContainer}>
            <Ionicons name="trending-up" size={12} color="#666" />
            <Text style={styles.popularityText}>
              {Math.round(movie.popularity)}
            </Text>
          </View>
        </View>

        {/* Rating del usuario */}
        {showRating && (
          <View style={styles.userRatingContainer}>
            <Text style={styles.ratingLabel}>Tu puntuación:</Text>
            <RatingStars
              rating={userRating}
              onRatingChange={handleRatingChange}
              size={16}
              disabled={false}
            />
          </View>
        )}

        {/* Overview corto */}
        {movie.overview && (
          <Text style={styles.overview} numberOfLines={2}>
            {movie.overview}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  posterContainer: {
    height: CARD_WIDTH * 1.5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  noPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 6,
  },
  tmdbRating: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tmdbRatingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  year: {
    fontSize: 12,
    color: '#666',
  },
  popularityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularityText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  userRatingContainer: {
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  overview: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
  },
});