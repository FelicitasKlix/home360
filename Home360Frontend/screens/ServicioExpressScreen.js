import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

export default function ServicioExpressScreen({ route, navigation }) {
  const {userEmail, userType} = route.params;
  const API_URL = "https://home360-44h2.onrender.com";
  const [description, setProblema] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [showZonesPicker, setShowZonesPicker] = useState(false);
  const [showSpecialtiesPicker, setShowSpecialtiesPicker] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchSpecialties();
    fetchZones();
  }, []);

  const solicitarServicio = async () => {
    try {
      const response = await fetch(`${API_URL}/services/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, description, location: selectedZones, category: selectedSpecialties }),
      });

      
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      navigation.navigate('SearchingEmergencyService', { userEmail, userType}); 
    } catch (error) {
      console.error('Error solicitando servicio:', error);
      alert('Error al solicitar el servicio');
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_URL}/specialties`);
      if (!response.ok) throw new Error('Error obteniendo especialidades');
      const data = await response.json();
      setSpecialties(data.specialties || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las especialidades');
    }
  };

  const fetchZones = async () => {
      try {
        const response = await fetch(`${API_URL}/zones`);
        if (!response.ok) throw new Error('Error obteniendo especialidades');
        const data = await response.json();
        setZones(data.zones || []);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudieron cargar las especialidades');
      }
    };

  const toggleZoneSelection = (zone) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const toggleSpecialtySelection = (specialty) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(z => z !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { userEmail, userType})}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.inputContainer}>
      <Text style={styles.title}>Dejá una descripción de tu emergencia</Text>
      <TextInput style={styles.input} placeholder="Dejanos tu problema aquí" placeholderTextColor="#aaa" value={description} onChangeText={setProblema} />

      <TouchableOpacity 
                style={styles.zonesButton}
                onPress={() => setShowSpecialtiesPicker(!showSpecialtiesPicker)}
              >
                <Text style={styles.zonesButtonText}>
                  {selectedSpecialties.length > 0 
                    ? `${selectedSpecialties.length} especialidades seleccionadas`
                    : 'Seleccionar especialidades'}
                </Text>
              </TouchableOpacity>
      
              {showSpecialtiesPicker && (
                <View style={styles.zonesContainer}>
                  {specialties.map((specialty) => (
                    <TouchableOpacity
                      key={specialty}
                      style={[
                        styles.zoneItem,
                        selectedSpecialties.includes(specialty) && styles.zoneItemSelected
                      ]}
                      onPress={() => toggleSpecialtySelection(specialty)}
                    >
                      <Text style={[
                        styles.zoneItemText,
                        selectedSpecialties.includes(specialty) && styles.zoneItemTextSelected
                      ]}>
                        {specialty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
      
              <TouchableOpacity 
                style={styles.zonesButton}
                onPress={() => setShowZonesPicker(!showZonesPicker)}
              >
                <Text style={styles.zonesButtonText}>
                  {selectedZones.length > 0 
                    ? `${selectedZones.length} zonas seleccionadas`
                    : 'Seleccionar zonas'}
                </Text>
              </TouchableOpacity>
      
              {showZonesPicker && (
                <View style={styles.zonesContainer}>
                  {zones.map((zone) => (
                    <TouchableOpacity
                      key={zone}
                      style={[
                        styles.zoneItem,
                        selectedZones.includes(zone) && styles.zoneItemSelected
                      ]}
                      onPress={() => toggleZoneSelection(zone)}
                    >
                      <Text style={[
                        styles.zoneItemText,
                        selectedZones.includes(zone) && styles.zoneItemTextSelected
                      ]}>
                        {zone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

      <TouchableOpacity style={styles.button} onPress={solicitarServicio}>
        <Text style={styles.buttonText}>Solicitar servicio Express</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', width:'100%' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center', marginTop:150 },
  input: { backgroundColor: '#222', color: '#fff', width: '100%', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginTop: 20, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    marginTop:20,
    marginLeft:10,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
    width: '100%'
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    backgroundColor: '#222',
  },
  zonesButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 10,
  },
  zonesButtonText: {
    fontSize: 14,
    color: '#aaa',
  },
  zonesContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  zoneItem: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 2,
    backgroundColor: '#f0f0f0',
  },
  zoneItemSelected: {
    backgroundColor: '#008A45',
  },
  zoneItemText: {
    fontSize: 16,
    color: '#000',
  },
  zoneItemTextSelected: {
    color: 'white',
  },
  
});
