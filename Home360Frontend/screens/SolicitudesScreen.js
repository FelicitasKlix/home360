import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

const SolicitudesScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const API_URL = "http://192.168.0.19:8080";
  const [quotations, setQuotations] = useState({ pending: [], completed: [], rejected: [], in_progress: [] });
  const [loading, setLoading] = useState(true);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const [activeService, setActiveService] = useState(null);
  const [userRole, setUserType] = useState('');
  const [completedEmergencies, setCompletedEmergencies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch quotations
      const quotationsResponse = await fetch(`${API_URL}/quotation/${userEmail}`);
      if (!quotationsResponse.ok) {
        throw new Error('Error en la respuesta del servidor al obtener cotizaciones');
      }
      const quotationsData = await quotationsResponse.json();
      setQuotations(quotationsData);
      
      // Fetch completed emergencies
      const emergenciesResponse = await fetch(`${API_URL}/services/completed-emergencies`);
      if (!emergenciesResponse.ok) {
        throw new Error('Error en la respuesta del servidor al obtener emergencias completadas');
      }
      const emergenciesData = await emergenciesResponse.json();
      setCompletedEmergencies(emergenciesData);
      
      // Fetch active service
      const activeServiceResponse = await fetch(`${API_URL}/services/emergency/active/${userEmail}`);
      const activeServiceData = await activeServiceResponse.json();
      if (activeServiceData.activeService) {
        setActiveService(activeServiceData.activeService);
      } else {
        setActiveService(null);
      }
      
      // Fetch user type
      const userTypeResponse = await fetch(`${API_URL}/users/user-type/${userEmail}`);
      const userTypeData = await userTypeResponse.json();
      if (userTypeData && userTypeData.type) {
        setUserType(userTypeData.type);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos. Intente nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008A45" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </SafeAreaView>
    );
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

  const EmptyListMessage = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>No hay solicitudes en esta sección</Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Solicitudes</Text>
        <TouchableOpacity 
          style={styles.headerRefreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Icon 
            name={refreshing ? "sync" : "refresh-outline"} 
            size={24} 
            color="white" 
            style={refreshing ? styles.refreshingIcon : null}
          />
        </TouchableOpacity>
      </View>
      
      {refreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color="#008A45" />
          <Text style={styles.refreshingText}>Actualizando...</Text>
        </View>
      )}

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
                ListEmptyComponent={EmptyListMessage}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
    position: 'relative'
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center'
  },
  headerRefreshButton: {
    position: 'absolute',
    right: 20,
    padding: 8,
    backgroundColor: '#008A45',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    backgroundColor: '#008A45',
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
  flatList: { width: '90%', alignSelf: 'center' },
  refreshingIcon: {
    transform: [{ rotate: '45deg' }]
  },
  refreshingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 'auto',
    alignSelf: 'center',
    marginTop: 10,
  },
  refreshingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",

  },
  emptyListText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5
  }
});

export default SolicitudesScreen;