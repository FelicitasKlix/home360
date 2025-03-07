import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SuccessfulProfileScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil creado con éxito!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
    title: { fontSize: 24, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 20 },
    button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
  });

export default SuccessfulProfileScreen;