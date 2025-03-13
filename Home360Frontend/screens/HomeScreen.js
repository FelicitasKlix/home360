import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import TabBar from '../navigation/TabBar';

const API_URL = "http://192.168.0.19:8080";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen({ route, navigation }) {
  const { userEmail, userType, deviceToken } = route.params;

  useEffect(() => {
    registerForPushNotifications();
    
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida en foreground:', notification);
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación background/killed state:', response);
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  async function registerForPushNotifications() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }

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