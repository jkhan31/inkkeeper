import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Audio } from 'expo-av'; // Optional: for background timer logic later

export default function LogSessionScreen() {
  const params = useLocalSearchParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  // Inputs
  const [startUnit, setStartUnit] = useState('');
  
  // 1. INITIALIZATION LOGIC
  useEffect(() => {
    checkActiveBook();
  }, []);

  // Handle Backgrounding (So timer keeps running accurately)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isActive]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      if (isActive && backgroundTimestamp.current) {
        const now = Date.now();
        const diff = Math.floor((now - backgroundTimestamp.current) / 1000);
        setSeconds((prev) => prev + diff);
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background
      if (isActive) {
        backgroundTimestamp.current = Date.now();
      }
    }
    appState.current = nextAppState;
  };

  const checkActiveBook = async () => {
    try {
      // --- ROBUST DEV AUTH (Auto-Login if needed) ---
      let { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No session in Timer. Attempting Dev Login...");
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: 'demo_user@example.com', // Same email as AddBookForm
          password: 'password123'
        });
        if (!error && signInData.user) {
           user = signInData.user;
        } else {
           // Only alert if Dev Login fails too
           Alert.alert("Please Log In", "You need to be logged in to read.");
           router.replace('/'); 
           return;
        }
      }
      // ----------------------------------------------

      let bookIdToLoad = params.bookId;

      // If no book passed via params, find the Active Book from profile
      if (!bookIdToLoad) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_book_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.active_book_id) {
          bookIdToLoad = profile.active_book_id;
        } else {
          // NO ACTIVE BOOK -> Redirect to Library
          Alert.alert(
            "No Active Book",
            "Please select a book from your library to start reading.",
            [
              { text: "Go to Library", onPress: () => router.replace('/(tabs)/library') }
            ]
          );
          return;
        }
      }

      // Fetch Book Details
      const { data: bookData, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookIdToLoad)
        .single();

      if (error) throw error;
      
      setBook(bookData);
      
      // Auto-populate Start Page
      const current = bookData.current_unit || 0;
      setStartUnit(current === 0 ? '1' : current.toString());

    } catch (error) {
      console.error(error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    // Navigate to Recap/Summary Page (We will build this next)
    // For now, we pass the data via params to a "Save" screen or handle it here
    // Let's re-use the form logic for MVP, but show it in a modal or new screen?
    // PER REQUEST: "Finish session should go to a recap page"
    
    // Pause timer
    setIsActive(false);

    // TODO: Create a dedicated Recap Screen. 
    // For this step, let's keep it simple: Show an Alert or navigate to a recap route
    // We will calculate end page here just for passing data
    const start = parseInt(startUnit) || 0;
    
    Alert.alert(
        "Finish Session?", 
        "Are you done reading?",
        [
            { text: "Cancel", style: "cancel", onPress: () => setIsActive(true) }, // Resume
            { text: "Finish", onPress: () => {
                // In Phase 2 Step 5, we will make a dedicated /recap route.
                // For now, let's keep using the internal state form, but we'll refactor later.
                // But wait, user requested: "Finish session should go to a recap page"
                // Let's mimic that by showing the "Save Form" we built previously, but styled better.
                setShowSaveForm(true); 
            }}
        ]
    );
  };

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [endUnit, setEndUnit] = useState('');
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submitSession = async () => {
    if (!book) return;
    setIsSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        let amountRead = 0;
        let newCurrentUnit = book.current_unit;

        if (book.format === 'audio') {
            amountRead = Math.floor(seconds / 60);
            newCurrentUnit = (book.current_unit || 0) + amountRead;
        } else {
            const start = parseInt(startUnit) || 0;
            const end = parseInt(endUnit) || 0;
            if (end < start) {
                Alert.alert("Error", "End page cannot be before start page.");
                setIsSaving(false);
                return;
            }
            amountRead = end - start;
            newCurrentUnit = end;
        }

        // Save to DB
        await supabase.from('sessions').insert({
            user_id: user.id,
            book_id: book.id,
            duration_seconds: seconds,
            pages_read: amountRead,
            reflection_data: reflection ? { note: reflection } : null
        });

        // Update Book
        await supabase.from('books').update({ current_unit: newCurrentUnit }).eq('id', book.id);

        // Update Ink (Simple increment)
        const bonus = reflection.length > 10 ? 20 : 0;
        const totalInk = amountRead + bonus;
        
        const { data: profile } = await supabase.from('profiles').select('ink_drops').eq('id', user.id).single();
        await supabase.from('profiles').update({ ink_drops: (profile?.ink_drops || 0) + totalInk }).eq('id', user.id);

        // Success
        router.replace('/(tabs)/');
        Alert.alert("Session Saved!", `+${totalInk} Ink Earned`);

    } catch (err: any) {
        Alert.alert("Error", err.message);
    } finally {
        setIsSaving(false);
    }
  }

  if (loading) {
    return <View className="flex-1 bg-stone-100 justify-center items-center"><ActivityIndicator color="#EA580C" /></View>;
  }

  // --- SAFETY GUARD (Add this block) ---
  // If we finished loading but found no book (e.g. while showing the "No Book" alert),
  // don't try to render the rest of the UI, or it will crash.
  if (!book) {
    return <View className="flex-1 bg-stone-100" />;
  }
  // ------------------------------------

  


  // --- RECAP / SAVE FORM (Temporary "Page" Overlay) ---
  if (showSaveForm) {
      return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-6 flex-1">
                <Text className="text-2xl font-serif text-stone-800 mb-6 text-center">Session Recap</Text>
                
                <View className="bg-stone-50 p-6 rounded-2xl mb-6 items-center">
                    <Text className="text-stone-500 uppercase text-xs font-bold tracking-widest mb-2">Time Read</Text>
                    <Text className="text-4xl font-mono text-stone-800 font-bold">{formatTime(seconds)}</Text>
                </View>

                {book.format === 'physical' && (
                    <View className="mb-6">
                        <Text className="text-stone-500 mb-2">Started at Page {startUnit}. Ended at?</Text>
                        <TextInput 
                            value={endUnit}
                            onChangeText={setEndUnit}
                            keyboardType="number-pad"
                            placeholder={(parseInt(startUnit) + 10).toString()}
                            className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-2xl font-bold text-center text-stone-800"
                            autoFocus
                        />
                    </View>
                )}

                <View className="flex-1">
                    <Text className="text-stone-500 mb-2">Quick Reflection (+20 Ink)</Text>
                    <TextInput 
                        value={reflection}
                        onChangeText={setReflection}
                        placeholder="What stuck with you?"
                        multiline
                        className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex-1 text-lg text-stone-800"
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity 
                    onPress={submitSession}
                    disabled={isSaving}
                    className="bg-stone-800 py-4 rounded-xl items-center mt-6"
                >
                    {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Session</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      );
  }

  // --- MAIN TIMER UI ---
  return (
    <SafeAreaView className="flex-1 bg-stone-100 justify-between">
      
      {/* Header / Top Section */}
      <View className="p-6 items-center z-10">
        <Text className="text-stone-500 font-bold uppercase tracking-widest text-xs mb-4">Reading</Text>
        <Text className="text-2xl font-serif text-stone-800 text-center font-bold">{book.title}</Text>
        <Text className="text-stone-500 text-sm mt-1">{book.author}</Text>
      </View>

      {/* Center: Timer & Input */}
      <View className="items-center justify-center flex-1">
        
        {/* Start Page Input */}
        {book.format === 'physical' && (
            <View className="flex-row items-center mb-8 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <Text className="text-stone-400 mr-2 text-sm">Starting Page:</Text>
                <TextInput 
                    value={startUnit}
                    onChangeText={setStartUnit}
                    keyboardType="number-pad"
                    className="text-stone-800 font-bold text-lg w-16 text-center border-b border-stone-200"
                />
                <MaterialCommunityIcons name="pencil" size={14} color="#A8A29E" className="ml-2" />
            </View>
        )}

        {/* BIG TIMER */}
        <Text className="text-7xl font-mono text-stone-800 font-bold tracking-tighter mb-12">
          {formatTime(seconds)}
        </Text>

        {/* Start/Pause Button */}
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          className={`w-24 h-24 rounded-full items-center justify-center shadow-xl border-4 border-white ${isActive ? 'bg-stone-800' : 'bg-orange-600'}`}
        >
          <MaterialCommunityIcons 
            name={isActive ? "pause" : "play"} 
            size={42} 
            color="white" 
            style={{ marginLeft: isActive ? 0 : 4 }} // visual center correction
          />
        </TouchableOpacity>
        
        <Text className="text-stone-400 mt-4 text-sm font-medium">
            {isActive ? "Reading in progress..." : "Tap to Start"}
        </Text>

      </View>

      {/* Footer: Finish Button */}
      <View className="p-6 w-full">
        <TouchableOpacity 
          onPress={handleFinish}
          className="w-full bg-white border-2 border-stone-200 py-4 rounded-xl items-center flex-row justify-center active:bg-stone-50"
        >
          <MaterialCommunityIcons name="stop-circle-outline" size={24} color="#57534E" className="mr-2" />
          <Text className="text-stone-700 font-bold text-lg">Finish Session</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}