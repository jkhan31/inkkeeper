import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import PetDisplay from '../../components/PetDisplay';
import BookSearchModal from '../../components/BookSearchModal';

export default function HomeScreen() {
  const [isSearchVisible, setSearchVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-2xl font-serif text-stone-800">Inkkeeper</Text>
          <View className="bg-red-700 px-3 py-1 rounded-md">
            <Text className="text-white font-bold">Rank 1</Text>
          </View>
        </View>

        {/* The Pet Section */}
        <View className="items-center mb-10">
          <PetDisplay />
          <Text className="mt-4 text-xl font-serif text-stone-800">Rusty the Kit</Text>
          <View className="bg-stone-200 h-2 w-32 rounded-full mt-2 overflow-hidden">
            <View className="bg-emerald-700 h-full w-[10%]" />
          </View>
          <Text className="text-stone-500 text-sm mt-1">20 / 250 Ink</Text>
        </View>

        {/* Library Actions */}
        <View className="mb-6">
          <Text className="text-stone-500 uppercase text-xs tracking-widest mb-3">Current Read</Text>
          <TouchableOpacity 
            onPress={() => router.push('/log-session')}
            className="bg-white p-4 rounded-xl border border-stone-200 flex-row items-center h-24 shadow-sm"
          >
            <View className="bg-stone-100 h-16 w-12 rounded mr-4 items-center justify-center">
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#57534E" />
            </View>
            <View>
              <Text className="text-lg font-serif text-stone-800">Start Reading Session</Text>
              <Text className="text-stone-500 text-xs">Tap to open timer</Text>
            </View>
            <View className="flex-1 items-end">
              <MaterialCommunityIcons name="play-circle" size={32} color="#EA580C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Add Book Button */}
        <TouchableOpacity 
          onPress={() => setSearchVisible(true)}
          className="bg-stone-800 flex-row items-center justify-center py-4 rounded-xl"
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
          <Text className="text-white font-serif ml-2">Log New Book</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* The Modal */}
      <BookSearchModal 
        visible={isSearchVisible} 
        onClose={() => setSearchVisible(false)} 
      />
    </SafeAreaView>
  );
}