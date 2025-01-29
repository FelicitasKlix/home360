import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import InicioScreen from '../screens/InicioScreen';
import RegistroOpcionesScreen from '../screens/RegistroOpcionesScreen';
import RegistroUsuarioScreen from '../screens/RegistroUsuarioScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="RegistroOpciones" component={RegistroOpcionesScreen} />
        <Stack.Screen name="RegistroUsuario" component={RegistroUsuarioScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
