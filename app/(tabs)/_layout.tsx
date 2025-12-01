import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Custom "Raised" Button Component - Updated to accept all props
const CustomReadButton = ({ children, ...props }: any) => (
  <TouchableOpacity
    {...props} // ⬅️ Pass ALL props (including onPress) to the TouchableOpacity
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
      name="read_placeholder" 
      options={{
        title: '',
        tabBarButton: (props) => (
          // Pass the entire props object to the CustomReadButton
          <CustomReadButton {...props}> 
            <MaterialCommunityIcons name="book-open-page-variant" size={30} color="white" />
          </CustomReadButton>
        ),
      }}
      // 🚀 CRITICAL: The listener handles the navigation
      listeners={() => ({
        tabPress: (e) => {
          e.preventDefault(); // 🛑 1. STOP default navigation to the placeholder tab

          // 2. Explicitly navigate to the external screen (log-session)
          router.navigate('/log-session'); 
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
