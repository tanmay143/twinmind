import React, { useEffect } from 'react';
import { View, Text, Button, Image,TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureGoogleSignIn } from '../config/googleSignInConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseInit'; // Your Firestore DB
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const saveUserToFirestore = async (userInfo) => {
    try {
      const userId = userInfo.user.id;
      
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: userInfo.user.name,
          email: userInfo.user.email,
          createdAt: new Date().toISOString(),
        });
        console.log('✅ New user added to Firestore');
      } else {
        console.log('👤 User already exists in Firestore');
      }

      
      await AsyncStorage.setItem('userId', userInfo.user.id);         // ✅ fixed
      await AsyncStorage.setItem('userName', userInfo.user.name);
      await AsyncStorage.setItem('userEmail', userInfo.user.email);
    } catch (err) {
      console.error('🔥 Failed to save user to Firestore:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();
      // console.log(JSON.stringify(userInfo, null, 2));
      // console.log(userInfo.data.user.id)

      if (userInfo && accessToken) {
        const now = Date.now(); // current timestamp in ms
        await AsyncStorage.setItem('loginTimestamp', now.toString());

        await AsyncStorage.setItem('userToken', accessToken);
        await saveUserToFirestore(userInfo.data);
        console.log('✅ Login and token storage successful.');
        navigation.replace('Home');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Login Cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-In In Progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services Not Available');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  return (
    <LinearGradient
    colors={['#2C597B', '#E6A06F']}
    style={styles.gradient}
  >
      <View style={styles.container}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>


        <View style={styles.footer}>
          <Text style={styles.footerText}>Privacy Policy</Text>
          <Text style={styles.footerText}>Terms of Service</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
  flex: 1,
},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'linear-gradient(180deg, #2C597B 0%, #E6A06F 100%)', // won't work directly
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 60,
    borderRadius: 20
  },
  googleButton: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
  },
});
