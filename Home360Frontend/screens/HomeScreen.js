/*import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const HomeScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login correcto!!!!!!!!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
    title: { fontSize: 24, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 20 },
  });

export default HomeScreen;*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué necesitas?</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CotizarTrabajos')}>
        <Text style={styles.buttonText}>Cotizar Trabajos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ServicioExpress')}>
        <Text style={styles.outlineButtonText}>Servicio Express</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  button: { backgroundColor: 'green', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButton: { borderWidth: 2, borderColor: 'green', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  outlineButtonText: { color: 'green', fontSize: 16, fontWeight: 'bold' },
});
