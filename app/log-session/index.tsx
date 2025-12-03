// Filename: app/log-session/index.tsx
// Purpose: Handles the active reading session (Timer -> Reflection -> Atomic Save).
// FIXED: Removed all Unit/Page inputs.
// FIXED: Implemented Time-Only Reward Logic (1 Ink/min, 5 XP/min).
// FIXED: Calls 'log_session_atomic' RPC directly.

import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, AppStateStatus, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper component for timer display
function TimerDisplay({ seconds }: { seconds: number }) {
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Text className="text-7xl font-mono text-stone-800 font-bold tracking-tighter text-center my-8">
      {formatTime(seconds)}
    </Text>
  );
}

export default function LogSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookIdParam = params.bookId as string;

  // -- STATE --
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);
  
  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // UI Flow State
  const [stage, setStage] = useState<'timer' | 'reflection'>('timer');
  
  // Form State
  const [reflection, setReflection] = useState('');
  const [isFinished, setIsFinished] = useState(false); // New "Finish Book" toggle
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background Tracking Refs
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  // -- 1. FETCH DATA (Book + Companion) --
  useEffect(() => {
    async function initSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.replace('/login'); 
            return;
        }

        // A. Get Profile (to find active book & companion)
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_book_id, active_companion_id')
            .eq('id', user.id)
            .single();

        if (!profile) throw new Error("Profile not found");
        setActiveCompanionId(profile.active_companion_id);

        // B. Determine Book ID
        const targetBookId = bookIdParam || profile.active_book_id;

        if (!targetBookId) {
             Alert.alert(
              "No Active Book",
              "Please select a book from your library to start reading.",
              [{ text: "Go to Library", onPress: () => router.replace('/(tabs)/library') }]
            );
            return;
        }

        // C. Fetch Book Details (Only needed columns)
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .select('id, title, user_id, status')
            .eq('id', targetBookId)
            .single();
            
        if (bookError || !bookData) throw bookError;
        
        setBook(bookData);
        // If book is already finished, default the toggle to true? Maybe not, usually re-reading.
        
      } catch (e: any) {
        console.error("Session Init Error:", e);
        Alert.alert("Error", "Could not initialize session.");
        router.back();
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [bookIdParam]);

  // -- 2. TIMER LOGIC --
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!timerActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // -- 3. BACKGROUND TRACKING --
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [timerActive]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (timerActive && backgroundTimestamp.current) {
        const now = Date.now();
        const diff = Math.floor((now - backgroundTimestamp.current) / 1000);
        setSeconds((prev) => prev + diff);
      }
    } else if (nextAppState.match(/inactive|background/)) {
      if (timerActive) {
        backgroundTimestamp.current = Date.now();
      }
    }
    appState.current = nextAppState;
  };

  // -- 4. HANDLERS --
  const handleBack = () => {
    if (stage === 'reflection') {
      setStage('timer');
      return;
    }
    if (seconds > 0 && !isSubmitting) {
      Alert.alert(
        "End Session?",
        "Leaving now will discard this session.",
        [
          { text: "Keep Reading", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    setStage('reflection');
  };

  // -- 5. FINAL SUBMISSION (ATOMIC) --
  const handleSubmitSession = async () => {
    if (!activeCompanionId || !book) {
        Alert.alert("Error", "Missing data to save session.");
        return;
    }

    if (seconds < 60) {
        Alert.alert("Too Short", "Sessions must be at least 1 minute to count.");
        return;
    }

    setIsSubmitting(true);
    
    try {
        // --- CALC REWARDS (Time-Only) ---
        const minutes = Math.floor(seconds / 60);
        const baseXP = minutes * 5; // 5 XP per min
        const baseInk = minutes * 1; // 1 Ink per min
        
        // Bonus for meaningful reflection (> 50 chars)
        const bonusInk = reflection.length > 50 ? 20 : 0;
        
        const totalXP = baseXP;
        const totalInk = baseInk + bonusInk;

        // --- CALL RPC ---
        const { error } = await supabase.rpc('log_session_atomic', {
            p_user_id: book.user_id,
            p_book_id: book.id,
            p_active_companion_id: activeCompanionId,
            p_duration_seconds: seconds,
            p_reflection_data: { note: reflection },
            p_ink_gained: totalInk,
            p_xp_gained: totalXP,
            p_new_book_status: isFinished ? 'finished' : 'active'
        });

        if (error) throw error;

        // Success!
        Alert.alert(
            "Session Recorded!",
            `+${totalInk} Ink Drops\n+${totalXP} XP`,
            [{ text: "Awesome", onPress: () => router.replace('/(tabs)') }]
        );

    } catch (e: any) {
        console.error("Submit Error:", e);
        Alert.alert("Save Failed", e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color="#A26FD7" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-6 pb-6 pt-2">
          
          {/* Header Bar */}
          <View className="flex-row items-center justify-between mb-4 relative">
             <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 rounded-full active:bg-stone-200 z-10">
                <MaterialCommunityIcons name="arrow-left" size={28} color="#57534E" />
             </TouchableOpacity>
             <View className="absolute left-0 right-0 items-center pointer-events-none">
                <Text className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Reading Session</Text>
                <Text className="text-stone-800 font-serif font-bold text-lg" numberOfLines={1}>{book?.title}</Text>
             </View>
             <View className="w-10" />
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>

            {/* --- STAGE 1: TIMER --- */}
            {stage === 'timer' && (
              <View className="flex-1 justify-center w-full">
                <View className="items-center mb-12">
                   <TimerDisplay seconds={seconds} />
                   
                   <View className="flex-row items-center space-x-8">
                     {!timerActive ? (
                       <TouchableOpacity 
                         onPress={() => setTimerActive(true)}
                         className="bg-stone-800 w-24 h-24 rounded-full items-center justify-center shadow-xl shadow-stone-900/30"
                       >
                         <MaterialCommunityIcons name="play" size={48} color="white" style={{ marginLeft: 6 }} />
                       </TouchableOpacity>
                     ) : (
                       <TouchableOpacity 
                         onPress={() => setTimerActive(false)}
                         className="bg-white border-4 border-orange-500 w-24 h-24 rounded-full items-center justify-center shadow-xl shadow-orange-500/20"
                       >
                         <MaterialCommunityIcons name="pause" size={48} color="#F97316" />
                       </TouchableOpacity>
                     )}
                   </View>
                   
                   <Text className="mt-6 text-stone-400 font-medium tracking-wide">
                     {timerActive ? 'Focus...' : 'Ready?'}
                   </Text>
                </View>

                 <View className="mt-auto mb-4">
                   <TouchableOpacity 
                    onPress={handleStopTimer}
                    disabled={seconds < 60} // Require 1 min minimum
                    className={`w-full py-5 rounded-2xl flex-row justify-center items-center shadow-sm ${seconds < 60 ? 'bg-stone-200' : 'bg-emerald-600'}`}
                  >
                    <MaterialCommunityIcons name="check" size={24} color={seconds < 60 ? "#A8A29E" : "white"} />
                    <Text className={`font-bold text-lg ml-2 ${seconds < 60 ? 'text-stone-400' : 'text-white'}`}>
                      Finish Session
                    </Text>
                  </TouchableOpacity>
                  {seconds < 60 && seconds > 0 && <Text className="text-center text-xs text-stone-400 mt-2">Read for at least 1 minute to finish.</Text>}
                </View>
              </View>
            )}

            {/* --- STAGE 2: REFLECTION & REWARDS --- */}
            {stage === 'reflection' && (
              <View className="flex-1 w-full pt-4">
                
                {/* Time Summary */}
                <View className="bg-stone-100 p-6 rounded-3xl mb-8 flex-row justify-between items-center border border-stone-200">
                   <View>
                     <Text className="text-stone-500 text-xs uppercase font-bold mb-1">Total Time</Text>
                     <Text className="text-3xl font-mono font-bold text-stone-800">
                        {Math.floor(seconds / 60)}<Text className="text-sm font-sans font-normal text-stone-500">m</Text> {seconds % 60}<Text className="text-sm font-sans font-normal text-stone-500">s</Text>
                     </Text>
                   </View>
                   <View className="h-12 w-12 bg-white rounded-full items-center justify-center shadow-sm">
                      <MaterialCommunityIcons name="clock-check-outline" size={28} color="#EA580C" />
                   </View>
                </View>

                {/* Reflection Input */}
                <View className="mb-6 flex-1">
                   <Text className="text-stone-500 text-xs mb-2 font-bold uppercase">Active Recall (+20 Ink Bonus)</Text>
                   <TextInput 
                     value={reflection}
                     onChangeText={setReflection}
                     multiline
                     placeholder="What's one thing you want to remember from this session?"
                     className="bg-white border border-stone-200 p-4 rounded-xl text-stone-800 flex-1 text-lg leading-6 min-h-[120px]"
                     style={{ textAlignVertical: 'top' }}
                   />
                </View>

                {/* Finish Book Toggle */}
                <View className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-stone-200 mb-6 shadow-sm">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="book-check" size={24} color={isFinished ? "#059669" : "#A8A29E"} />
                        <Text className="ml-3 text-stone-700 font-bold text-base">I finished the book!</Text>
                    </View>
                    <Switch 
                        trackColor={{ false: "#E7E5E4", true: "#10B981" }}
                        thumbColor={"#FFFFFF"}
                        onValueChange={setIsFinished}
                        value={isFinished}
                    />
                </View>

                {/* Submit Actions */}
                <View className="mt-auto pb-4">
                  <TouchableOpacity 
                    onPress={handleSubmitSession}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-md mb-3 ${isSubmitting ? 'bg-stone-400' : 'bg-mainBrandColor'}`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-decagram" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Claim Rewards</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            )}

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}