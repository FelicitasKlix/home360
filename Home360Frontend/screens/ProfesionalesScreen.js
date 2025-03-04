import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

export default function ProfesionalesScreen({ route, navigation }) {
  const { category, userEmail, userType } = route.params; // Categoría seleccionada
  console.log("////////////////");
  console.log(category);
  console.log(userEmail);
  const API_URL = "http://192.168.0.21:8080";
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/professionals/specialty/${category}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener profesionales');
      }
  
      const data = await response.json();
      console.log(data);
      // Si la lista de profesionales está vacía, se muestra el mensaje de error
      if (Array.isArray(data.professionals) && data.professionals.length > 0) {
        setProfessionals(data.professionals);
        setError(null); // Limpia cualquier error anterior
      } else {
        setProfessionals([]); // Asegura que el array esté vacío
        setError("No se encontraron profesionales en esta categoría.");
      }
      
    } catch (error) {
      console.error('Error al obtener profesionales:', error);
      setError('Error al cargar los profesionales');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} 
      //onPress={() => navigation.goBack()}
      onPress={() => {
        navigation.setParams({ userEmail, userType });
        navigation.goBack();
      }}
      >
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Nuestros héroes</Text>

      {loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2D9135" />
    <Text style={styles.loadingText}>Cargando profesionales...</Text>
  </View>
) : error ? (
  <Text style={styles.errorText}>{error}</Text>
) : professionals.length === 0 ? (
  <Text style={styles.errorText}>No se encontraron profesionales en esta categoría.</Text>
) : (
    <FlatList
    data={professionals}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity 
        style={styles.card}  // Usar el mismo estilo que tenías antes
        onPress={() => {
          //navigation.navigate('ProfessionalDetails', { professional: item })
          navigation.navigate('ProfessionalDetails', { professional: item, category: category, userEmail, userType })
        }}
      >
        <Icon name="person-circle-outline" size={60} color="gray" style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.first_name}</Text>
          <Text style={styles.specialty}>
            <Icon name="construct-outline" size={16} /> {item.specialty?.join(' - ')}
          </Text>
          <Text style={styles.zones}>
            <Icon name="location-outline" size={16} /> {item.zones?.join(', ')}
          </Text>
        </View>
      </TouchableOpacity>
    )}
  />
)}

    </View>

    <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    marginTop: 20,
    marginLeft: 10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 40,
    marginTop: 80,
    marginBottom:20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#008A45',
  },
  avatar: {
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  specialty: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
  zones: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#008A45',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
    width: '100%'
  },
});

