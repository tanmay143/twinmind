import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LogoutButton from '../components/LogoutButton';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={() => ({
          title: 'TwinMind',
          headerRight: () => <LogoutButton/>,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: '#2C597B',
          },
        })}
      />
    </Stack.Navigator>
  );
}
