import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SearchingEmergencyServiceScreen = ({ route, navigation }) => {
  //const navigate = useNavigate();
  const {userEmail, userType} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscando tu solución express!</Text>
      <Text style={styles.subtitle}>Tu hogar pide ayuda, nosotros te mandamos héroes</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EmergencyServiceAccepted', { userEmail: userEmail, userType: userType})}>
        <Text style={styles.buttonText}>Servicio aceptado!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
    title: { fontSize: 24, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 60, justifyContent: 'center', textAlign: 'center'},
    subtitle: { fontSize: 22, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 40, justifyContent: 'center', textAlign: 'center' },
    button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontFamily: 'Rethink Sans Bold' },
  });

export default SearchingEmergencyServiceScreen;