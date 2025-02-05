import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import HomeScreen from '../screens/HomeScreen';
//import SolicitudesScreen from '../screens/SolicitudesScreen';
//import ChatScreen from '../screens/ChatScreen';
//import PerfilScreen from '../screens/PerfilScreen';
//import CotizarTrabajosScreen from '../screens/CotizarTrabajosScreen';
import ServicioExpressScreen from '../screens/ServicioExpressScreen';


const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Solicitudes') iconName = 'construct';
          else if (route.name === 'Chat') iconName = 'chatbubbles';
          else if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Solicitudes" component={SolicitudesScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="ServicioExpress" component={ServicioExpressScreen} />
    </Tab.Navigator>
  );
}
