// components/ui/AddBookForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface AddBookFormProps {
  bookData: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookForm({ bookData, onClose, onSuccess }: AddBookFormProps) {
  // Defensive coding: handle both raw Google Books item or just volumeInfo
  const info = bookData.volumeInfo || bookData;
  
  const [format, setFormat] = useState<'physical' | 'audio'>('physical');
  const [status, setStatus] = useState<'active' | 'wishlist'>('active'); 
  // 🆕 NEW: Genre Type (Critical for Blueprint v6.2)
  const [genreType, setGenreType] = useState<'fiction' | 'non-fiction'>('non-fiction');
  
  const [totalUnits, setTotalUnits] = useState(info.pageCount?.toString() || '300');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingChecks, setLoadingChecks] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    performPreChecks();
    attemptGenreDetection();
  }, [info.title]);

  // 🧠 LOGIC: Try to guess genre from Google Books Categories
  const attemptGenreDetection = () => {
    if (info.categories && info.categories.length > 0) {
      const catString = info.categories[0].toLowerCase();
      if (catString.includes('fiction') && !catString.includes('non-fiction')) {
        setGenreType('fiction');
      } else {
        setGenreType('non-fiction');
      }
    }
  };

  const performPreChecks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('active_book_id')
        .eq('id', user.id)
        .single();

      // If user is already reading a book, default new ones to wishlist
      if (profile?.active_book_id) {
        setStatus('wishlist');
      } else {
        setStatus('active');
      }

      // Check for duplicates
      const { data: duplicates } = await supabase
        .from('books')
        .select('id')
        .eq('user_id', user.id)
        .ilike('title', info.title); 

      if (duplicates && duplicates.length > 0) {
        setIsDuplicate(true);
      }

    } catch (error) {
      console.error("Pre-check error:", error);
    } finally {
      setLoadingChecks(false);
    }
  };

  const handleSave = () => {
    if (isDuplicate) {
      Alert.alert(
        "Duplicate Found",
        `You already have "${info.title}" in your library. Add it anyway?`,
        [
          { text: "Cancel", style: "cancel", onPress: () => setIsSaving(false) },
          { text: "Add Anyway", style: "default", onPress: proceedWithSave }
        ]
      );
    } else {
      proceedWithSave();
    }
  };

  const proceedWithSave = async () => {
    if (!totalUnits || isNaN(Number(totalUnits))) {
      Alert.alert('Invalid Input', 'Please enter a valid number of pages/minutes.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: info.title,
          author: info.authors ? info.authors[0] : 'Unknown',
          cover_url: info.imageLinks?.thumbnail,
          total_units: Number(totalUnits),
          format: format,
          status: status,
          genre_type: genreType, // 👈 SAVING THE GENRE
          current_unit: 0,
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // If making it active, update profile immediately
      if (status === 'active') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ active_book_id: newBook.id })
          .eq('id', user.id);

        if (profileError) console.error("Profile update failed:", profileError);
      }

      onSuccess();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingChecks) {
    return (
        <View className="flex-1 justify-center items-center h-64">
            <ActivityIndicator color="#EA580C" />
            <Text className="text-stone-400 text-xs mt-2">Checking Library...</Text>
        </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 px-1" 
      showsVerticalScrollIndicator={true}
      indicatorStyle="black"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      
      <View className="flex-row justify-between items-center mb-2 mt-2">
        <TouchableOpacity 
            onPress={onClose} 
            className="w-10 h-10 bg-stone-100 rounded-full items-center justify-center"
        >
            <MaterialCommunityIcons name="close" size={24} color="#57534E" />
        </TouchableOpacity>
        <Text className="text-stone-400 font-bold text-xs uppercase tracking-widest">Review Book</Text>
        <View className="w-10" />
      </View>

      <View className="items-center mb-6">
        <View className="shadow-lg shadow-black/20 bg-white rounded-lg mb-4">
           {info.imageLinks?.thumbnail ? (
             <Image 
               source={{ uri: info.imageLinks.thumbnail }} 
               className="w-24 h-36 rounded-lg" 
               resizeMode="cover"
             />
           ) : (
             <View className="w-24 h-36 bg-stone-200 rounded-lg items-center justify-center">
               <MaterialCommunityIcons name="book" size={40} color="#78716C" />
             </View>
           )}
        </View>
        <Text className="text-xl font-serif text-stone-800 text-center font-bold px-4">{info.title}</Text>
        <Text className="text-stone-500 text-sm mt-1">{info.authors?.[0]}</Text>
      </View>

      {/* STATUS & GENRE ROW */}
      <View className="flex-row gap-4 mb-6">
        {/* Status Toggle */}
        <View className="flex-1">
            <Text className="text-xs uppercase text-stone-400 font-bold mb-2 tracking-widest text-center">Shelf</Text>
            <View className="bg-stone-100 p-1 rounded-xl">
                {['active', 'wishlist'].map((s) => (
                    <TouchableOpacity 
                        key={s}
                        onPress={() => setStatus(s as any)}
                        className={`items-center justify-center py-2 rounded-lg mb-1 ${status === s ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold capitalize ${status === s ? 'text-stone-800' : 'text-stone-500'}`}>
                            {s === 'active' ? 'Reading' : 'Wishlist'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* 🆕 Genre Toggle */}
        <View className="flex-1">
            <Text className="text-xs uppercase text-stone-400 font-bold mb-2 tracking-widest text-center">Type</Text>
            <View className="bg-stone-100 p-1 rounded-xl">
                <TouchableOpacity 
                    onPress={() => setGenreType('non-fiction')}
                    className={`items-center justify-center py-2 rounded-lg mb-1 ${genreType === 'non-fiction' ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`font-bold ${genreType === 'non-fiction' ? 'text-stone-800' : 'text-stone-500'}`}>Non-Fic</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setGenreType('fiction')}
                    className={`items-center justify-center py-2 rounded-lg ${genreType === 'fiction' ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`font-bold ${genreType === 'fiction' ? 'text-stone-800' : 'text-stone-500'}`}>Fiction</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>

      {/* FORMAT & PAGES ROW */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1">
            <Text className="text-xs uppercase text-stone-400 font-bold mb-2 tracking-widest">Format</Text>
            <View className="flex-row bg-stone-100 p-1 rounded-xl h-[58px]">
                <TouchableOpacity 
                onPress={() => setFormat('physical')}
                className={`flex-1 items-center justify-center rounded-lg ${format === 'physical' ? 'bg-white shadow-sm' : ''}`}
                >
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color={format === 'physical' ? '#EA580C' : '#78716C'} />
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={() => setFormat('audio')}
                className={`flex-1 items-center justify-center rounded-lg ${format === 'audio' ? 'bg-white shadow-sm' : ''}`}
                >
                <MaterialCommunityIcons name="headphones" size={24} color={format === 'audio' ? '#EA580C' : '#78716C'} />
                </TouchableOpacity>
            </View>
        </View>

        <View className="flex-1">
            <Text className="text-xs uppercase text-stone-400 font-bold mb-2 tracking-widest">
              {format === 'physical' ? 'Total Pages' : 'Mins'}
            </Text>
            <View className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex-row items-center h-[58px]">
              <TextInput
                value={totalUnits}
                onChangeText={setTotalUnits}
                keyboardType="number-pad"
                className="flex-1 text-lg font-bold text-stone-800"
              />
            </View>
        </View>
      </View>

      <View className="mt-4 pb-20">
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSaving}
          className="bg-stone-800 py-4 rounded-xl flex-row items-center justify-center mb-3 shadow-lg"
        >
          {isSaving ? (
             <ActivityIndicator color="white" />
          ) : (
             <>
               <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
               <Text className="text-white font-bold ml-2 text-lg">Add to Library</Text>
             </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}