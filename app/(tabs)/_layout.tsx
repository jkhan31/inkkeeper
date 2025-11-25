import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Custom "Raised" Button Component
const CustomReadButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      top: -20, // Move it up
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View className="w-16 h-16 bg-orange-600 rounded-full items-center justify-center shadow-lg shadow-orange-900/40 border-4 border-white">
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#EA580C',
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

      {/* 3. READ (Custom Button) */}
      <Tabs.Screen
        name="read_placeholder" // Dummy route, we override the button
        options={{
          title: '',
          tabBarButton: (props) => (
            <CustomReadButton onPress={() => router.push('/log-session')}>
              <MaterialCommunityIcons name="book-open-page-variant" size={30} color="white" />
            </CustomReadButton>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault(); // Prevent navigating to the placeholder
            router.push('/log-session'); // Go to the timer screen instead
          },
        })}
      />

      {/* 4. Stats */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-bar" size={26} color={color} />,
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