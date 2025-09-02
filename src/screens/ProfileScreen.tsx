
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Camera from 'expo-camera';
import { UserProfile } from '../types/navigation.types';
import { StorageService } from '../services/storageService';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');
  const [showImageOptions, setShowImageOptions] = useState<boolean>(false);

  // Cargar perfil al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      let profile = await StorageService.getUserProfile();

      if (!profile) {
        // Crear perfil por defecto si no existe
        profile = await StorageService.createDefaultProfile();
      }

      setUserProfile(profile);
      setTempName(profile.name);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      const success = await StorageService.saveUserProfile(updatedProfile);
      if (success) {
        setUserProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  const handleSaveName = async () => {
    if (!userProfile || !tempName.trim()) return;

    const updatedProfile = {
      ...userProfile,
      name: tempName.trim(),
    };

    const success = await saveProfile(updatedProfile);
    if (success) {
      setEditingName(false);
    } else {
      Alert.alert('Error', 'No se pudo guardar el nombre');
    }
  };

  const handleCancelEditName = () => {
    setTempName(userProfile?.name || '');
    setEditingName(false);
  };

  const requestCameraPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  };
  const requestMediaLibraryPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para seleccionar una imagen.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setShowImageOptions(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const hasPermission = await requestCameraPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a la cámara para tomar una foto.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setShowImageOptions(false);
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      profileImage: imageUri,
    };

    const success = await saveProfile(updatedProfile);
    if (!success) {
      Alert.alert('Error', 'No se pudo guardar la imagen');
    }
  };

  const removeProfileImage = async () => {
    if (!userProfile) return;

    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedProfile = {
              ...userProfile,
              profileImage: undefined,
            };
            await saveProfile(updatedProfile);
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      'Eliminar todos los datos',
      '¿Estás seguro? Esto eliminará todos tus favoritos, calificaciones y configuraciones.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await StorageService.clearAllData();
            if (success) {
              await loadUserProfile(); // Recargar perfil por defecto
              Alert.alert('Éxito', 'Todos los datos han sido eliminados');
            } else {
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error al cargar el perfil</Text>
          <TouchableOpacity onPress={loadUserProfile}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="person" size={28} color="#007AFF" />
            <Text style={styles.title}>Mi Perfil</Text>
          </View>
        </View>

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {userProfile.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={60} color="#ccc" />
              </View>
            )}

            <TouchableOpacity
              style={styles.editImageButton}
              onPress={() => setShowImageOptions(true)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {userProfile.profileImage && (
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeProfileImage}
            >
              <Text style={styles.removeImageText}>Eliminar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.nameContainer}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            {editingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Ingresa tu nombre"
                  autoFocus
                  maxLength={50}
                />
                <View style={styles.editNameButtons}>
                  <TouchableOpacity
                    style={[styles.nameButton, styles.cancelButton]}
                    onPress={handleCancelEditName}
                  >
                    <Ionicons name="close" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.nameButton, styles.saveButton]}
                    onPress={handleSaveName}
                  >
                    <Ionicons name="checkmark" size={18} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplayContainer}
                onPress={() => setEditingName(true)}
              >
                <Text style={styles.nameText}>{userProfile.name}</Text>
                <Ionicons name="pencil" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>{userProfile.favoriteMovies.length}</Text>
              <Text style={styles.statLabel}>Favoritas</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>
                {Object.keys(userProfile.movieRatings).length}
              </Text>
              <Text style={styles.statLabel}>Calificadas</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>
                {Math.floor((Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text style={styles.statLabel}>Días</Text>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>

          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>
                {new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="refresh" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>
                {new Date(userProfile.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerSectionTitle}>Zona Peligrosa</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={clearAllData}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Eliminar todos los datos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar imagen</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhotoWithCamera}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>Seleccionar de galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#007AFF',
    marginTop: 10,
    fontSize: 16,
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  imageSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  removeImageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#FFE5E5',
  },
  removeImageText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 15,
  },
  nameContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  nameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  editNameButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  nameButton: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
  },
  saveButton: {
    backgroundColor: '#E8F5E8',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  dangerButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  modalCancelOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});