import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RegistroOpcionesScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
     <Text style={styles.title}>Registrate!</Text>
      <Text style={styles.subtitle}>Cuál es tu perfil?</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegistroUsuario')}>
        <Text style={styles.buttonText}>Quiero contratar profesionales</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => alert('Registro de Profesionales en desarrollo')}>
        <Text style={styles.buttonTextOutline}>Soy profesional</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  title: { fontSize: 44, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 60, justifyContent: 'center', textAlign: 'center' },
  subtitle: { fontSize: 22, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 40, justifyContent: 'center', textAlign: 'center' },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', height: '10%', alignItems: 'center', marginBottom: 20, justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontFamily: 'Rethink Sans Bold'},
  buttonOutline: { borderWidth: 2, borderColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', height: '10%', alignItems: 'center', justifyContent: 'center' },
  buttonTextOutline: { color: '#008A45', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
});

export default RegistroOpcionesScreen;
