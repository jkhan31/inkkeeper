import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

import PetDisplay from '../../components/PetDisplay';
import BookSearchModal from '../../components/BookSearchModal';

export default function HomeScreen() {
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [inkDrops, setInkDrops] = useState(0);
  const [loading, setLoading] = useState(true);

  // FETCH DATA whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Profile (Ink + Active Book ID)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ink_drops, active_book_id')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setInkDrops(profile.ink_drops || 0);

      // 2. Get Book Details (if ID exists)
      if (profile.active_book_id) {
        const { data: book, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', profile.active_book_id)
          .single();
        
        if (bookError) console.error("Error fetching book:", bookError);
        setActiveBook(book);
      } else {
        setActiveBook(null);
      }

    } catch (error) {
      console.error("Home Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Hardcoded progress for MVP */}
            <View className="bg-emerald-700 h-full w-[10%]" />
          </View>
          <Text className="text-stone-500 text-sm mt-1">{inkDrops} / 250 Ink</Text>
        </View>

        {/* Library Actions */}
        <View className="mb-6">
          <Text className="text-stone-500 uppercase text-xs tracking-widest mb-3">Current Read</Text>
          
          {loading ? (
             <View className="h-24 justify-center items-center">
                <ActivityIndicator color="#EA580C" />
             </View>
          ) : activeBook ? (
            /* --- ACTIVE BOOK CARD --- */
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/log-session', params: { bookId: activeBook.id } })}
              className="bg-white p-4 rounded-xl border border-stone-200 flex-row items-center h-28 shadow-sm"
            >
              {activeBook.cover_url ? (
                <Image 
                  source={{ uri: activeBook.cover_url }} 
                  className="h-20 w-14 rounded mr-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="bg-emerald-700 h-20 w-14 rounded mr-4 items-center justify-center">
                  <MaterialCommunityIcons name="book-variant" size={24} color="white" />
                </View>
              )}
              
              <View className="flex-1">
                <Text className="text-lg font-serif text-stone-800 font-bold" numberOfLines={1}>
                  {activeBook.title}
                </Text>
                <Text className="text-stone-500 text-xs mb-2">{activeBook.author}</Text>
                
                {/* Mini Progress Bar */}
                <View className="flex-row items-center">
                   <View className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden mr-2">
                      <View 
                        className="h-full bg-orange-500" 
                        style={{ width: `${(activeBook.current_unit / activeBook.total_units) * 100}%` }} 
                      />
                   </View>
                   <Text className="text-stone-400 text-[10px]">
                     {Math.round((activeBook.current_unit / activeBook.total_units) * 100)}%
                   </Text>
                </View>
              </View>
              
              <View className="ml-2">
                <MaterialCommunityIcons name="play-circle" size={32} color="#EA580C" />
              </View>
            </TouchableOpacity>

          ) : (
            /* --- EMPTY STATE PLACEHOLDER --- */
            <TouchableOpacity 
              className="bg-white p-4 rounded-xl border border-stone-200 flex-row items-center h-24 shadow-sm border-dashed"
              onPress={() => setSearchVisible(true)}
            >
               <View className="bg-stone-50 h-16 w-12 rounded mr-4 items-center justify-center">
                 <MaterialCommunityIcons name="book-plus" size={24} color="#A8A29E" />
               </View>
               <Text className="text-stone-400 font-serif">Select a book to start...</Text>
            </TouchableOpacity>
          )}
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