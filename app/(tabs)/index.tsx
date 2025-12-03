// Filename: app/(tabs)/index.tsx
// Purpose: Main dashboard (Home). Displays Companion, Daily Goal, and Start Reading CTA.
// FIXED: Start Reading button now correctly routes to '/log-session'.
// FIXED: Replaced "Rank" badge with "Ink Drops" counter.

import CompanionDisplay from '@/components/CompanionDisplay';
import { useHomeData } from '@/hooks/useHomeData';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { loading, refreshing, refresh, inkDrops, activeBook, companionData } = useHomeData();

  // Navigation Handler
  const handleStartReading = () => {
    // CRITICAL FIX: Route directly to the log-session screen
    // This prevents the "loop" where it just reloaded the home page
    router.push('/log-session');
  };

  return (
    <SafeAreaView className="flex-1 bg-ricePaper">
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#A26FD7" />}
      >
        {/* Header - v6.0 Time-Only Layout */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-2xl font-serif text-sumiInk font-bold">Inkkeeper</Text>
          
          {/* CRITICAL FIX: Replaced Rank Badge with Ink Counter */}
          <View className="bg-mainBrandColor px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
             <MaterialCommunityIcons name="water" size={16} color="white" style={{ marginRight: 4 }} />
             <Text className="text-white font-bold text-sm">{inkDrops}</Text>
          </View>
        </View>

        {/* Companion Section */}
        <View className="items-center mb-10">
          <CompanionDisplay 
            currentXP={companionData.progressPercent * 250} // Approximate back to XP 
            companionName={companionData.name}
            levelLabel={companionData.stageLabel}
            isFaint={companionData.isFaint} // Faint Logic Connected
          />
        </View>

        {/* Action Section */}
        {activeBook ? (
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 items-center">
                <Text className="text-stone-500 text-sm mb-2 uppercase tracking-widest">Active Book</Text>
                <Text className="text-xl font-serif font-bold text-sumiInk mb-6 text-center">{activeBook.title}</Text>
                
                {/* START READING BUTTON */}
                <TouchableOpacity 
                    onPress={handleStartReading}
                    className="bg-cinnabarRed w-full py-4 rounded-xl flex-row justify-center items-center shadow-md active:opacity-90"
                >
                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white text-lg font-bold">Log Session</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-stone-300 items-center">
                <Text className="text-stone-400 text-center mb-4">No book selected for reading.</Text>
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/library')}
                    className="bg-stone-100 px-6 py-3 rounded-xl"
                >
                    <Text className="text-stone-600 font-bold">Go to Library</Text>
                </TouchableOpacity>
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}