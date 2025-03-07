// TabBar.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TabBar = ({ navigation, userEmail, userType }) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Home', {userEmail, userType })}>
        <Icon name="home-outline" size={24} color="white" />
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Solicitudes', { userEmail, userType })}>
        <Icon name="construct-outline" size={24} color="white" />
        <Text style={styles.tabText}>Solicitudes</Text>
      </TouchableOpacity>

      

      <TouchableOpacity style={styles.tabItem}
              onPress={() => {
                if (userType === 'professional') {
                  navigation.navigate('ProfessionalProfile', { userEmail, userType });
                } else {
                  navigation.navigate('UserProfile', { userEmail, userType });
                }
              }}>
                <Icon name="person-outline" size={24} color="white" />
                <Text style={styles.tabText}>Perfil</Text>
              </TouchableOpacity>
    </View>
  );
};

const styles = {
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#008A45',
        paddingVertical: 10,
        paddingBottom: 25,
        justifyContent: 'space-around',
        width: '100%'
      },
      tabItem: {
        alignItems: 'center',
      },
      tabText: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
      },
};

export default TabBar;
