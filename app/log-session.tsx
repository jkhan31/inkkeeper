import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LogSessionScreen() {
  const { bookId } = useLocalSearchParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [startUnit, setStartUnit] = useState('');
  const [endUnit, setEndUnit] = useState('');
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Book Details on Mount
  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    if (!bookId) return;
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      
      if (error) throw error;
      setBook(data);
      setStartUnit(data.current_unit?.toString() || '0'); // Pre-fill start page
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load book details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // 2. Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3. Save Session to Database
  const handleSave = async () => {
    if (!book) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Calculate Amount Read
      let amountRead = 0;
      let newCurrentUnit = book.current_unit;

      if (book.format === 'audio') {
        amountRead = Math.floor(seconds / 60); // Minutes
        newCurrentUnit = (book.current_unit || 0) + amountRead;
      } else {
        // Physical: End - Start
        const start = parseInt(startUnit) || 0;
        const end = parseInt(endUnit) || 0;
        if (end < start) throw new Error("End page cannot be less than start page.");
        amountRead = end - start;
        newCurrentUnit = end;
      }

      // A. Insert Session Log
      const { error: sessionError } = await supabase.from('sessions').insert({
        user_id: user.id,
        book_id: book.id,
        duration_seconds: seconds,
        pages_read: amountRead,
        reflection_data: reflection ? { note: reflection } : null
      });
      if (sessionError) throw sessionError;

      // B. Update Book Progress
      const { error: bookUpdateError } = await supabase
        .from('books')
        .update({ current_unit: newCurrentUnit })
        .eq('id', book.id);
      if (bookUpdateError) throw bookUpdateError;

      // C. Update User Ink (Economy)
      // Bonus: +20 for Reflection
      const bonus = reflection.length > 10 ? 20 : 0;
      const totalInk = amountRead + bonus;

      // Note: In a real app, we'd fetch current ink first, but for MVP we use a simple RPC or just update
      // For now, let's just increment locally and assume strict consistency isn't critical for MVP
      // A RPC call 'increment_ink' would be better, but let's keep it simple:
      const { data: profile } = await supabase.from('profiles').select('ink_drops').eq('id', user.id).single();
      const currentInk = profile?.ink_drops || 0;

      await supabase
        .from('profiles')
        .update({ ink_drops: currentInk + totalInk })
        .eq('id', user.id);

      Alert.alert("Session Logged!", `You earned ${totalInk} Ink Drops. 💧`, [
        { text: "Awesome", onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.error(error);
      Alert.alert("Save Failed", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-stone-900 justify-center items-center"><ActivityIndicator color="#EA580C" /></View>;
  }

  // --- VIEW: LOGGING FORM (AFTER STOP) ---
  if (showForm) {
    return (
      <SafeAreaView className="flex-1 bg-stone-100">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            
            <View className="items-center mb-8">
              <MaterialCommunityIcons name="check-circle" size={64} color="#059669" />
              <Text className="text-2xl font-serif text-stone-800 mt-4">Session Complete</Text>
              <Text className="text-stone-500">Time: {formatTime(seconds)}</Text>
            </View>

            {/* Progress Inputs */}
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6">
              <Text className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                {book.format === 'audio' ? 'Update Progress (Minutes)' : 'Update Progress (Pages)'}
              </Text>

              {book.format === 'physical' ? (
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-stone-400 mb-1">Started</Text>
                    <TextInput 
                      value={startUnit}
                      onChangeText={setStartUnit}
                      keyboardType="number-pad"
                      className="text-2xl font-bold text-stone-800 border-b border-stone-200 py-1 w-20 text-center"
                    />
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="#D6D3D1" />
                  <View>
                    <Text className="text-stone-400 mb-1">Finished</Text>
                    <TextInput 
                      value={endUnit}
                      onChangeText={setEndUnit}
                      keyboardType="number-pad"
                      className="text-2xl font-bold text-stone-800 border-b-2 border-orange-500 py-1 w-20 text-center bg-orange-50"
                      autoFocus
                      placeholder={startUnit}
                    />
                  </View>
                </View>
              ) : (
                 <Text className="text-center text-xl font-bold text-stone-800">
                   +{Math.floor(seconds / 60)} Minutes Added
                 </Text>
              )}
            </View>

            {/* Reflection */}
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs font-bold text-stone-400 uppercase tracking-widest">Reflection</Text>
                <Text className="text-xs font-bold text-orange-600">+20 Ink Bonus</Text>
              </View>
              <TextInput 
                value={reflection}
                onChangeText={setReflection}
                placeholder="What was the main idea?"
                multiline
                className="h-24 text-stone-800 text-lg"
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving}
              className="bg-stone-800 py-4 rounded-xl items-center shadow-lg"
            >
              {isSaving ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-bold text-lg">Save & Collect Ink</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- VIEW: TIMER (DEFAULT) ---
  return (
    <SafeAreaView className="flex-1 bg-stone-900 justify-between">
      
      {/* Header */}
      <View className="p-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
           <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white/70 font-bold uppercase tracking-widest text-xs">Reading Now</Text>
        <View className="w-10" />
      </View>

      {/* Main Content */}
      <View className="items-center px-8">
        <Text className="text-white text-2xl font-serif text-center font-bold mb-2">{book?.title || 'Loading...'}</Text>
        <Text className="text-white/50 text-center mb-12">{book?.author}</Text>

        <Text className="text-8xl font-mono text-white font-bold tracking-tighter mb-12">
          {formatTime(seconds)}
        </Text>

        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          className="w-24 h-24 bg-orange-600 rounded-full items-center justify-center shadow-lg shadow-orange-900/50"
        >
          <MaterialCommunityIcons 
            name={isActive ? "pause" : "play"} 
            size={40} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="p-8">
        <TouchableOpacity 
          onPress={() => { setIsActive(false); setShowForm(true); }}
          className="w-full bg-white/10 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold">Finish Session</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}