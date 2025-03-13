import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = "http://192.168.0.19:8080";

export default function ProfessionalDetailsScreen({ route, navigation }) {
  const { professional, category, userEmail, userType } = route.params;
  const [reviews, setReviews] = useState([]);
  const [workImages, setWorkImages] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/professionals/reviews/${professional.email}`);
        if (response.data) {
          setReviews(response.data.reviews);
        } else {
          console.error("Error al obtener las reseñas:", response.data.detail);
        }
      } catch (error) {
        console.error("Error en la solicitud de reseñas:", error);
      }
    };

    const fetchProfessionalImages = async () => {
      try {
        const response = await axios.get(`${API_URL}/professionals/get-images/${professional.email}`);
        console.log("Imágenes del profesional:", response.data);
        
        // Maneja adecuadamente diferentes formatos de respuesta
        if (Array.isArray(response.data)) {
          // Si es un array de strings
          if (typeof response.data[0] === 'string') {
            setWorkImages(response.data);
          }
          // Si es un array de objetos con propiedad url
          else if (response.data[0] && response.data[0].url) {
            const urls = response.data.map(item => item.url);
            setWorkImages(urls);
          } else {
            console.error('Formato de respuesta inesperado:', response.data[0]);
          }
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
        }
      } catch (error) {
        console.error("Error al obtener imágenes del profesional:", error);
      }
    };

    fetchReviews();
    fetchProfessionalImages();
  }, [professional.email]);

  return (
    <FlatList
      contentContainerStyle={{ backgroundColor: '#1E1E1E', flexGrow: 1 }}
      ListHeaderComponent={
        <>
          {/* Botón de regreso */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.setParams({ userEmail, userType });
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={30} color="white" />
          </TouchableOpacity>

          {/* Información principal */}
          <View style={styles.header}>
            <Image
              source={{ uri: professional.avatar || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>
                {professional.first_name}, {professional.age}
              </Text>
              <Text style={styles.details}>
                <Icon name="location-outline" size={16} /> A {professional.distance} km de distancia
              </Text>
              <Text style={styles.details}>
                <Icon name="briefcase-outline" size={16} /> {professional.jobs_completed} trabajos realizados
              </Text>
              {professional.express_service && (
                <Text style={styles.expressService}>
                  <Icon name="flash-outline" size={16} /> Ofrece servicios express
                </Text>
              )}
              <View style={styles.rating}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon
                    key={index}
                    name={index < professional.average_score ? 'star' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Imágenes de trabajos - Galería con FlatList horizontal */}
          <View style={styles.workImagesSection}>
            <Text style={styles.sectionTitle}>Trabajos realizados</Text>
            {workImages.length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={workImages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.workImageContainer}>
                    <Image source={{ uri: item }} style={styles.workImageGallery} />
                  </View>
                )}
                contentContainerStyle={styles.imageGalleryContainer}
              />
            ) : (
              <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
            )}
          </View>

          {/* Botón Pedir Cotización */}
          <TouchableOpacity
            style={styles.quoteButton}
            onPress={() => {
              navigation.navigate('PedirCotizacion', { professional: professional, category: category, userEmail, userType });
            }}
          >
            <Text style={styles.quoteButtonText}>Pedir Cotización</Text>
          </TouchableOpacity>
          
          <Text style={styles.reviewsTitle}>Opiniones</Text>
        </>
      }
      data={reviews.length > 0 ? reviews : [{ dummy: true }]} // Asegura que siempre haya al menos un elemento
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        item.dummy ? (
          <Text style={styles.noReviewsText}>No hay reseñas disponibles</Text>
        ) : (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewName}>Usuario</Text>
            <Text style={styles.reviewText}>{item.review_for_professional}</Text>
            <View style={styles.rating}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Icon
                  key={index}
                  name={index < item.points_for_professional ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
        )
      )}
      
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    marginTop: 20,
    marginLeft: 10,
    top: 10,
    left: 10,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  details: {
    fontSize: 14,
    color: 'white',
    marginTop: 2,
  },
  expressService: {
    fontSize: 14,
    color: '#2D9135',
    marginTop: 5,
    fontWeight: 'bold',
  },
  rating: {
    flexDirection: 'row',
    marginTop: 5,
  },
  workImagesSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  imageGalleryContainer: {
    paddingVertical: 10,
  },
  workImageContainer: {
    marginRight: 10,
  },
  workImageGallery: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  noImagesText: {
    color: '#AAAAAA',
    textAlign: 'center',
    padding: 20,
  },
  quoteButton: {
    backgroundColor: '#2D9135',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  quoteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2D9135', // Borde verde
    width: '90%', // Ocupa el 90% del ancho
    alignSelf: 'center', // Centrado horizontalmente
  },
  reviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  reviewText: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  noReviewsText: {
    color: '#AAAAAA',
    textAlign: 'center',
    padding: 20,
  },
  moreReviews: {
    backgroundColor: '#444',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  moreReviewsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});