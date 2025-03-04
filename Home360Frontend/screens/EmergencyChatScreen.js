import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert } from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = "http://192.168.0.21:8080";

const EmergencyChatScreen = ({ route, navigation }) => {
  const { userEmail, receiverEmail, comonUserEmail, quotationId, userType } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isServiceCompleted, setIsServiceCompleted] = useState(false);
  const [userMarkedCompleted, setUserMarkedCompleted] = useState(false);

  useEffect(() => {
    fetchMessages();
    checkServiceStatus();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${receiverEmail}?emergency_service_id=${quotationId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching emergency chat messages:", error);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/services/status/${quotationId}`);
      setIsServiceCompleted(response.data.completed);
      setUserMarkedCompleted(response.data.markedBy.includes(userEmail));
    } catch (error) {
      console.error("Error checking emergency service status:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const messageData = {
        message: messageText,
        sender: userEmail,
        receiver: receiverEmail,
        emergency_service_id: quotationId,
        timestamp: new Date().toISOString()
      };

      await axios.post(`${API_URL}/chat/emergency/send`, messageData);
      setMessageText("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending emergency message:", error);
    }
  };

  const markAsCompleted = async () => {
    try {
        const response = await fetch(`${API_URL}/services/completed-service/${quotationId}/${userType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
      Alert.alert("Trabajo marcado como finalizado");
      checkServiceStatus();
    } catch (error) {
      console.error("Error marking emergency service as completed:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => {
          navigation.setParams({ userEmail, userType });
          navigation.goBack();
        }}
      >
        <Icon name="arrow-back" size={30} color="#4CAF50" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Chat de Emergencia</Text>
        {!isServiceCompleted && !userMarkedCompleted && (
          <TouchableOpacity style={styles.completeButton} onPress={markAsCompleted}>
            <Text style={styles.completeButtonText}>Marcar como trabajo finalizado</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === userEmail ? styles.sent : styles.received]}>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
          )}
        />

        

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "black", paddingTop: 10 },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: 'white', marginTop: 60 },
  messageBubble: { padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: "80%" },
  sent: { alignSelf: "flex-end", backgroundColor: "#008A45" },
  received: { alignSelf: "flex-start", backgroundColor: "#444" },
  messageText: { color: "white", fontSize: 16 },
  timestamp: { fontSize: 12, color: "#ccc", marginTop: 5, textAlign: "right" },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "black" },
  input: { flex: 1, backgroundColor: "white", padding: 10, borderRadius: 20 },
  sendButton: { marginLeft: 10, backgroundColor: "#008A45", padding: 10, borderRadius: 20 },
  sendButtonText: { color: "white", fontSize: 16 },
  backButton: { position: 'absolute', marginTop: 20, marginLeft: 10, top: 20, left: 20, zIndex: 1 },
  completeButton: {
    backgroundColor: "#28a745",  // Verde para indicar que está finalizado
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: '100%', 
    marginBottom: 20 
  },
  completeButtonText: { fontSize: 16, color: "white", fontWeight: "bold" }
});

export default EmergencyChatScreen;
