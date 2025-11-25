import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. Theme Colors
        tabBarActiveTintColor: '#EA580C', // Fox Rust (Orange)
        tabBarInactiveTintColor: '#A8A29E', // Stone 400 (Grey)
        
        // 2. Remove the default top header (We made our own custom headers)
        headerShown: false, 
        
        // 3. Style the bar itself
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7E5E4', // Stone 200
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
          fontSize: 12,
        },
      }}>
      
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={28} color={color} />,
        }}
      />
      
      {/* Tab 2: Library (Mapped to 'explore.tsx') */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bookshelf" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}