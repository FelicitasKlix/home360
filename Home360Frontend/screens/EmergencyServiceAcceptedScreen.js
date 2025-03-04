import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EmergencyServiceAcceptedScreen = ({ route, navigation }) => {
  const {userEmail, userType} = route.params;

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { userEmail: userEmail, userType: userType})}>
          <Icon name="home" size={30} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Ayuda en camino!</Text>
      <Text style={styles.subtitle}>El experto ya aceptó tu solicitud y está dirigiéndose a tu ubicación</Text>
      <Text style={styles.text}>Llegará en unos minutos</Text>
      <Text style={styles.subtext}>Para contactarte con el profesional hace click aquí:</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Chatear con el profesional</Text>
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
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
    title: { fontSize: 24, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 60, justifyContent: 'center', textAlign: 'center'},
    subtitle: { fontSize: 22, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 60, justifyContent: 'center', textAlign: 'center' },
    text: { fontSize: 20, fontFamily: 'Rethink Sans ExtraBold', color: '#008A45', marginBottom: 20, justifyContent: 'center', textAlign: 'center' },
    subtext: { fontSize: 18, fontFamily: 'Rethink Sans ExtraBold', color: '#EBEBEB', marginBottom: 0, justifyContent: 'center', textAlign: 'center'},
    button: { backgroundColor: 'transparent', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#008A45', fontSize: 18, fontFamily: 'Rethink Sans Bold', textDecorationLine: 'underline' },
    backButton: {
      position: 'absolute',
      marginTop:20,
      marginLeft:10,
      top: 20,
      left: 20,
      zIndex: 1,
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
  });

export default EmergencyServiceAcceptedScreen;