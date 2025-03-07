import React, { use } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabBar from '../navigation/TabBar';

export default function SuccessfulQuotationScreen({ route, navigation }) {
    const { userEmail, userType} = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cotizacion enviada con exito!</Text>
        
        <Text style={styles.message}>
          Una vez aceptado por el profesional se activara el{' '}
          <Text style={styles.highlightText}>chat</Text> para una mejor comunicacion!
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home', {userEmail, userType})}
        >
          <Text style={styles.buttonText}>Ok</Text>
        </TouchableOpacity>
      </View>

      <TabBar navigation={navigation} userEmail={userEmail} userType={userType} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  highlightText: {
    color: '#4CAF50',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});