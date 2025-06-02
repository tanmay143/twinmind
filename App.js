

import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { getDB } from './src/services/chunkDB'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const checkLoginValidity = async () => {
  const timestamp = await AsyncStorage.getItem('loginTimestamp');
  if (!timestamp) return false;

  const loginTime = parseInt(timestamp, 10);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return now - loginTime < twentyFourHours;
};



export default function App() {
  useEffect(() => {
  const validateLogin = async () => {
    const isValid = await checkLoginValidity();
    if (isValid) {
      navigation.replace('Home');
    } else {
      await GoogleSignin.signOut(); // optional: clear Google session
      await AsyncStorage.clear();   // flush user info
      navigation.replace('Login');
    }
  };

  validateLogin();
}, []);
  useEffect(() => {
    getDB(); 
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}



