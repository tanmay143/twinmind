// components/LogoutButton.js
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function LogoutButton() {
  const navigation = useNavigation();

  const confirmLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await GoogleSignin.signOut();
            await AsyncStorage.clear();
            console.log('👋 Logged out successfully');
            navigation.replace('Login');
          } catch (error) {
            console.error('❌ Error during logout:', error);
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={confirmLogout} style={{ marginRight: 20,  }}>
      <Ionicons name="log-out-outline" size={24} color="#2C597B" />
    </TouchableOpacity>
  );
}
