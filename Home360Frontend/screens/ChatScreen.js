import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  Alert
} from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from "expo-notifications";

const API_URL = "http://192.168.0.21:8080";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ChatScreen = ({ route, navigation }) => {
  const { userEmail, receiverEmail, quotationId, comonUserEmail } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [quotationData, setQuotationData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [professionalRating, setProfessionalRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [professionalReview, setProfessionalReview] = useState("");
  const [receiverDeviceToken, setReceiverDeviceToken] = useState("");
  

  useEffect(() => {
    fetchMessages();
    fetchReceiverName();
    fetchUserType();
    fetchQuotation();
    fetchReceiverDeviceToken();
  }, [quotationId]);

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

  const fetchReceiverDeviceToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/get-device-token/${receiverEmail}`);
      setReceiverDeviceToken(response.data);
      
    } catch (error) {
      console.error("Error fetching receiver's device token:", error);
    }
  };

  const fetchQuotation = async () => {
    if (!quotationId) return;
    
    try {
      const response = await axios.get(`${API_URL}/quotation/details/${quotationId}`);
      if (response.data) {
        setQuotationData(response.data);
      }
    } catch (error) {
      console.error("Error fetching quotation details:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      if(userEmail != receiverEmail){
        const response = await axios.get(`${API_URL}/chat/${userEmail}/${receiverEmail}?quotation_id=${quotationId}`);
        setMessages(response.data.messages);
      }
      if(userEmail == receiverEmail){
        const response = await axios.get(`${API_URL}/chat/${userEmail}/${comonUserEmail}?quotation_id=${quotationId}`);
        setMessages(response.data.messages);
      }  
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchReceiverName = async () => {
    try {
      if(userEmail != receiverEmail){
        const response = await axios.get(`${API_URL}/users/user-info/${receiverEmail}`);
        setReceiverName(response.data);
      }
      if(userEmail == receiverEmail){
        const response = await axios.get(`${API_URL}/users/user-info/${comonUserEmail}`);
        setReceiverName(response.data);
      }
    } catch (error) {
      console.error("Error fetching receiver name:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API_URL}/chat/send`, {
        message: newMessage,
        sender: userEmail,
        receiver: receiverEmail,
        quotation_id: quotationId,
      });

      setMessages([...messages, { message: newMessage, sender: userEmail, timestamp: new Date().toISOString() }]);
      setNewMessage("");
      if (receiverDeviceToken) {
        sendPushNotification(receiverEmail, newMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendPushNotification = async () => {
      try {
        if(userEmail != receiverEmail){
        const response = await fetch(`${API_URL}/users/send-notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: receiverEmail, message: newMessage })
        });
        const data = await response.json();
      }
      if(userEmail == receiverEmail){
        const response = await fetch(`${API_URL}/users/send-notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: comonUserEmail, message: newMessage })
        });
        const data = await response.json();
      }
        
      } catch (error) {
        Alert.alert("Error", "Hubo un problema al enviar la notificación");
        console.error(error);
      }
    };

  const openEditModal = () => {
    setDescription(quotationData.quotation[0].descripcion);
    setAmount(quotationData.quotation[0].monto.toString());
    setEditModalVisible(true);
};

const handleUpdateQuotation = async () => {
  try {
      const updatedDescription = description.trim() !== "" ? description : quotationData.quotation[0].descripcion;
      const updatedAmount = amount.trim() !== "" ? parseFloat(amount) : quotationData.quotation[0].monto;

      await axios.post(`${API_URL}/quotation/update/${quotationId}`, {
          quotation: [
              {
                  descripcion: updatedDescription,
                  monto: updatedAmount
              }
          ]
      });

      setEditModalVisible(false);
      fetchQuotation();
  } catch (error) {
      console.error("Error updating quotation:", error);
  }
};

  const handleGenerateQuote = () => {
    setModalVisible(true);
  };

  const handleSubmitReview2 = async () => {
    try {
      await axios.post(`${API_URL}/quotation/review`, {
        quotation_id: quotationId,
        review_for_user: userReview,
        points_for_user: userRating,
        review_for_professional: professionalReview,
        points_for_professional: professionalRating,
      });
      Alert.alert("Reseña enviada");
      setReviewModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const reviewData = {
        quotation_id: quotationId,
      };

      if (userType === "user") {
        reviewData.review_for_professional = professionalReview;
        reviewData.points_for_professional = professionalRating;
      } else if (userType === "professional") {
        reviewData.review_for_user = userReview;
        reviewData.points_for_user = userRating;
      }

      await axios.post(`${API_URL}/quotation/review`, reviewData);
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
  

  const submitQuote = async () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/quotation/update/${quotationId}`, {
        quotation: [
          {
            descripcion: description,
            monto: parseFloat(amount)
          }
        ]
      });

      await axios.post(`${API_URL}/chat/send`, {
        message: "QUOTATION_SUBMITTED",
        sender: userEmail,
        receiver: receiverEmail,
        quotation_id: quotationId,
      });

      Alert.alert(
        "Éxito", 
        "El presupuesto ha sido enviado correctamente",
        [
          { text: "OK", onPress: () => setModalVisible(false) }
        ]
      );
      
      setDescription("");
      setAmount("");
      
      fetchMessages();
      fetchQuotation();
    } catch (error) {
      console.error("Error sending quote:", error);
      Alert.alert("Error", "No se pudo enviar el presupuesto");
    }
  };

  const handleAcceptQuotation = async () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro que deseas aceptar este presupuesto?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/quotation/accept/${quotationId}`);
              
              await axios.post(`${API_URL}/chat/send`, {
                message: "QUOTATION_ACCEPTED",
                sender: userEmail,
                receiver: receiverEmail,
                quotation_id: quotationId,
              });
              
              Alert.alert("Éxito", "Presupuesto aceptado correctamente");
              fetchMessages();
              fetchQuotation();
            } catch (error) {
              console.error("Error accepting quotation:", error);
              Alert.alert("Error", "No se pudo aceptar el presupuesto");
            }
          }
        }
      ]
    );
  };

  const handleRejectQuotation = async () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro que deseas rechazar este presupuesto?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Rechazar",
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/quotation/reject/${quotationId}`);
              
              await axios.post(`${API_URL}/chat/send`, {
                message: "QUOTATION_REJECTED",
                sender: userEmail,
                receiver: receiverEmail,
                quotation_id: quotationId,
              });
              
              Alert.alert("Éxito", "Presupuesto rechazado correctamente");
              fetchMessages();
              fetchQuotation();
            } catch (error) {
              console.error("Error rejecting quotation:", error);
              Alert.alert("Error", "No se pudo rechazar el presupuesto");
            }
          }
        }
      ]
    );
  };

  const handleDeclineRequest = async () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro que deseas rechazar esta solicitud?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Rechazar",
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/quotation/reject/${quotationId}`);
              Alert.alert("Éxito", "Solicitud rechazada correctamente");
              navigation.setParams({ userEmail, userType });
              navigation.goBack();
            } catch (error) {
              console.error("Error rejecting request:", error);
              Alert.alert("Error", "No se pudo rechazar la solicitud");
            }
          }
        }
      ]
    );
  };

  const handleCancelRequest = async () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro que deseas cancelar esta solicitud?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Sí, cancelar",
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/quotation/cancel/${quotationId}`);
              Alert.alert("Éxito", "Solicitud cancelada correctamente");
              navigation.setParams({ userEmail, userType });
              navigation.goBack();
            } catch (error) {
              console.error("Error canceling request:", error);
              Alert.alert("Error", "No se pudo cancelar la solicitud");
            }
          }
        }
      ]
    );
  };


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0'); // dd
    const month = String(date.getMonth() + 1).padStart(2, '0'); // mm
    const year = date.getFullYear(); // yyyy
    const hours = String(date.getHours()).padStart(2, '0'); // hh
    const minutes = String(date.getMinutes()).padStart(2, '0'); // mm
  
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };
  const renderItem = ({ item }) => {
    if (item.message === "QUOTATION_SUBMITTED" || 
        item.message === "QUOTATION_ACCEPTED" || 
        item.message === "QUOTATION_REJECTED") {
      
      let statusMessage = "";
      switch(item.message) {
        case "QUOTATION_SUBMITTED":
          statusMessage = "El profesional ha enviado un presupuesto";
          break;
        case "QUOTATION_ACCEPTED":
          statusMessage = "El presupuesto ha sido aceptado";
          break;
        case "QUOTATION_REJECTED":
          statusMessage = "El presupuesto ha sido rechazado";
          break;
      }
      
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{statusMessage}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.messageContainer, item.sender === userEmail ? styles.sentMessage : styles.receivedMessage]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    );
  };

  const handleCompleteWork = async () => {
    try {
        const response = await fetch(`/quotation/completed/${serviceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al completar el trabajo");
        }

        alert("Trabajo marcado como finalizado");
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al completar el trabajo");
    }
};

const handleCompleteWork2 = async () => {
  try {
      const response = await fetch(`${API_URL}/quotation/completed-quotation/${quotationId}/${userType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Error al completar el trabajo");

      const data = await response.json();
      alert(`Estado actualizado a ${data.message}`);
  } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al completar el trabajo");
  }
};


const renderQuotationCard = () => {
  if (!quotationData || !quotationData.quotation) return null;

  const { status } = quotationData;
  const { descripcion, monto } = quotationData.quotation[0];


  return (
      <View style={styles.quotationCard}>
          <Text style={styles.quotationTitle}>
              {userType === "professional" ? "Presupuesto Enviado" : "Presupuesto Recibido"}
          </Text>

          <View style={styles.quotationDetails}>
              <Text style={styles.quotationLabel}>Descripción:</Text>
              <Text style={styles.quotationValue}>{descripcion}</Text>

              <Text style={styles.quotationLabel}>Monto Final:</Text>
              <Text style={styles.quotationValue}>${monto.toFixed(2)}</Text>
          </View>

          {/* Botones Aceptar y Rechazar (solo usuario) */}
          {status === "pending" && userType === "user" && (
              <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptQuotation}>
                      <Text style={styles.buttonText}>Aceptar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.rejectButton} onPress={handleRejectQuotation}>
                      <Text style={styles.buttonText}>Rechazar</Text>
                  </TouchableOpacity>
              </View>
          )}

          {/* Botón para Modificar Cotización (solo profesional) */}
          {status === "pending" && userType === "professional" && (
              <TouchableOpacity style={styles.modifyButton} onPress={openEditModal}>
                  <Text style={styles.buttonText}>Modificar</Text>
              </TouchableOpacity>
          )}

          {/* Botón para marcar "Trabajo en curso" (solo profesional) */}
          {status === "in progress" && userType === "professional" && (
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteWork2}>
                  <Text style={styles.buttonText}>Trabajo Finalizado</Text>
              </TouchableOpacity>
          )}

          {/* Botón para marcar "Trabajo Finalizado" (usuario y profesional) */}
          {status === "pending_confirmation" && userType === "user" && (
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteWork2}>
                  <Text style={styles.buttonText}>Confirmar Finalización</Text>
              </TouchableOpacity>
          )}

          {/* Estado "Completado" (sin botones) */}
          {status === "completed" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="checkbox-outline" size={20} color="#008A45" style={{ marginRight: 8 }} />
              <Text style={styles.quotationCompleted}>Trabajo Completado</Text>
            </View>
          )}
      </View>
  );
};



const renderEditQuotationModal = () => (
  <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
  >
      <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modificar Presupuesto</Text>

              <Text style={styles.inputLabel}>Descripción del trabajo:</Text>
              <TextInput
                  style={styles.modalInput}
                  placeholder="Ingrese descripción detallada"
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Monto final:</Text>
              <TextInput
                  style={styles.modalInput}
                  placeholder="Ingrese monto en números"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
              />

              <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => setEditModalVisible(false)}
                  >
                      <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.modalSubmitButton}
                      onPress={handleUpdateQuotation}
                  >
                      <Text style={styles.modalButtonText}>Actualizar</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </View>
  </Modal>
);


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

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Nombre del usuario con el que se está chateando */}
        <View style={styles.header}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.headerText}>{receiverName || "Usuario"}</Text>
          )}
        </View>

        {/* Botones de acción solo si la solicitud está en estado "pending" */}
        {quotationId && quotationData?.status === "pending" && (
          <View style={styles.actionButtonsContainer}>
            {userType === "professional" ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.quoteButton]} 
                  onPress={handleGenerateQuote}
                >
                  <Text style={styles.actionButtonText}>Generar presupuesto</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.declineButton]} 
                  onPress={handleDeclineRequest}
                >
                  <Text style={styles.actionButtonText}>Declinar solicitud</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleCancelRequest}
              >
                <Text style={styles.actionButtonText}>Cancelar solicitud</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Botón de dejar una reseña */}
        {quotationData && quotationData.status === "completed" && (
          <View style={styles.actionButtonsContainer}>
            {userType === "user" && !quotationData.review?.review_for_professional && (
              <TouchableOpacity 
                style={styles.reviewButton} 
                onPress={() => setReviewModalVisible(true)}
              >
                <Text style={styles.reviewButtonText}>Dejar una reseña</Text>
              </TouchableOpacity>
            )}

            {userType === "professional" && !quotationData.review?.review_for_user && (
              <TouchableOpacity 
                style={styles.reviewButton} 
                onPress={() => setReviewModalVisible(true)}
              >
                <Text style={styles.reviewButtonText}>Dejar una reseña</Text>
              </TouchableOpacity>
            )}
          </View>
        )}


        {/* Quotation Card */}
        {renderQuotationCard()}

          {/* Quotation Modal */}
          {renderEditQuotationModal()}

          {/* Lista de mensajes */}
          <FlatList 
            data={messages} 
            renderItem={renderItem} 
            keyExtractor={(item, index) => index.toString()} 
            style={styles.messagesList}
          />
          
          {/* Input para escribir mensajes */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => {
                if (userType === 'professional') {
                  navigation.navigate('ProfessionalHome', { userEmail, userType });
                } else {
                  navigation.navigate('Home', { userEmail, userType });
                }
              }}
            >
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Solicitudes', {userEmail, userType})}>
          <Icon name="construct-outline" size={24} color="white" />
          <Text style={styles.tabText}>Solicitudes</Text>
        </TouchableOpacity>
       
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para generar presupuesto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generar Presupuesto</Text>
            
            <Text style={styles.inputLabel}>Descripción del trabajo:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingrese descripción detallada"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Monto final:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingrese monto en números"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={submitQuote}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Reseña */}
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
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: "black", 
    paddingTop: 40 
  },
  header: { 
    padding: 15, 
    backgroundColor: "white", 
    alignItems: "center", 
    borderRadius: 10, 
    marginBottom: 10 
  },
  headerText: { 
    color: "#008A45", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  quoteButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: { 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 10, 
    maxWidth: "80%" 
  },
  sentMessage: { 
    backgroundColor: "#008A45", 
    alignSelf: "flex-end" 
  },
  receivedMessage: { 
    backgroundColor: "#444", 
    alignSelf: "flex-start" 
  },
  systemMessageContainer: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
    maxWidth: "90%"
  },
  systemMessageText: {
    color: "#FFF",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center"
  },
  messageText: { 
    color: "white", 
    fontSize: 16 
  },
  timestamp: { 
    fontSize: 12, 
    color: "rgba(255, 255, 255, 0.7)", 
    marginTop: 5, 
    textAlign: "right" 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 10, 
    backgroundColor: "black" 
  },
  input: { 
    flex: 1, 
    backgroundColor: "white", 
    padding: 10, 
    borderRadius: 20 
  },
  sendButton: { 
    marginLeft: 10, 
    backgroundColor: "#008A45", 
    padding: 10, 
    borderRadius: 20 
  },
  sendButtonText: { 
    color: "white", 
    fontSize: 16 
  },
  quotationCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#008A45"
  },
  quotationTitle: {
    color: "#008A45",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },
  quotationCompleted: {
    color: "#008A45",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },
  quotationDetails: {
    marginBottom: 15
  },
  quotationLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },
  quotationValue: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
    paddingLeft: 10
  },
  quotationActions: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  quotationButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5
  },
  acceptButton: {
    backgroundColor: "#4CAF50"
  },
  rejectButton: {
    backgroundColor: "#F44336"
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  },
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
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    marginTop: 20,
    marginLeft: 10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008A45',
    marginBottom: 20,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalCancelButton: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalSubmitButton: {
    backgroundColor: '#008A45',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modifyButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom:10
},
completeButton: {
  backgroundColor: "#28a745",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  width: '100%',  
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

acceptButton: {
  backgroundColor: '#4CAF50',
  padding: 10,
  borderRadius: 5,
  flex: 1,
  marginRight: 10,
  alignItems: 'center',
},

rejectButton: {
  backgroundColor: '#F44336',
  padding: 10,
  borderRadius: 5,
  flex: 1,
  alignItems: 'center',
},
buttonText: {
  color: 'white',
  fontSize: 14,
  fontWeight: 'bold',
  justifyContent: 'center'
},
reviewButton: { backgroundColor: "#008A45", padding: 10, borderRadius: 10, alignItems: "center", marginBottom: 10, width: '100%' },
reviewButtonText: {color: 'white'}
});

export default ChatScreen;