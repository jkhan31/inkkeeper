import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface AddBookFormProps {
  bookData: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookForm({ bookData, onClose, onSuccess }: AddBookFormProps) {
  const info = bookData.volumeInfo || bookData;
  
  // State
  const [format, setFormat] = useState<'physical' | 'audio'>('physical');
  const [totalUnits, setTotalUnits] = useState(info.pageCount?.toString() || '300');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!totalUnits || isNaN(Number(totalUnits))) {
      Alert.alert('Invalid Input', 'Please enter a valid number of pages/minutes.');
      return;
    }

    setIsSaving(true);
    try {
      // --- ROBUST DEV AUTH ---
      // 1. Check if we already have a session
      let { data: { user } } = await supabase.auth.getUser();

      // 2. If no session, try to Log In with the hardcoded test account
      if (!user) {
        console.log("No session. Attempting Dev Login...");
        const email = 'tester@inkkeeper.app';
        const password = 'password123'; // Simple dev password

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        // 3. If Login fails (user doesn't exist yet), Sign Up
        if (signInError) {
           console.log("Login failed, creating new Dev User...");
           const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
             email,
             password
           });
           if (signUpError) throw signUpError;
           user = signUpData.user;
        } else {
           user = signInData.user;
        }
      }
      
      if (!user) throw new Error('Authentication failed');
      // -----------------------

      // 4. Insert Book
      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: info.title,
          author: info.authors ? info.authors[0] : 'Unknown',
          cover_url: info.imageLinks?.thumbnail,
          total_units: Number(totalUnits),
          format: format,
          status: 'active',
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // 5. Update Profile
      // Upsert ensures the profile exists for this new user
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id, 
            active_book_id: newBook.id 
        });

      if (profileError) console.warn("Profile error:", profileError);

      onSuccess();

    } catch (error: any) {
      console.error("SAVE ERROR:", error);
      Alert.alert('Save Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1">
      {/* Header */}
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

      {/* Format Selector */}
      <View className="flex-row bg-stone-100 p-1 rounded-xl mb-6">
        <TouchableOpacity 
          onPress={() => setFormat('physical')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${format === 'physical' ? 'bg-white shadow-sm' : ''}`}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={20} color={format === 'physical' ? '#EA580C' : '#78716C'} />
          <Text className={`ml-2 font-bold ${format === 'physical' ? 'text-stone-800' : 'text-stone-500'}`}>Physical</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setFormat('audio')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${format === 'audio' ? 'bg-white shadow-sm' : ''}`}
        >
          <MaterialCommunityIcons name="headphones" size={20} color={format === 'audio' ? '#EA580C' : '#78716C'} />
          <Text className={`ml-2 font-bold ${format === 'audio' ? 'text-stone-800' : 'text-stone-500'}`}>Audio</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View className="mb-8">
        <Text className="text-xs uppercase text-stone-400 font-bold mb-2 tracking-widest">
          {format === 'physical' ? 'Total Pages' : 'Duration (Minutes)'}
        </Text>
        <View className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 flex-row items-center">
          <TextInput
            value={totalUnits}
            onChangeText={setTotalUnits}
            keyboardType="number-pad"
            className="flex-1 text-lg font-bold text-stone-800"
          />
          <Text className="text-stone-400 text-sm">{format === 'physical' ? 'Pages' : 'Mins'}</Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View className="mt-auto">
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSaving}
          className="bg-orange-600 py-4 rounded-xl flex-row items-center justify-center mb-3 shadow-sm shadow-orange-200"
        >
          {isSaving ? (
             <ActivityIndicator color="white" />
          ) : (
             <>
               <MaterialCommunityIcons name="check-circle" size={20} color="white" />
               <Text className="text-white font-bold ml-2 text-lg">Start Reading</Text>
             </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onClose} disabled={isSaving} className="py-3 items-center">
          <Text className="text-stone-400 font-bold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}