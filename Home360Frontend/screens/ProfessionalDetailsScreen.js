import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

export default function ProfessionalDetailsScreen({ route, navigation }) {
  const { professional, category, userEmail, userType } = route.params;
  console.log(">>>>>>>>>>>>>>>>>>>");
  console.log(userEmail);

  return (
    <FlatList
    contentContainerStyle={{ backgroundColor: '#1E1E1E', flexGrow: 1 }}
      ListHeaderComponent={
        <>
          {/* Botón de regreso */}
          <TouchableOpacity style={styles.backButton} 
          //onPress={() => navigation.goBack()}
          onPress={() => {
            navigation.setParams({ userEmail, userType });
            navigation.goBack();
          }}
          >
            <Icon name="arrow-back" size={30} color="white" />
          </TouchableOpacity>

          {/* Información principal */}
          <View style={styles.header}>
            <Image source={{ uri: professional.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{professional.first_name}, {professional.age}</Text>
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
                  <Icon key={index} name={index < professional.rating ? "star" : "star-outline"} size={20} color="#FFD700" />
                ))}
              </View>
            </View>
          </View>

          {/* Imágenes de trabajos */}
          <View style={styles.imagesContainer}>
            {professional.work_images?.slice(0, 2).map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.workImage} />
            ))}
            <TouchableOpacity style={styles.moreWorks}>
              <Text style={styles.moreWorksText}>Ver más trabajos</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Pedir Cotización */}
          <TouchableOpacity style={styles.quoteButton} onPress={() => {navigation.navigate('PedirCotizacion', { professional: professional, category: category, userEmail, userType })}}>
            <Text style={styles.quoteButtonText}>Pedir Cotización</Text>
          </TouchableOpacity>
        </>
      }
      data={professional.reviews}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewName}>{item.user}</Text>
          <Text style={styles.reviewText}>{item.comment}</Text>
          <View style={styles.rating}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Icon key={index} name={index < item.rating ? "star" : "star-outline"} size={16} color="#FFD700" />
            ))}
          </View>
        </View>
      )}
      ListFooterComponent={
        <TouchableOpacity style={styles.moreReviews}>
          <Text style={styles.moreReviewsText}>Ver más opiniones</Text>
        </TouchableOpacity>
      }
    />
  );
}

// Estilos
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
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  workImage: {
    width: '48%',
    height: 100,
    borderRadius: 10,
  },
  moreWorks: {
    width: '48%',
    height: 100,
    marginLeft: 20,
    backgroundColor: '#444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreWorksText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quoteButton: {
    backgroundColor: '#2D9135',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  quoteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
  moreReviews: {
    backgroundColor: '#444',
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 20,
    marginRight:20,
    alignItems: 'center',
    marginTop: 10,
  },
  moreReviewsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
