import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import axios from 'axios';
import TabBar from '../navigation/TabBar';

const API_URL = "http://192.168.0.21:8080";

const UserProfileScreen = ({ route, navigation }) => {
  const { userEmail, userType } = route.params;
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rewards, setRewards] = useState([]);

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
      const response = await axios.get(`${API_URL}/users/rewards/${user.email}`);
      setRewards(response.data.rewards);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los sellos obtenidos');
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

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/users/delete-account`, { data: { email: user.email } });
      Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada con éxito');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la cuenta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'} 
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
              {rewards.length > 0 ? (
                rewards.map((reward, index) => <Text key={index} style={styles.text}>{reward}</Text>)
              ) : (
                <Text style={styles.text}>No tienes sellos aún</Text>
              )}
            </View>

            <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteAccount}>
              <Text style={styles.buttonTextOutline}>Eliminar cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSupport} onPress={() => Alert.alert('Soporte', 'support@home360.com')}>
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
  buttonDelete: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonSupport: {
    backgroundColor: 'blue',
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
});

export default UserProfileScreen;
