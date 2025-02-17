import React, { useState, useEffect, use } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const InformacionProfesionalScreen = ({ route, navigation }) => {
  const API_URL = "http://192.168.0.11:8080";
  const { name, phone, email, password } = route.params;

  const [tuition, setTuition] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [showZonesPicker, setShowZonesPicker] = useState(false);
  const [showSpecialtiesPicker, setShowSpecialtiesPicker] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  
  const zones = [
    'Palermo', 'Recoleta', 'Belgrano', 'Núñez', 'Caballito',
    'Villa Urquiza', 'Villa Devoto', 'Villa del Parque', 'Flores',
    'Almagro', 'Boedo', 'San Telmo', 'La Boca', 'Puerto Madero'
  ];

  useEffect(() => {
    fetchSpecialties();
  }, []);

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

  const handleRegister = async () => {
    try {
      // Validación de fecha
      if (!isValidDate(birthDate)) {
        Alert.alert('Error', 'Por favor ingresa una fecha válida en formato YYYY-MM-DD');
        return;
      }

      // Otras validaciones
      if (!tuition || selectedZones.length === 0 || selectedSpecialties.length === 0) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: "professional",
          name,
          phone,
          email,
          password,
          tuition,
          specialty: selectedSpecialties,
          birth_date: birthDate,
          zones: selectedZones
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada.');
      navigation.navigate('ApprovalPending');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `No se pudo completar el registro: ${error.message}`);
    }
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Completa tu perfil</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          placeholderTextColor="rgba(30, 30, 30, 0.6)"
          value={tuition}
          onChangeText={setTuition}
        />

        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (DD-MM-YYYY)"
          placeholderTextColor="rgba(30, 30, 30, 0.6)"
          value={birthDate}
          onChangeText={setBirthDate}
        />

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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Rethink Sans ExtraBold',
    color: '#EBEBEB',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    backgroundColor: 'white',
  },
  zonesButton: {
    width: '80%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  zonesButtonText: {
    fontSize: 16,
    color: 'rgba(30, 30, 30, 0.6)',
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
  button: {
    backgroundColor: '#008A45',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Rethink Sans Bold',
  },
});

export default InformacionProfesionalScreen;
