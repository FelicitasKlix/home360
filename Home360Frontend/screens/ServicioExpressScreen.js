import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ServicioExpressScreen({ navigation }) {
  const API_URL = "http://192.168.0.12:8080";
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
      navigation.navigate('SearchingEmergencyService'); 
    } catch (error) {
      console.error('Error solicitando servicio:', error);
      alert('Error al solicitar el servicio');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dejá una descripción de tu emergencia</Text>
      <TextInput style={styles.input} placeholder="Dejanos tu problema aquí" placeholderTextColor="#aaa" value={description} onChangeText={setProblema} />
      <TextInput style={styles.input} placeholder="¿Dónde te encontrás?" placeholderTextColor="#aaa" value={location} onChangeText={setDireccion} />
      <TextInput style={styles.input} placeholder="Categoría" placeholderTextColor="#aaa" value={category} onChangeText={setCategoria} />

      <TouchableOpacity style={styles.button} onPress={solicitarServicio}>
        <Text style={styles.buttonText}>Solicitar servicio Express</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#222', color: '#fff', width: '80%', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: 'green', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
