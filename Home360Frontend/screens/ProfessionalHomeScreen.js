import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import TabBar from "../navigation/TabBar";
import * as Notifications from 'expo-notifications';

const API_URL = "http://192.168.0.21:8080";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ProfessionalHomeScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [userRole, setUserType] = useState('');
  const [receiverEmail, setReceiverEmail] = useState("");
  const [serviceId, setServiceId] = useState("");

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

  useFocusEffect(
    useCallback(() => {
      fetchEmergencyRequests();
    }, [fetchEmergencyRequests])
  );

  const acceptService = async (serviceId) => {
    try {
      setAccepting(serviceId);
      setServiceId(serviceId);
      const response = await axios.post(`${API_URL}/services/emergency/accept`, {
        serviceId,
        professionalEmail: userEmail,
      });

      if (response.status === 200) {
        Alert.alert("Éxito", "Servicio aceptado correctamente.");
        fetchEmergencyRequests();
      } else {
        Alert.alert("Error", "No se pudo aceptar el servicio.");
      }
      //const emailResponse = await axios.get(`${API_URL}/services/get-user/${serviceId}`);
      //console.log(emailResponse);
      //setReceiverEmail(emailResponse.data);
      sendPushNotification();
    } catch (error) {
      console.error("Error al aceptar servicio:", error);
      Alert.alert("Error", "Hubo un problema al aceptar el servicio.");
    } finally {
      setAccepting(null);
    }
  };

  const sendPushNotification = async () => {
    try {
      const emailResponse = await axios.get(`${API_URL}/services/get-user/${serviceId}`);
      const response = await fetch(`${API_URL}/users/send-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: emailResponse.data, message: "Solicitud de emergencia aceptada! Un profesional se está dirigiendo hacia ti!" })
      });
      const data = await response.json();
      
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al enviar la notificación");
      console.error(error);
    }
  };

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

