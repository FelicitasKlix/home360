import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Image } from 'react-native';
import axios from 'axios';
import TabBar from '../navigation/TabBar';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = "https://home360-44h2.onrender.com";

const ProfessionalProfileScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUserImages();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/user-all-info/${userEmail}`);
      setUser(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
    }
  };

  const fetchUserImages2 = async () => {
    try {
      const response = await axios.get(`${API_URL}/professionals/get-images/${userEmail}`);
      console.log(response.data);
      setImages(response.data); // Suponiendo que la API devuelve un array de URLs
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
    }
  };

  const fetchUserImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/professionals/get-images/${userEmail}`);
      console.log("Images response:", response.data);
      
      if (Array.isArray(response.data)) {
        // If the response is already an array of strings, use it directly
        if (typeof response.data[0] === 'string') {
          setImages(response.data);
        } 
        // If the response is an array of objects with url properties, extract the URLs
        else if (response.data[0] && response.data[0].url) {
          const urls = response.data.map(item => item.url);
          setImages(urls);
        } else {
          console.error('Unexpected response item format:', response.data[0]);
          setImages([]);
        }
      } else {
        console.error('Unexpected response format:', response.data);
        setImages([]);
      }
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      setImages([]);
    }
  };

  const handleUploadFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    
    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage2 = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg'
    });
    formData.append('email', userEmail);

    try {
      const response = await axios.post(`${API_URL}/professionals/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Éxito', 'Imagen subida correctamente');
      console.log(response.data);
      setImages([...images, response.data]); // Agregar nueva imagen al array
    } catch (error) {
      console.error('Error al subir la imagen:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg'
    });
    formData.append('email', userEmail);
  
    try {
      const response = await axios.post(`${API_URL}/professionals/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log("Upload response:", response.data);
      
      // Handle the array of objects response
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].url) {
        // Extract the URL from the first object in the array
        const newImageUrl = response.data[0].url;
        setImages([...images, newImageUrl]); // Add just the URL string to the images array
        Alert.alert('Éxito', 'Imagen subida correctamente');
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        Alert.alert('Error', 'Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  const deleteImage = async (imageId) => {
    try {
      console.log(imageId);
        await axios.delete(`${API_URL}/professionals/delete-image?email=${userEmail}&image_url=${imageId}`);
        setImages(images.filter(img => img !== imageId)); // Eliminar imagen de la lista local
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        Alert.alert('Error', 'No se pudo eliminar la imagen');
    }
};


  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await axios.post(`${API_URL}/users/change-password-user`, {
        email: userEmail,
        current_password: currentPassword,
        new_password: newPassword,
      });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Perfil de Profesional</Text>
            <View style={styles.sectionContainer}>
              <Text style={styles.text}>Nombre: {user.first_name}</Text>
              <Text style={styles.text}>Email: {user.email}</Text>
              <Text style={styles.text}>Teléfono: {user.phone}</Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Cambiar Contraseña</Text>
              <TextInput
                placeholder="Contraseña actual"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Nueva contraseña"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Confirmar nueva contraseña"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
              />
              <TouchableOpacity style={styles.buttonOutline} onPress={handleChangePassword}>
                <Text style={styles.buttonTextOutline}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Cargar imágenes</Text>
              
              <FlatList
                data={images}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: typeof item === 'string' ? item : null }} 
                      style={styles.imagePreview} 
                    />
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(item)}>
                      <MaterialIcons name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              />

              <TouchableOpacity style={styles.buttonOutline} onPress={handleUploadFile}>
                <Text style={styles.buttonTextOutline}>Seleccionar Imagen</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.buttonSupport} onPress={() => Alert.alert('Soporte', 'support@home360.com')}>
              <Text style={styles.buttonTextOutline}>Soporte</Text>
            </TouchableOpacity>
          </>
        }
      />
      <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginVertical: 20, marginTop: 80 },
  sectionContainer: { width: '90%', alignSelf: 'center', padding: 15, backgroundColor: '#1E1E1E', borderRadius: 10, marginBottom: 15 },
  subtitle: { fontSize: 22, fontWeight: 'bold', color: '#EBEBEB', marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 16, color: '#EBEBEB', marginBottom: 5 },
  input: { width: '100%', padding: 15, borderWidth: 1, borderColor: '#1E1E1E', borderRadius: 8, backgroundColor: 'white', fontSize: 16, marginBottom: 10 },
  buttonOutline: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, marginTop:20 },
  buttonSupport: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '90%', alignSelf: 'center', alignItems: 'center', marginBottom: 20 },
  buttonTextOutline: { color: '#EBEBEB', fontSize: 18, fontWeight: 'bold' },
  imageContainer: { marginRight: 10, alignItems: 'center' },
  imagePreview: { width: 100, height: 100, borderRadius: 10 },
  deleteButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'white', borderRadius: 12, padding: 2 },
});

export default ProfessionalProfileScreen;
