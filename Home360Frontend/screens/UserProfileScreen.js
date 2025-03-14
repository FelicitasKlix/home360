import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import axios from 'axios';
import TabBar from '../navigation/TabBar';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = "https://home360-44h2.onrender.com";

const UserProfileScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rewards, setRewards] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUserRewards();
  }, []);


  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/user-all-info/${userEmail}`);
      setUser(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
    }
  };

  const fetchUserRewards = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/reviews/${userEmail}`);
      setReviews(response.data.amount);
      const resp = await axios.get(`${API_URL}/users/rewards/${userEmail}`);
      setRewards(resp.data.amount);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los sellos obtenidos');
    }
  };

  const handleUnlockBenefits = async () => {
    try {
      Alert.alert('Canjeá tu beneficio!', 'Enviá el monto del próximo trabajo que contrates a rewards@home360.com y te devolveremos el total!');
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesas');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await axios.post(`${API_URL}/users/change-password-user`, {
        email: userEmail,
        current_password: currentPassword,
        new_password: newPassword,
      });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Perfil de Usuario</Text>
            <View style={styles.sectionContainer}>
              <Text style={styles.text}>Nombre: {user.first_name}</Text>
              <Text style={styles.text}>Email: {user.email}</Text>
              <Text style={styles.text}>Teléfono: {user.phone}</Text>
            </View>
  
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle}>Cambiar Contraseña</Text>
              <TextInput
                placeholder="Contraseña actual"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Nueva contraseña"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Confirmar nueva contraseña"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
              />
              <TouchableOpacity style={styles.buttonOutline} onPress={handleChangePassword}>
                <Text style={styles.buttonTextOutline}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>
  
            <View style={styles.sectionContainer}>
              <Text style={styles.subtitle2}>Sellos Obtenidos</Text>
              {reviews > 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  {[...Array(Math.floor(reviews / 2))].map((_, index) => (
                    <Icon key={index} name="trophy" size={24} color="gold" />
                  ))}
                  {reviews % 2 !== 0 && (
                    <Icon name="trophy" size={24} color="gold" style={{ opacity: 0.5 }} />
                  )}
                </View>
              ) : (
                <Text style={styles.text}>No tienes sellos aún</Text>
              )}
            </View>
  
            {rewards > 0 && (
              <View style={styles.sectionContainer}>
                {[...Array(rewards)].map((_, index) => (
                  <TouchableOpacity key={index} style={styles.rewardCard} onPress={handleUnlockBenefits}>
                    <Text style={styles.rewardText}>Desbloqueá tu beneficio</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
  
            <TouchableOpacity style={styles.buttonSupport} onPress={() => Alert.alert("Soporte", "support@home360.com")}>
              <Text style={styles.buttonTextOutline}>Soporte</Text>
            </TouchableOpacity>
          </>
        }
      />
      <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 80
  },
  sectionContainer: {
    width: '90%',
    alignSelf: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EBEBEB',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EBEBEB',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#EBEBEB',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  buttonOutline: {
    backgroundColor: '#008A45',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonSupport: {
    backgroundColor: '#008A45',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonTextOutline: {
    color: '#EBEBEB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 2,
    borderColor: '#008A45', 
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EBEBEB",
  },
  
});

export default UserProfileScreen;
