import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import InicioScreen from '../screens/InicioScreen';
import RegistroOpcionesScreen from '../screens/RegistroOpcionesScreen';
import RegistroUsuarioScreen from '../screens/RegistroUsuarioScreen';
import SuccessfulProfileScreen from '../screens/SuccessfulProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ServicioExpressScreen from '../screens/ServicioExpressScreen';
import SearchingEmergencyServiceScreen from '../screens/SearchingEmergencySerivceScreen'
import EmergencyServiceAcceptedScreen from '../screens/EmergencyServiceAcceptedScreen'

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="RegistroOpciones" component={RegistroOpcionesScreen} />
        <Stack.Screen name="RegistroUsuario" component={RegistroUsuarioScreen} />
        <Stack.Screen name="SuccessfulProfile" component={SuccessfulProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="ServicioExpress" component={ServicioExpressScreen} options={{ tabBarVisible: true }}/>
        <Stack.Screen name="SearchingEmergencyService" component={SearchingEmergencyServiceScreen} />
        <Stack.Screen name="EmergencyServiceAccepted" component={EmergencyServiceAcceptedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
