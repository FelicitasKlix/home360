import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

const SolicitudesScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  console.log(userEmail);
  console.log(userType);
  const API_URL = "http://192.168.0.21:8080";
  const [quotations, setQuotations] = useState({ pending: [], completed: [], rejected: [], in_progress: [] });
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState(null);
  const [userRole, setUserType] = useState('');

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/quotation/${userEmail}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        setQuotations(data);
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveService = async () => {
      try {
        const response = await fetch(`${API_URL}/services/emergency/active/${userEmail}`);
        const data = await response.json();
        if (data.activeService) {
          setActiveService(data.activeService);
        }
      } catch (error) {
        console.error('Error fetching active emergency service:', error);
      }
    };

    const fetchUserType = async () => {
      try {
        const response = await fetch(`${API_URL}/users/user-type/${userEmail}`);
        const data = await response.json();
        if (data && data.type) {
          setUserType(data.type);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchQuotations();
    fetchActiveService();
    fetchUserType();
  }, [userEmail]);

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}
      onPress={() => navigation.navigate("Chat", {
        userEmail,
        receiverEmail: item.professionalEmail,
        comonUserEmail: item.userEmail,
        quotationId: item.id
      })}
    >
      <Text style={styles.title}>{item.category}</Text>
      <Text style={styles.subtitle}>{item.description}</Text>
    </TouchableOpacity>
  );
  
  const data = [
    { title: 'Pendientes', data: quotations.pending },
    { title: 'En proceso', data: quotations.in_progress },
    { title: 'Realizados', data: quotations.completed },
    { title: 'Rechazados', data: quotations.rejected }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>
      <FlatList
        data={[
          { key: 'activeService', type: 'activeService' }, // Añadimos un item dummy para la solicitud express
          { key: 'pending', type: 'pending', data: quotations.pending },
          { key: 'in_progress', type: 'in_progress', data: quotations.in_progress },
          { key: 'completed', type: 'completed', data: quotations.completed },
          { key: 'rejected', type: 'rejected', data: quotations.rejected }
        ]}
        ListHeaderComponent={
          activeService && (
            <View style={styles.activeServiceCard}>
              <Text style={styles.activeServiceTitle}>Solicitud Express Activa</Text>
              <Text style={styles.activeServiceDescription}>{activeService.description}</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigation.navigate("Chat", {
                  userEmail,
                  receiverEmail: activeService.professional,
                  comonUserEmail: activeService.userEmail,
                  quotationId: activeService.id
                })}
              >
                <Text style={styles.chatButtonText}>Ir al Chat</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (item.type === 'activeService') return null; // No renderizamos el dummy item
          return (
            <View style={styles.sectionContainer}>
              {/* Contenedor de la sección con fondo gris */}
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>
                  {item.type === 'pending' && 'Pendientes'}
                  {item.type === 'in_progress' && 'En proceso'}
                  {item.type === 'completed' && 'Realizados'}
                  {item.type === 'rejected' && 'Rechazados'}
                </Text>
              </View>
              <FlatList
                data={item.data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.flatList}
              />
            </View>
          );
        }}
        keyExtractor={item => item.key}
        ListFooterComponent={<View style={{ height: 80 }} />} // Espacio para la TabBar
      />
      
      {/* TabBar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => {
            if (userRole === 'professional') {
              navigation.navigate('ProfessionalHome', { userEmail, userType });
            } else {
              navigation.navigate('Home', { userEmail, userType });
            }
          }}
        >
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Solicitudes', { userEmail, userType })}>
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
  
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    width: '100%', 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center', 
    marginTop: 80 
  },
  sectionTitleContainer: {
    width: '90%', // Asegura que el título tenga el mismo ancho que las cards
    alignSelf: 'center', // Centra el contenedor
    backgroundColor: '#333', // Gris de fondo para la sección
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10, // Espaciado para separar de los items
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left', // Alineación a la izquierda
  },
  sectionContainer: {width: '100%'},
  item: { 
    backgroundColor: '#222', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 10,
    borderColor: '#008A45',
    borderWidth: 2
  },
  title: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: 'white' },
  activeServiceCard: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  activeServiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  activeServiceDescription: {
    fontSize: 14,
    color: 'white',
    marginVertical: 5
  },
  chatButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10
  },
  chatButtonText: {
    color: 'black',
    fontWeight: 'bold'
  },
  tabItem: { alignItems: 'center' },
  tabText: { color: 'white', fontSize: 12, marginTop: 4 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#008A45',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
    width: '100%'
  },
  flatList: { width: '90%', alignSelf: 'center' }
});

export default SolicitudesScreen;
