import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

const SolicitudesScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const API_URL = "http://192.168.0.21:8080";
  const [quotations, setQuotations] = useState({ pending: [], completed: [], rejected: [], in_progress: [] });
  const [loading, setLoading] = useState(true);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const [activeService, setActiveService] = useState(null);
  const [userRole, setUserType] = useState('');
  const [completedEmergencies, setCompletedEmergencies] = useState([]);

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

    const fetchCompleteEmergencies = async () => {
      try {
        setEmergenciesLoading(true);
        const response = await fetch(`${API_URL}/services/completed-emergencies`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        setCompletedEmergencies(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setEmergenciesLoading(false);
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
    fetchCompleteEmergencies();
  }, [userEmail]);

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  const renderItem = ({ item }) => {
    const isEmergency = item.type === 'emergency';
  
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          if (isEmergency) {
            navigation.navigate("EmergencyChat", {
              userEmail,
              receiverEmail: item.professionalEmail,
              comonUserEmail: item.userEmail,
              quotationId: item.id,
              userType
            });
          } else {
            navigation.navigate("Chat", {
              userEmail,
              receiverEmail: item.professionalEmail,
              comonUserEmail: item.userEmail,
              quotationId: item.id
            });
          }
        }}
      >
        <Text style={styles.title}>{item.category}</Text>
        <Text style={styles.subtitle}>{item.description}</Text>
      </TouchableOpacity>
    );
  };
  

  const combinedCompletedData = [
    ...quotations.completed, 
    ...completedEmergencies
  ];
  
  const data = [
    { title: 'Pendientes', data: quotations.pending },
    { title: 'En proceso', data: quotations.in_progress },
    { title: 'Realizados', data: combinedCompletedData },
    { title: 'Rechazados', data: quotations.rejected }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>
      <FlatList
        data={[
          { key: 'activeService', type: 'activeService' },
          { key: 'pending', type: 'pending', data: quotations.pending },
          { key: 'in_progress', type: 'in_progress', data: quotations.in_progress },
          { key: 'completed', type: 'completed', data: combinedCompletedData },
          { key: 'rejected', type: 'rejected', data: quotations.rejected }
        ]}
        ListHeaderComponent={
          activeService && (
            <View style={styles.activeServiceCard}>
              <Text style={styles.activeServiceTitle}>Solicitud Express Activa</Text>
              <Text style={styles.activeServiceDescription}>{activeService.description}</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigation.navigate("EmergencyChat", {
                  userEmail,
                  receiverEmail: activeService.professional,
                  comonUserEmail: activeService.userEmail,
                  quotationId: activeService.id,
                  userType
                })}
              >
                <Text style={styles.chatButtonText}>Ir al Chat</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (item.type === 'activeService') return null;
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
        ListFooterComponent={<View style={{ height: 80 }} />}
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
      
        <TouchableOpacity style={styles.tabItem}
        onPress={() => {
          if (userRole === 'professional') {
            navigation.navigate('ProfessionalProfile', { userEmail, userType });
          } else {
            navigation.navigate('UserProfile', { userEmail, userType });
          }
        }}>
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
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
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
