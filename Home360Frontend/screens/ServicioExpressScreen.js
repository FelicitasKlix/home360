import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ServicioExpressScreen({ route, navigation }) {
  const {userEmail, userType} = route.params;
  const API_URL = "http://192.168.0.11:8080";
  const [description, setProblema] = useState('');
  const [location, setDireccion] = useState('');
  const [category, setCategoria] = useState('');

  const solicitarServicio = async () => {
    try {
      const response = await fetch(`${API_URL}/services/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, location, category }),
      });

      

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      //alert('Servicio solicitado con éxito');
      navigation.navigate('SearchingEmergencyService', { userEmail: userEmail, userType: userType}); 
    } catch (error) {
      console.error('Error solicitando servicio:', error);
      alert('Error al solicitar el servicio');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { userEmail: userEmail, userType: userType})}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.inputContainer}>
      <Text style={styles.title}>Dejá una descripción de tu emergencia</Text>
      <TextInput style={styles.input} placeholder="Dejanos tu problema aquí" placeholderTextColor="#aaa" value={description} onChangeText={setProblema} />
      <TextInput style={styles.input} placeholder="¿Dónde te encontrás?" placeholderTextColor="#aaa" value={location} onChangeText={setDireccion} />
      <TextInput style={styles.input} placeholder="Categoría" placeholderTextColor="#aaa" value={category} onChangeText={setCategoria} />

      <TouchableOpacity style={styles.button} onPress={solicitarServicio}>
        <Text style={styles.buttonText}>Solicitar servicio Express</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home', { userEmail: userEmail, userType: userType})}>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', width:'100%' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center', marginTop:150 },
  input: { backgroundColor: '#222', color: '#fff', width: '100%', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginTop: 20, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    marginTop:20,
    marginLeft:10,
    top: 20,
    left: 20,
    zIndex: 1,
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
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
    width: '100%'
  },
});
