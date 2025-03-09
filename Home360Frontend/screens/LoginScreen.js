import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from 'react-native';


const LoginScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.19:8080";
  const [userEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceToken, setDeviceToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;
  
    console.log('✅ Iniciando registro de notificaciones');
  
    if (Platform.OS === 'android') {
      console.log('📱 Configurando canal de notificaciones para Android');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('🔑 Estado de permisos:', status);
  
    if (status !== 'granted') {
      console.log('❌ No se concedieron permisos para notificaciones');
      alert('No se concedieron permisos para notificaciones.');
      return;
    }
  
    try {
      console.log('📡 Obteniendo Expo Push Token...');
      const response = await Notifications.getExpoPushTokenAsync();
      console.log('🔄 Respuesta completa:', response);
    
      token = response.data;
      console.log('🔥 Device Token:', token);
    
      if (!token) {
        console.log('⚠️ Token vacío o undefined');
      }
    } catch (error) {
      console.log('❌ Error obteniendo el token:', error);
    }
    
    setDeviceToken(token);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      await AsyncStorage.setItem("token", data.token);

      await fetch(`${API_URL}/users/device-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail, device_token: deviceToken }),
      });
      console.log("Enviando al backend:", {
        user_email: userEmail,
        device_token: deviceToken
      });

      const userTypeRes = await fetch(`${API_URL}/users/user-type/${userEmail}`);
      const userTypeData = await userTypeRes.json();

      if (userTypeData.type === "user") {
        navigation.navigate("Home", { userEmail, userType: userTypeData.type, deviceToken: deviceToken });
      } else if (userTypeData.type === "professional") {
        navigation.navigate("ProfessionalHome", { userEmail, userType: userTypeData.type });
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", `No se pudo iniciar sesión: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Ingresá a tu cuenta!</Text>
    <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={userEmail} onChangeText={setEmail} keyboardType="email-address" />
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