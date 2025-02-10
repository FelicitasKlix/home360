import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ route, navigation }) {
  const {userEmail} = route.params;
  console.log(userEmail);
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué necesitas?</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CotizarTrabajos', { userEmail: userEmail})}>
        <Text style={styles.buttonText}>Cotizar Trabajos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ServicioExpress')}>
        <Text style={styles.outlineButtonText}>Servicio Express</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home', {userEmail: userEmail})}>
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Solicitudes', {userEmail: userEmail})}>
          <Icon name="construct-outline" size={24} color="white" />
          <Text style={styles.tabText}>Solicitudes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="chatbubbles-outline" size={24} color="white" />
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', width:'100%'},
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  button: { backgroundColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 10, height:'20%', justifyContent: 'center', marginTop:20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButton: { borderWidth: 2, borderColor: '#008A45', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', height:'20%', justifyContent: 'center', marginTop:20 },
  outlineButtonText: { color: '#008A45', fontSize: 16, fontWeight: 'bold' },
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
});
