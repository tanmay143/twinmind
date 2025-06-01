// src/components/TabView.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CalendarScreen from './CalendarScreen';
import MemoriesScreen from './MemoriesScreen';
import ChatScreen from './ChatScreen';

const Tab = createMaterialTopTabNavigator();

export default function TabView() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
      <Tab.Screen name="Ask Memory" component={ChatScreen} />
    </Tab.Navigator>
  );
}
