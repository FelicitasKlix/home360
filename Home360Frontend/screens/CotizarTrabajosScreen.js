import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CotizarTrabajosScreen({ route, navigation }) {
  //const API_URL = "http://192.168.1.25:8080";
  const {userEmail} = route.params;
  console.log(userEmail);
  const API_URL = "http://192.168.0.11:8080";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/specialties`);
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      // Asumiendo que la respuesta viene en el formato {"specialties": [...]}
      if (data.specialties && Array.isArray(data.specialties)) {
        // Capitalizar primera letra de cada categoría
        const formattedCategories = data.specialties.map(
          category => category.charAt(0).toUpperCase() + category.slice(1)
        );
        setCategories(formattedCategories);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };


  const handleCategoryPress = (category) => {
    navigation.navigate('Profesionales', { category: category, userEmail: userEmail });
  };

  // Renderizado condicional para el error
  if (error) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', {userEmail: userEmail})}>
          <Icon name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Categorías</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', {userEmail: userEmail})}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Categorías</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D9135" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.button} onPress={() => handleCategoryPress(item)}>
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          )}
          style={styles.flatList}
        />
      )}
    </View>

    <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home', {userEmail: userEmail})}>
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Solicitudes', {userEmail: userEmail})}>
          <Icon name="construct-outline" size={24} color="white" />
          <Text style={styles.tabText}>Solicitudes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="chatbubbles-outline" size={24} color="white" />
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    marginTop:20,
    marginLeft:10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 80,
  },
  flatList: {
    width: '100%',
    paddingHorizontal: '10%',
  },
  button: {
    backgroundColor: '#008A45',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  retryButton: {
    backgroundColor: '#2D9135',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#008A45',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});