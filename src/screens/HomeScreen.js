import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';

import CalendarScreen from '../components/CalendarScreen';
import MemoriesScreen from '../components/MemoriesScreen';
import ChatScreen from '../components/ChatScreen';
import FloatingRecordButton from '../components/FloatingRecordButton';

const Tab = createMaterialTopTabNavigator();

export default function HomeScreen() {
  const currentRoute = useNavigationState((state) => {
    const tabIndex = state?.routes[state.index]?.state?.index ?? 0;
    const tabRoute = state?.routes[state.index]?.state?.routes?.[tabIndex]?.name;
    return tabRoute;
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color }) => {
              let iconName;
              if (route.name === 'Calendar') iconName = 'calendar-outline';
              else if (route.name === 'Memories') iconName = 'book-outline';
              else if (route.name === 'Ask All Memories') iconName = 'chatbox-ellipses-outline';
              return <Ionicons name={iconName} size={20} color={color} />;
            },
            tabBarShowIcon: true,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              color: '#2C597B', // Set text color here
            },
            tabBarActiveTintColor: '#2C597B', // Ensures active tab icon and label use the same color
            tabBarInactiveTintColor: '#2C597B', // Optional: Keep color consistent across tabs
            tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
          })}
        >

          <Tab.Screen name="Memories" component={MemoriesScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Ask All Memories" component={ChatScreen} />
        </Tab.Navigator>

        {(currentRoute === 'Memories' || currentRoute === 'Calendar') && (
          <FloatingRecordButton />
        )}
      </View>
    </SafeAreaView>
  );
}
