import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, Modal } from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

export const API_URL = "http://192.168.0.19:8080";
export const WS_URL = "ws://192.168.0.19:8080";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const EmergencyChatScreen = ({ route, navigation }) => {
  const { userEmail, receiverEmail, comonUserEmail, quotationId, userType } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isServiceCompleted, setIsServiceCompleted] = useState(false);
  const [userMarkedCompleted, setUserMarkedCompleted] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [professionalRating, setProfessionalRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [professionalReview, setProfessionalReview] = useState("");
  const [receiverDeviceToken, setReceiverDeviceToken] = useState("");
  const ws = useRef(null);

  const connectWebSocket = () => {
      // Cerrar conexión existente si la hay
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      
      // Crear nueva conexión
      ws.current = new WebSocket(`${WS_URL}/ws/${userEmail}`);
      
      ws.current.onopen = () => {
        console.log('WebSocket conectado');
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Mensaje recibido:', data);
        
        // Solo procesar mensajes para esta conversación
        if (data.quotation_id === quotationId) {
          if ((data.sender === receiverEmail && data.receiver === userEmail) || 
              (data.sender === comonUserEmail && data.receiver === userEmail)) {
            setMessages(prevMessages => [...prevMessages, {
              message: data.message,
              sender: data.sender,
              timestamp: data.timestamp
            }]);
          }
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('Error de WebSocket:', error);
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket desconectado');
      };
    };
    
    // Conectar WebSocket al montar el componente
    useEffect(() => {
      connectWebSocket();
      
      // Configurar un ping periódico para mantener viva la conexión
      const pingInterval = setInterval(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Cada 30 segundos
      
      // Limpiar al desmontar
      return () => {
        clearInterval(pingInterval);
        if (ws.current) {
          ws.current.close();
        }
      };
    }, [userEmail]);
  

  useEffect(() => {
    fetchMessages();
    checkServiceStatus();
    fetchReceiverDeviceToken(); 
  }, []);

  const fetchMessages = async () => {
    try {
      let response;
      if(userEmail !== receiverEmail) {
        response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${receiverEmail}?emergency_service_id=${quotationId}`);
      } else {
        response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${comonUserEmail}?emergency_service_id=${quotationId}`);
      }  
      
      // Add unique IDs to messages
      const messagesWithIds = response.data.messages.map(msg => ({
        ...msg,
        id: `${msg.sender}-${msg.timestamp}`
      }));
      
      setMessages(messagesWithIds);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "No se pudieron cargar los mensajes");
    }
  };

  const fetchReceiverDeviceToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/get-device-token/${receiverEmail}`);
      setReceiverDeviceToken(response.data);
    } catch (error) {
      console.error("Error fetching receiver's device token:", error);
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
      const timestamp = new Date().toISOString();
      
      // Message object
      const messageData = {
        message: messageText,
        sender: userEmail,
        receiver: receiverEmail,
        emergency_service_id: quotationId,
        timestamp: new Date().toISOString()
      };
      
      // Save to database
      await axios.post(`${API_URL}/chat/emergency/send`, messageData);
      
      // Add to UI with unique ID
      // Añadir a la interfaz
      setMessages([...messages, { 
        message: messageText, 
        sender: userEmail, 
        timestamp: timestamp 
      }]);
      
      // Send via WebSocket if connected
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }
      
      setMessageText("");
      
      // Send push notification if necessary
      if (receiverDeviceToken) {
        sendPushNotification();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  const sendPushNotification = async () => {
    try {
      const targetEmail = userEmail !== receiverEmail ? receiverEmail : comonUserEmail;
      const response = await fetch(`${API_URL}/users/send-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: targetEmail, message: messageText })
      });
      await response.json();
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const markAsCompleted = async () => {
    try {
      await fetch(`${API_URL}/services/completed-service/${quotationId}/${userType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      Alert.alert("Éxito", "Trabajo marcado como finalizado");
      checkServiceStatus();
    } catch (error) {
      console.error("Error marking emergency service as completed:", error);
      Alert.alert("Error", "No se pudo marcar el trabajo como finalizado");
    }
  };

  const handleSubmitReview = async () => {
    try {
      const reviewData = {
        service_id: quotationId,
      };
  
      if (userType === "user") {
        reviewData.review_for_professional = professionalReview;
        reviewData.points_for_professional = professionalRating;
      } else if (userType === "professional") {
        reviewData.review_for_user = userReview;
        reviewData.points_for_user = userRating;
      }
  
      await axios.post(`${API_URL}/services/review`, reviewData);
      Alert.alert("Éxito", "Reseña enviada correctamente");
      setReviewModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "No se pudo enviar la reseña");
    }
  };
  
  const StarRating = ({ rating, onChange }) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Icon
              name={star <= rating ? "star" : "star-outline"}
              size={30}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
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

        {isServiceCompleted && !userMarkedCompleted && (
          <TouchableOpacity 
            style={styles.reviewButton} 
            onPress={() => setReviewModalVisible(true)}
          >
            <Text style={styles.reviewButtonText}>Dejar una reseña</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id || `${item.sender}-${item.timestamp}`}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dejar una reseña</Text>

            {/* If user, only show review for professional */}
            {userType === "user" && (
              <>
                <Text style={styles.inputLabel}>Puntuación para el profesional:</Text>
                <StarRating rating={professionalRating} onChange={setProfessionalRating} />

                <Text style={styles.inputLabel}>Comentario para el profesional:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Escribe un comentario..."
                  value={professionalReview}
                  onChangeText={setProfessionalReview}
                  multiline={true}
                />
              </>
            )}

            {/* If professional, only show review for user */}
            {userType === "professional" && (
              <>
                <Text style={styles.inputLabel}>Puntuación para el usuario:</Text>
                <StarRating rating={userRating} onChange={setUserRating} />

                <Text style={styles.inputLabel}>Comentario para el usuario:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Escribe un comentario..."
                  value={userReview}
                  onChangeText={setUserReview}
                  multiline={true}
                />
              </>
            )}

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: '100%', 
    marginBottom: 20 
  },
  completeButtonText: { fontSize: 16, color: "white", fontWeight: "bold" },
  reviewButton: { backgroundColor: "#008A45", padding: 10, borderRadius: 10, alignItems: "center", marginBottom: 10, width: '100%' },
  reviewButtonText: {
    fontSize: 16, 
    color: "white", 
    fontWeight: "bold"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center"
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  inputLabel: { fontSize: 14, marginBottom: 5 },
  modalInput: { 
    height: 100, 
    width: "100%", 
    borderColor: "#ccc", 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  modalButtonsContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalCancelButton: { 
    backgroundColor: "#f44336", 
    padding: 10, 
    borderRadius: 8, 
    width: "48%" 
  },
  modalSubmitButton: { 
    backgroundColor: "#4CAF50", 
    padding: 10, 
    borderRadius: 8, 
    width: "48%" 
  },
  modalButtonText: { color: "white", fontSize: 16, textAlign: "center" }
  
});

export default EmergencyChatScreen;
