import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegistroUsuarioScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.21:8080";
  const [name, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          phone, 
          email, 
          password, 
          role: "user"
        })
      });
      
      const data = await response.json();
      console.log('Respuesta:', data);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }
      
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada.');
      navigation.navigate('SuccessfulProfile');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `No se pudo completar el registro: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={name} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Celular" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  title: { fontSize: 24, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 20 },
  input: { width: '80%', padding: 15, borderWidth: 1, borderColor: '#1E1E1E', borderRadius: 8, marginBottom: 10, backgroundColor: 'white', fontSize: 16 },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
});

export default RegistroUsuarioScreen;
