import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import InicioScreen from '../screens/InicioScreen';
import RegistroOpcionesScreen from '../screens/RegistroOpcionesScreen';
import RegistroUsuarioScreen from '../screens/RegistroUsuarioScreen';
import SuccessfulProfileScreen from '../screens/SuccessfulProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicioExpressScreen from '../screens/ServicioExpressScreen';
import SearchingEmergencyServiceScreen from '../screens/SearchingEmergencySerivceScreen'
import CotizarTrabajosScreen from '../screens/CotizarTrabajosScreen'
import RegistroProfesionalScreen from '../screens/RegistroProfesionalScreen';
import InformacionProfesionalScreen from '../screens/InformacionProfesionalScreen';
import ApprovalPendingScreen from '../screens/ApprovalPendingScreen';
import ProfesionalesScreen from '../screens/ProfesionalesScreen';
import ProfessionalDetailsScreen from '../screens/ProfessionalDetailsScreen';
import PedirCotizacionScreen from '../screens/PedirCotizacionScreen';
import SuccessfulQuotationScreen from '../screens/SuccessfullQuotationScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfessionalHomeScreen from '../screens/ProfessionalHomeScreen';
import EmergencyChatScreen from '../screens/EmergencyChatScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ProfessionalProfileScreen from '../screens/ProfessionalProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="RegistroOpciones" component={RegistroOpcionesScreen} />
        <Stack.Screen name="RegistroUsuario" component={RegistroUsuarioScreen} />
        <Stack.Screen name="RegistroProfesional" component={RegistroProfesionalScreen} />
        <Stack.Screen name='InformacionProfesional' component={InformacionProfesionalScreen} />
        <Stack.Screen name='ApprovalPending' component={ApprovalPendingScreen} />
        <Stack.Screen name="SuccessfulProfile" component={SuccessfulProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ServicioExpress" component={ServicioExpressScreen} options={{ tabBarVisible: true }}/>
        <Stack.Screen name="SearchingEmergencyService" component={SearchingEmergencyServiceScreen} />
        <Stack.Screen name="CotizarTrabajos" component={CotizarTrabajosScreen} />
        <Stack.Screen name="Profesionales" component={ProfesionalesScreen} />
        <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetailsScreen} />
        <Stack.Screen name="PedirCotizacion" component={PedirCotizacionScreen} />
        <Stack.Screen name="SuccessfulQuotation" component={SuccessfulQuotationScreen} />
        <Stack.Screen name="Solicitudes" component={SolicitudesScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name='ProfessionalHome' component={ProfessionalHomeScreen} />
        <Stack.Screen name='EmergencyChat' component={EmergencyChatScreen} />
        <Stack.Screen name='UserProfile' component={UserProfileScreen} />
        <Stack.Screen name='ProfessionalProfile' component={ProfessionalProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
