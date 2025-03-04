import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import TabBar from '../navigation/TabBar';

const API_URL = "http://192.168.0.21:8080";

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen({ route, navigation }) {
  const { userEmail, userType, deviceToken } = route.params;
  console.log("$$$$$$$$$$$$");
  console.log(userEmail);

  useEffect(() => {
    registerForPushNotifications();
    
    // Configurar listeners para notificaciones
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida en foreground:', notification);
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación background/killed state:', response);
    });

    // Cleanup
    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  async function registerForPushNotifications() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Si no tenemos permisos, solicitarlos
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }

      // Asegúrate de que el token esté actualizado
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);

      // Aquí podrías actualizar el token en tu backend si es necesario
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }

  async function sendPushNotification() {
    const message = {
      to: deviceToken,
      title: 'Original Title',
      body: 'And here is the body!',
    };
  
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log(response);
  }

  const handleTestNotification = async () => {
    try {
      const response = await fetch(`${API_URL}/users/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      
      const data = await response.json();
      
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al enviar la notificación");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>¿Qué necesitas?</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('CotizarTrabajos', {userEmail, userType})}>
          <Text style={styles.buttonText}>Cotizar Trabajos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.outlineButton} 
          onPress={() => navigation.navigate('ServicioExpress', { userEmail, userType})}>
          <Text style={styles.outlineButtonText}>Servicio Express</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleTestNotification}>
          <Text style={styles.testButtonText}>Probar Push Notifications</Text>
        </TouchableOpacity>
      </View>

      <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    width:'100%'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 30 
  },
  button: { 
    backgroundColor: '#008A45', 
    padding: 15, 
    borderRadius: 10, 
    width: '80%', 
    alignItems: 'center', 
    marginBottom: 10, 
    height:'20%', 
    justifyContent: 'center', 
    marginTop:20 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  outlineButton: { 
    borderWidth: 2, 
    borderColor: '#008A45', 
    padding: 15, 
    borderRadius: 10, 
    width: '80%', 
    alignItems: 'center', 
    height:'20%', 
    justifyContent: 'center', 
    marginTop:20 
  },
  outlineButtonText: { 
    color: '#008A45', 
    fontSize: 16, 
    fontWeight: 'bold' 
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
    backgroundColor: '#008A45',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
    width: '100%'
  },
  testButton: { 
    backgroundColor: '#ff5722', 
    padding: 15, 
    borderRadius: 10, 
    width: '80%', 
    alignItems: 'center', 
    marginTop: 20 
  },
  testButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});