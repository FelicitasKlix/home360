import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import TabBar from "../navigation/TabBar";

const API_URL = "http://192.168.0.21:8080";

const ProfessionalHomeScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  console.log("////////////////");
  console.log(userType);
  console.log(userEmail);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null); // Para manejar el estado del botón cuando se acepta una solicitud
  const [userRole, setUserType] = useState('');

  // Obtener solicitudes de emergencia
  const fetchEmergencyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/services/all-emergencies`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect para recargar datos al entrar en la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchEmergencyRequests();
    }, [fetchEmergencyRequests])
  );

  // Función para aceptar un servicio
  const acceptService = async (serviceId) => {
    try {
      setAccepting(serviceId); // Indicar que este botón está en proceso
      const response = await axios.post(`${API_URL}/services/emergency/accept`, {
        serviceId,
        professionalEmail: userEmail, // Se envía el email del profesional que acepta
      });

      if (response.status === 200) {
        Alert.alert("Éxito", "Servicio aceptado correctamente.");
        fetchEmergencyRequests(); // Recargar la lista de servicios
      } else {
        Alert.alert("Error", "No se pudo aceptar el servicio.");
      }
    } catch (error) {
      console.error("Error al aceptar servicio:", error);
      Alert.alert("Error", "Hubo un problema al aceptar el servicio.");
    } finally {
      setAccepting(null); // Resetear el estado del botón
    }
  };

  // Renderizar cada elemento de la lista
  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.serviceTitle}>{item.category}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <Text style={styles.serviceDescription}>
        <Icon name="location-outline" size={16} /> {item.location}
      </Text>
      <Text style={styles.serviceDate}>{new Date(item.created_at).toLocaleDateString()}</Text>

      {/* Botón de Aceptar */}
      <TouchableOpacity 
        style={[styles.acceptButton, accepting === item.id && styles.accepting]} 
        onPress={() => acceptService(item.id)}
        disabled={accepting === item.id}
      >
        <Text style={styles.acceptButtonText}>{accepting === item.id ? "Aceptando..." : "Aceptar"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenid@!</Text>
        <Text style={styles.subtitle}>Solicitudes de servicios express</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList 
            data={requests} 
            renderItem={renderItem} 
            keyExtractor={(item) => item.id.toString()} 
            style={styles.flatList}
          />
        )}
      </View>
      
      {/* Menú inferior */}
      <View style={styles.tabBar}>
            <TouchableOpacity 
                    style={styles.tabItem} 
                    onPress={() => navigation.navigate('ProfessionalHome', {userEmail, userType })}>
                    <Icon name="home-outline" size={24} color="white" />
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>
              <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Solicitudes', { userEmail, userType })}>
                <Icon name="construct-outline" size={24} color="white" />
                <Text style={styles.tabText}>Solicitudes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.tabItem}>
                <Icon name="person-outline" size={24} color="white" />
                <Text style={styles.tabText}>Perfil</Text>
              </TouchableOpacity>
            </View>

    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "black",
  },
  flatList: {
    marginBottom: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10
  },
  title: {
    fontSize: 44,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 80,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Rethink Sans ExtraBold",
    color: "#EBEBEB",
    marginBottom: 20,
    textAlign: "center",
  },
  requestItem: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceTitle: {
    color: "#008A45",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  serviceDescription: {
    color: "#EBEBEB",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  serviceDate: {
    color: "gray",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "right",
  },
  tabItem: {
    alignItems: "center",
  },
  tabText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#008A45",
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: "space-around",
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  accepting: {
    backgroundColor: "#a5d6a7",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfessionalHomeScreen;

