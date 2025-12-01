// app/log-session/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, AppState, AppStateStatus } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { saveReadingSession } from '@/lib/session';

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
  const bookId = params.bookId as string;

  // -- STATE --
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // UI Flow State
  const [stage, setStage] = useState<'timer' | 'input'>('timer');
  
  // Form State
  const [startUnit, setStartUnit] = useState('');
  const [endUnit, setEndUnit] = useState('');
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background Tracking Refs
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  // -- 1. FETCH BOOK DETAILS & AUTH CHECK --
  useEffect(() => {
    async function fetchBook() {
      try {
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.replace('/login'); 
            return;
        }

        let bookIdToLoad = bookId;

        if (!bookIdToLoad) {
          // Fallback: If no bookId passed, get active book from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('active_book_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.active_book_id) {
            bookIdToLoad = profile.active_book_id;
          } else {
            Alert.alert(
              "No Active Book",
              "Please select a book from your library to start reading.",
              [{ text: "Go to Library", onPress: () => router.replace('/(tabs)/library') }]
            );
            return;
          }
        }

        const { data } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookIdToLoad)
          .single();
          
        if (data) {
          setBook(data);
          const start = data.current_unit || 0;
          setStartUnit(start.toString());
        } else {
          Alert.alert("Error", "Could not find book details.");
          router.back();
        }
      } catch (e) {
        console.error("Fetch Book Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

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

  // -- 4. NAVIGATION HANDLERS --
  const handleBack = () => {
    // Stage 2 -> Stage 1
    if (stage === 'input') {
      setStage('timer');
      return;
    }

    // Confirmation if timer has started
    if (seconds > 0 && !isSubmitting) {
      Alert.alert(
        "End Session?",
        "You have a session in progress. Leaving now will discard it.",
        [
          { text: "Keep Reading", style: "cancel" },
          { text: "Discard & Exit", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // -- 5. STAGE TRANSITION (Timer -> Input) --
  const handleCompleteTimer = () => {
    setTimerActive(false); // Pause timer
    setStage('input'); // Switch UI to input mode
  };

  // -- 6. FINAL SUBMISSION --
  const handleSubmitSession = async () => {
    if (!endUnit) {
      Alert.alert("Missing Info", "Please enter where you stopped reading.");
      return;
    }

    const start = parseInt(startUnit) || 0;
    const end = parseInt(endUnit) || 0;
    
    // VALIDATION
    if (end < start) {
      Alert.alert("Invalid Input", "End page cannot be less than the start page.");
      return;
    }
    const unitsRead = end - start;
    if (unitsRead <= 0 && seconds > 60) {
        Alert.alert("Invalid Session", "You must have read at least one unit.");
        return;
    }

    setIsSubmitting(true);
    
    const result = await saveReadingSession({
      bookId: book.id,
      durationSeconds: seconds,
      unitsRead: unitsRead,
      startUnit: start,
      endUnit: end,
      reflection: reflection
    });

    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        "Session Recorded!",
        `You gained +${result.inkGained} Ink and +${result.xpGained} XP!`,
        [{ text: "Great!", onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert("Error", result.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (!book) return <View className="flex-1 bg-stone-100" />;

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-6 pb-6 pt-2">
          
          {/* Header Bar */}
          <View className="flex-row items-center justify-between mb-4 relative">
             <TouchableOpacity 
               onPress={handleBack} 
               className="p-2 -ml-2 rounded-full active:bg-stone-200 z-10"
             >
                <MaterialCommunityIcons name="arrow-left" size={28} color="#57534E" />
             </TouchableOpacity>
             
             <View className="absolute left-0 right-0 items-center pointer-events-none">
                <Text className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Reading Session</Text>
                <Text className="text-stone-800 font-serif font-bold text-lg" numberOfLines={1}>{book.title}</Text>
             </View>
             
             {/* Spacer to balance the header */}
             <View className="w-10" />
          </View>

          {/* Main Content - Flex Grow to center content vertically */}
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            showsVerticalScrollIndicator={false}
          >

            {/* --- STAGE 1: TIMER --- */}
            {stage === 'timer' && (
              <View className="flex-1 justify-center w-full">
                
                {/* Large Timer Display */}
                <View className="items-center mb-12">
                   <TimerDisplay seconds={seconds} />
                   
                   {/* Play/Pause Controls */}
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
                     {timerActive ? 'Time is ticking...' : 'Ready to start?'}
                   </Text>
                </View>

                {/* Start Unit Display/Edit */}
                <View className="w-full mb-10 flex-row justify-center items-center space-x-2">
                    <Text className="text-stone-400 font-medium">Starting on page</Text>
                    <TextInput 
                      value={startUnit}
                      onChangeText={setStartUnit}
                      keyboardType="numeric"
                      className="bg-white border border-stone-200 px-4 py-2 rounded-lg text-stone-800 font-bold text-lg text-center min-w-[80px]"
                    />
                </View>

                {/* Bottom Action Button */}
                 <View className="mt-auto mb-4">
                   <TouchableOpacity 
                    onPress={handleCompleteTimer}
                    disabled={seconds === 0}
                    className={`w-full py-5 rounded-2xl flex-row justify-center items-center shadow-sm ${seconds === 0 ? 'bg-stone-200' : 'bg-emerald-600'}`}
                  >
                    <MaterialCommunityIcons name="flag-checkered" size={24} color={seconds === 0 ? "#A8A29E" : "white"} />
                    <Text className={`font-bold text-lg ml-2 ${seconds === 0 ? 'text-stone-400' : 'text-white'}`}>
                      Complete Session
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- STAGE 2: INPUT & REFLECTION --- */}
            {stage === 'input' && (
              <View className="flex-1 w-full pt-4">
                
                {/* Summary Card */}
                <View className="bg-stone-100 p-6 rounded-3xl mb-8 flex-row justify-between items-center border border-stone-200">
                   <View>
                     <Text className="text-stone-500 text-xs uppercase font-bold mb-1">Session Time</Text>
                     <Text className="text-3xl font-mono font-bold text-stone-800">
                        {Math.floor(seconds / 60)}<Text className="text-sm font-sans font-normal text-stone-500">m</Text> {seconds % 60}<Text className="text-sm font-sans font-normal text-stone-500">s</Text>
                     </Text>
                   </View>
                   <View className="h-12 w-12 bg-white rounded-full items-center justify-center shadow-sm">
                      <MaterialCommunityIcons name="clock-check-outline" size={28} color="#EA580C" />
                   </View>
                </View>

                {/* Progress Input */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-2">
                       <Text className="text-lg font-bold text-stone-800">Progress</Text>
                       <Text className="text-stone-400 text-sm">Started at {startUnit}</Text>
                    </View>
                    
                    <View className="bg-white border-2 border-orange-500 rounded-2xl p-4 shadow-sm">
                      <Text className="text-stone-500 text-xs font-bold uppercase mb-1 text-center text-orange-600">Enter End Page</Text>
                      <TextInput 
                          value={endUnit}
                          onChangeText={setEndUnit}
                          keyboardType="numeric"
                          placeholder="???"
                          autoFocus={true}
                          className="text-stone-800 font-bold text-4xl text-center"
                        />
                    </View>
                </View>

                {/* Reflection Input */}
                <View className="mb-8 flex-1">
                   <Text className="text-stone-500 text-xs mb-2 font-bold uppercase">Quick Reflection (+20 Ink)</Text>
                   <TextInput 
                     value={reflection}
                     onChangeText={setReflection}
                     multiline
                     placeholder="What was the most interesting part?"
                     className="bg-white border border-stone-200 p-4 rounded-xl text-stone-800 flex-1 text-lg leading-6 min-h-[120px]"
                     style={{ textAlignVertical: 'top' }}
                   />
                </View>

                {/* Submit Actions */}
                <View className="mt-auto pb-4">
                  <TouchableOpacity 
                    onPress={handleSubmitSession}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-md mb-3 ${isSubmitting ? 'bg-stone-400' : 'bg-stone-900'}`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-decagram" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Submit & Claim Ink</Text>
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