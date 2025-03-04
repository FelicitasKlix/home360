import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CotizacionScreen({ route, navigation }) {
  //const { userEmail, professionalEmail, specialty } = route.params;
  const { professional, category, userEmail, userType} = route.params;
  console.log(professional);
  console.log(category);
  console.log("<<<<<<<<<<<<<<<<<<<");
  console.log(userEmail);
  const API_URL = "http://192.168.0.21:8080";
  const [description, setProblema] = useState('');
  const [location, setDireccion] = useState('');
  const zones = [
    'Palermo', 'Recoleta', 'Belgrano', 'Núñez', 'Caballito',
    'Villa Urquiza', 'Villa Devoto', 'Villa del Parque', 'Flores',
    'Almagro', 'Boedo', 'San Telmo', 'La Boca', 'Puerto Madero'
  ];

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalEmail: professional.email,
          userEmail: userEmail,
          category: category,
          description: description,
          direccion: location,
          id: Date.now().toString(), // Generating a temporary ID
          status: 'pending'
        }),
      });

      if (response.ok) {
        navigation.navigate('SuccessfulQuotation', {userEmail, userType});
      } else {
        Alert.alert('Error', 'No se pudo enviar la cotización. Por favor intenta nuevamente.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema de conexión. Por favor intenta nuevamente.');
    }
  };

  const toggleZoneSelection = (zone) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        //onPress={() => navigation.goBack()}
        onPress={() => {
          navigation.setParams({ userEmail, userType });
          navigation.goBack();
        }}
      >
        <Icon name="arrow-back" size={30} color="#4CAF50" />
      </TouchableOpacity>

      <Text style={styles.title}>Pedir Cotizacion</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Detalla el trabajo a realizar"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setProblema}
          placeholderTextColor="#666"
        />
      </View>

      <Text style={styles.subtitle}>Tu dirección</Text>
      
      <TextInput
        style={styles.locationInput}
        placeholder="Dónde te encontrás?"
        placeholderTextColor="#666"
        value={location}
        onChangeText={setDireccion}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enviar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    marginTop:20,
    marginLeft:10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Rethink Sans ExtraBold',
    color: '#EBEBEB',
    marginTop: 80,
    marginBottom: 40,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 50,
  },
  inputLabel: {
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    color: 'white',
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  locationInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    color: 'white',
    padding: 15,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});