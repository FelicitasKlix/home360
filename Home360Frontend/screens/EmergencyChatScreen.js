import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, Modal } from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

const API_URL = "http://192.168.0.21:8080";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const EmergencyChatScreen = ({ route, navigation }) => {
  const { userEmail, receiverEmail, comonUserEmail, quotationId, userType } = route.params;
  console.log("Received quotationId:", quotationId); 
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

  useEffect(() => {
    fetchMessages();
    checkServiceStatus();
    fetchReceiverDeviceToken(); 
  }, []);

  const fetchMessages2 = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${receiverEmail}?emergency_service_id=${quotationId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching emergency chat messages:", error);
    }
  };
  const fetchMessages = async () => {
    try {
      if(userEmail != receiverEmail){
        //const response = await axios.get(`${API_URL}/chat/${userEmail}/${receiverEmail}`);
        const response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${receiverEmail}?emergency_service_id=${quotationId}`);
        //console.log(response.data.messages);
        setMessages(response.data.messages);
      }
      if(userEmail == receiverEmail){
        //const response = await axios.get(`${API_URL}/chat/${userEmail}/${comonUserEmail}`);
        const response = await axios.get(`${API_URL}/chat/emergency/${userEmail}/${comonUserEmail}?emergency_service_id=${quotationId}`);
        setMessages(response.data.messages);
      }  
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchReceiverDeviceToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/get-device-token/${receiverEmail}`);
      setReceiverDeviceToken(response.data); // Guardamos el token del receptor
      
    } catch (error) {
      console.error("Error fetching receiver's device token:", error);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/services/status/${quotationId}`);
      setIsServiceCompleted(response.data.completed);
      console.log(response.data);
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
      if (receiverDeviceToken) {
        //sendPushNotification(receiverDeviceToken, 'Nuevo mensaje en el chat de emergencia', messageText);
        console.log(receiverEmail);
        sendPushNotification(receiverEmail, messageText);
      }
    } catch (error) {
      console.error("Error sending emergency message:", error);
    }
  };

  const sendPushNotification2 = async (deviceToken, title, body) => {
    const message = {
      to: deviceToken,
      title: title,
      body: body,
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      console.log('Notificación enviada:', response);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  };

  const sendPushNotification = async () => {
      try {
        //console.log(JSON.stringify({ userEmail: receiverEmail, message: messageText }));
        if(userEmail != receiverEmail){
        const response = await fetch(`${API_URL}/users/send-notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: receiverEmail, message: messageText })
        });
        const data = await response.json();
      }
      if(userEmail == receiverEmail){
        const response = await fetch(`${API_URL}/users/send-notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: comonUserEmail, message: messageText })
        });
        const data = await response.json();
      }

        //const data = await response.json();
        
      } catch (error) {
        Alert.alert("Error", "Hubo un problema al enviar la notificación");
        console.error(error);
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
      Alert.alert("Reseña enviada");
      setReviewModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
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

      <Modal
  animationType="slide"
  transparent={true}
  visible={reviewModalVisible}
  onRequestClose={() => setReviewModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Dejar una reseña</Text>

      {/* Si es un usuario, solo muestra la reseña al profesional */}
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

      {/* Si es un profesional, solo muestra la reseña al usuario */}
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
    backgroundColor: "#28a745",  // Verde para indicar que está finalizado
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
