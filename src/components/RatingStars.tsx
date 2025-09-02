
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  maxRating?: number;
  disabled?: boolean;
  color?: string;
  emptyColor?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  onRatingChange,
  size = 20,
  maxRating = 5,
  disabled = false,
  color = '#FFD700',
  emptyColor = '#E0E0E0',
}) => {
  const handleStarPress = (starRating: number) => {
    if (!disabled && onRatingChange) {
      // Si presiona la misma estrella que ya está seleccionada, reset a 0
      const newRating = starRating === rating ? 0 : starRating;
      onRatingChange(newRating);
    }
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= rating;
    const starName = isFilled ? 'star' : 'star-outline';
    const starColor = isFilled ? color : emptyColor;

    if (disabled) {
      return (
        <Ionicons
          key={starNumber}
          name={starName}
          size={size}
          color={starColor}
          style={styles.star}
        />
      );
    }

    return (
      <TouchableOpacity
        key={starNumber}
        onPress={() => handleStarPress(starNumber)}
        style={styles.starButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name={starName}
          size={size}
          color={starColor}
          style={styles.star}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index + 1))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
  star: {
    marginHorizontal: 1,
  },
});