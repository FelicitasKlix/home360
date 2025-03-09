import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegistroProfesionalScreen = ({ navigation }) => {
  const API_URL = "http://192.168.0.19:8080";
  const [name, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleContinue = () => {
    if (!name || !phone || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    navigation.navigate('InformacionProfesional', {
      name,
      phone,
      email,
      password
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={name} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Celular" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="rgba(30, 30, 30, 0.6)" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continuar</Text>
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

export default RegistroProfesionalScreen;
