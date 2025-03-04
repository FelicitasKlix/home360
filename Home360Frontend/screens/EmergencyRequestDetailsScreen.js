import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

const API_URL = "http://192.168.0.21:8080";

const EmergencyRequestDetailsScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyRequestDetails();
  }, []);

  const fetchEmergencyRequestDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/services/emergency-details/${serviceId}`);
      setDetails(response.data);
    } catch (error) {
      console.error("Error fetching emergency request details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="#4CAF50" />
      </TouchableOpacity>

      {/* Contenido de la pantalla */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : details ? (
        <View>
          <Text style={styles.header}>{details.title}</Text>
          <Text style={styles.text}>{details.description}</Text>
          <Text style={styles.date}>{new Date(details.createdAt).toLocaleString()}</Text>
          <Text style={styles.text}>Ubicación: {details.location}</Text>
          <Text style={styles.text}>Urgencia: {details.urgency}</Text>
          <Text style={styles.text}>Cliente: {details.clientName}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>No se encontraron detalles para esta solicitud.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "black" },
  header: { color: "#4CAF50", fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  text: { color: "white", fontSize: 16, marginBottom: 10 },
  date: { color: "gray", fontSize: 14, marginBottom: 10 },
  errorText: { color: "red", fontSize: 16, textAlign: "center", marginTop: 20 },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 1 },
});

export default EmergencyRequestDetailsScreen;
