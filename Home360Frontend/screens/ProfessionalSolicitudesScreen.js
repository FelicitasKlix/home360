import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfessionalSolicitudesScreen = ({ route, navigation }) => {
  const { userEmail } = route.params;
  const API_URL = "http://192.168.0.21:8080";
  const [quotations, setQuotations] = useState({ pending: [], completed: [], rejected: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/quotation/${userEmail}`);
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
          }
        setQuotations(data);
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [userEmail]);

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}
    onPress={() => navigation.navigate("Chat", {
        userEmail, 
        receiverEmail: item.professionalEmail, 
        quotationId: item.id
      })}>
      <Text style={styles.title}>{item.category}</Text>
      <Text style={styles.subtitle}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      <Text style={styles.sectionTitle}>Pendientes</Text>
      <FlatList data={quotations.pending} renderItem={renderItem} keyExtractor={item => item.id} style={styles.flatList}/>

      <Text style={styles.sectionTitle}>Realizados</Text>
      <FlatList data={quotations.completed} renderItem={renderItem} keyExtractor={item => item.id} style={styles.flatList}/>

      <Text style={styles.sectionTitle}>Rechazados</Text>
      <FlatList data={quotations.rejected} renderItem={renderItem} keyExtractor={item => item.id} style={styles.flatList}/>
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
  container: { flex: 1, backgroundColor: 'black', width: '100%' },
  header: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20, marginTop: 80 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 10, marginLeft: 20},
  item: { backgroundColor: 'green', padding: 15, borderRadius: 10, marginTop: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: 'white' },
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
  flatList: {
    width: '90%',
    alignSelf: 'center'
  },
});

export default ProfessionalSolicitudesScreen;
