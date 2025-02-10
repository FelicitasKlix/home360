import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ApprovalPendingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completaste tu registro como profesional!</Text>
      <Text style={styles.subtitle}>Tu solicitud está en revisión</Text>
      <Text style={styles.subtitle}>Tu notificaremos en cuanto tu cuenta esté activada!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Inicio')}>
        <Text style={styles.buttonText}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  title: { fontSize: 44, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 60, justifyContent: 'center', textAlign: 'center' },
  subtitle: { fontSize: 22, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 40, justifyContent: 'center', textAlign: 'center' },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
  buttonOutline: { borderWidth: 2, borderColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 20 },
  buttonTextOutline: { color: '#EBEBEB', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
});

export default ApprovalPendingScreen;