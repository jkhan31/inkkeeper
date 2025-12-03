// Filename: app/(tabs)/_layout.tsx
// Purpose: Main Tab Layout with customized tab bar and navigation.
// FIXED: Directly overrides 'onPress' in the custom button to guarantee navigation to '/log-session'.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

// Custom "Raised" Button Component
const CustomReadButton = ({ children, ...props }: any) => (
  <TouchableOpacity
    {...props}
    style={{
      top: -20, // Raised effect
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View className="w-16 h-16 bg-mainBrandColor rounded-full items-center justify-center shadow-lg shadow-orange-900/40 border-4 border-white">
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A26FD7', // Main Brand Color
        tabBarInactiveTintColor: '#A8A29E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7E5E4',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
          fontSize: 10,
          marginBottom: 4,
        },
      }}>

      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={26} color={color} />,
        }}
      />

      {/* 2. Library */}
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bookshelf" size={26} color={color} />,
        }}
      />

      {/* 3. READ (Custom Button Logic) */}
      <Tabs.Screen
        name="read_placeholder"
        options={{
          title: '',
          tabBarButton: (props) => (
            <CustomReadButton
              {...props}
              // 🛑 CRITICAL FIX: Override the default tab press here directly
              onPress={(e: any) => {
                // Prevent default if the event object exists (good practice)
                e?.preventDefault?.();
                // 🚀 Force navigation to the modal
                router.push('/log-session');
              }}
            >
              <MaterialCommunityIcons name="book-open-page-variant" size={30} color="orange" />
            </CustomReadButton>
          ),
        }}
      />

      {/* 4. JOURNAL */}
      <Tabs.Screen
        name="journal" 
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="feather" size={26} color={color} />,
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle-outline" size={26} color={color} />,
        }}
      />

    </Tabs>
  );
}