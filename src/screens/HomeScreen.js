// HomeScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CalendarScreen from '../components/CalendarScreen';
import MemoriesScreen from '../components/MemoriesScreen';
import ChatScreen from '../components/ChatScreen';
import FloatingRecordButton from '../components/FloatingRecordButton';

import { auth } from '../services/firebaseInit';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Calendar') iconName = 'calendar-outline';
              else if (route.name === 'Memories') iconName = 'book-outline';
              else if (route.name === 'Ask Memory') iconName = 'chatbox-ellipses-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Memories" component={MemoriesScreen} />
          <Tab.Screen name="Ask Memory" component={ChatScreen} />
        </Tab.Navigator>

        <FloatingRecordButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Customize if needed
});
