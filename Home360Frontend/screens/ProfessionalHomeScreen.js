/*import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfessionalHomeScreen({ route, navigation }) {
  const {userEmail, userType} = route.params;
  console.log(userEmail);
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>Sos profesionalllll</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CotizarTrabajos', { userEmail: userEmail})}>
        <Text style={styles.buttonText}>Cotizar Trabajos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ServicioExpress')}>
        <Text style={styles.outlineButtonText}>Servicio Express</Text>
      </TouchableOpacity>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', width:'100%'},
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 10, height:'20%', justifyContent: 'center', marginTop:20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButton: { borderWidth: 2, borderColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', height:'20%', justifyContent: 'center', marginTop:20 },
  outlineButtonText: { color: '#008A45', fontSize: 16, fontWeight: 'bold' },
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
*/










import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.0.11:8080";

const ProfessionalHomeScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  console.log(userEmail);
  console.log(userType);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memorizar la función para evitar recreaciones innecesarias
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

  // useFocusEffect con la función memorizada
  useFocusEffect(
    useCallback(() => {
      fetchEmergencyRequests();
    }, [fetchEmergencyRequests])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => navigation.navigate("EmergencyRequestDetails", { serviceId: item.id })}
    >
      <Text style={styles.serviceTitle}>{item.category}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <Text style={styles.serviceDescription}>
        <Icon name="location-outline" size={16} /> {item.location}
      </Text>
      <Text style={styles.serviceDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("ProfessionalHome", { userEmail, userType })}>
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Solicitudes", { userEmail })}>
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
    marginBottom: 40,
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
    marginTop: 5,
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
});

export default ProfessionalHomeScreen;

