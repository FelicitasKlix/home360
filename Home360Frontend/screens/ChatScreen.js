import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';

//const API_URL = "http://192.168.0.16:8080";  // Tu backend
const API_URL = "http://192.168.0.11:8080";

const ChatScreen = ({ route, navigation }) => {
  const { userEmail, receiverEmail, quotationId, comonUserEmail } = route.params;
  console.log(comonUserEmail);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    fetchReceiverName();
  }, []);

  const fetchMessages = async () => {
    try {
      if(userEmail != receiverEmail){
        const response = await axios.get(`${API_URL}/chat/${userEmail}/${receiverEmail}`);
        setMessages(response.data.messages);
      }
      if(userEmail == receiverEmail){
        const response = await axios.get(`${API_URL}/chat/${userEmail}/${comonUserEmail}`);
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
      //console.log(response.data)
       // Ajusta esto según la estructura de la respuesta
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
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === userEmail ? styles.sentMessage : styles.receivedMessage]}>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        //onPress={() => navigation.goBack()}
        onPress={() => {
          navigation.setParams({ userEmail: userEmail });
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

      {/* Lista de mensajes */}
      <FlatList data={messages} renderItem={renderItem} keyExtractor={(item, index) => index.toString()} />
      
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
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "black", paddingTop:40 },
  header: { padding: 15, backgroundColor: "white", alignItems: "center", borderRadius: 10, marginBottom: 30 },
  headerText: { color: "#008A45", fontSize: 18, fontWeight: "bold" },
  messageContainer: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: "80%" },
  sentMessage: { backgroundColor: "#008A45", alignSelf: "flex-end" },
  receivedMessage: { backgroundColor: "#444", alignSelf: "flex-start" },
  messageText: { color: "white", fontSize: 16 },
  timestamp: { fontSize: 12, color: "gray", marginTop: 5, textAlign: "right" },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "black" },
  input: { flex: 1, backgroundColor: "white", padding: 10, borderRadius: 20 },
  sendButton: { marginLeft: 10, backgroundColor: "#008A45", padding: 10, borderRadius: 20 },
  sendButtonText: { color: "white", fontSize: 16 },
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
    marginTop:20,
    marginLeft:10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
});

export default ChatScreen;