//import React, { useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from 'react-native';


const LoginScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.11:8080";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceToken, setDeviceToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotifications = async () => {

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert("Error", "No se concedieron permisos para notificaciones.");
        return;
      }
    }

    //const token = (await Notifications.getExpoPushTokenAsync()).data;
    //const token = await Notification.getDevicePushTokenAsync()
    //const token = await firebase.messaging().getToken();
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("Device Token:", token);
    setDeviceToken(token);
  };

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
    console.log('🔑 Estado de permisos:', status); // <-- Verifica si el usuario dio permisos
  
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
    //return token;
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Respuesta:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      await AsyncStorage.setItem("token", data.token);

      // Guardar el device token en el backend
      await fetch(`${API_URL}/users/device-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, device_token: deviceToken }),
      });
      console.log("Enviando al backend:", {
        user_email: email,
        device_token: deviceToken
      });

      const userTypeRes = await fetch(`${API_URL}/users/user-type/${email}`);
      const userTypeData = await userTypeRes.json();

      if (userTypeData.type === "user") {
        navigation.navigate("Home", { userEmail: email, userType: userTypeData.type, deviceToken: deviceToken });
      } else if (userTypeData.type === "professional") {
        navigation.navigate("ProfessionalHome", { userEmail: email, userType: userTypeData.type });
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", `No se pudo iniciar sesión: ${error.message}`);
    }
  };

  /*const handleLogin = async () => {
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
      const userType = await fetch(`${API_URL}/users/user-type/${email}`);
      const userTypeData = await userType.json();
      console.log(userTypeData.type);
      if (userTypeData.type == "user"){
        navigation.navigate('Home', { userEmail: email, userType: userTypeData.type});
      }
      if (userTypeData.type == "professional"){
        navigation.navigate('ProfessionalHome', { userEmail: email, userType: userTypeData.type});
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `No se pudo iniciar sesión: ${error.message}`);
    }
  };*/

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

/*
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const LoginScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.11:8080";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceToken, setDeviceToken] = useState("");

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      Alert.alert("Error", "Las notificaciones push solo funcionan en dispositivos físicos.");
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert("Error", "No se concedieron permisos para notificaciones.");
        return;
      }
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Device Token:", token);
    setDeviceToken(token);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Respuesta:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      await AsyncStorage.setItem("token", data.token);

      // Guardar el device token en el backend
      await fetch(`${API_URL}/users/device-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, device_token: deviceToken }),
      });

      const userTypeRes = await fetch(`${API_URL}/users/user-type/${email}`);
      const userTypeData = await userTypeRes.json();

      if (userTypeData.type === "user") {
        navigation.navigate("Home", { userEmail: email, userType: userTypeData.type });
      } else if (userTypeData.type === "professional") {
        navigation.navigate("ProfessionalHome", { userEmail: email, userType: userTypeData.type });
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", `No se pudo iniciar sesión: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresá a tu cuenta!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(30, 30, 30, 0.6)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="rgba(30, 30, 30, 0.6)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
*/