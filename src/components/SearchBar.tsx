// src/components/SearchBar.tsx - VERSIÓN MÍNIMA

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar películas...',
  onSearch,
  initialValue = '',
}) => {
  // Estado INTERNO - no depende del componente padre
  const [localValue, setLocalValue] = useState(initialValue);

  const handleSubmit = useCallback(() => {
    onSearch(localValue.trim());
  }, [localValue, onSearch]);

  const clearSearch = useCallback(() => {
    setLocalValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#666" 
          style={styles.searchIcon} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={localValue}
          onChangeText={setLocalValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          keyboardType="default"
        />

        {localValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 15,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
    minHeight: 20,
  },
  clearButton: {
    marginLeft: 10,
    padding: 4,
  },
});