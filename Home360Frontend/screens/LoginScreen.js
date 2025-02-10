import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.16:8080"; //IP Depto feli
  //const API_URL = "http://192.168.1.25:8080"; //IP Depto juli
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Respuesta:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales incorrectas');
      }

      // Guardamos el token usando AsyncStorage
      await AsyncStorage.setItem("token", data.token);
      
      navigation.navigate('Home', { userEmail: email});
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `No se pudo iniciar sesión: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Ingresá a tu cuenta!</Text>
    <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={email} onChangeText={setEmail} keyboardType="email-address" />
    <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={password} onChangeText={setPassword} secureTextEntry />
    <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.buttonText}>Iniciar sesión</Text>
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

export default LoginScreen;