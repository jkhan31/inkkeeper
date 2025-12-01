// Filename: app/onboarding/index.tsx
// Directory: app/onboarding/
// Purpose: Multi-step form to collect user's initial commitment goal and companion nickname.
//          This screen is guarded by app/_layout.tsx and runs immediately after sign-up.

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // Client instance for connecting to Supabase Auth/DB (Path: app/lib/supabase)
import { cn } from '../utils/cn'; // Utility function for conditionally joining Tailwind classes (Path: app/utils/cn)

// --- Data & Constants ---
type Format = 'physical' | 'audio';
type Unit = 'pages' | 'minutes';
type Goal = { amount: number; description: string; };

// Defines the fixed options for goals based on the unit type
const GOAL_OPTIONS: Record<Unit, Goal[]> = {
  pages: [
    { amount: 5, description: "Casual Keeper (Slow & steady)" },
    { amount: 20, description: "Regular Reader (Moderate challenge)" },
    { amount: 50, description: "Scholar (High commitment required)" },
  ],
  minutes: [
    { amount: 15, description: "Casual Listener (Slow & steady)" },
    { amount: 30, description: "Regular Listener (Moderate challenge)" },
    { amount: 60, description: "Dedicated Listener (High commitment required)" },
  ],
};

// --- Main Component ---
export default function OnboardingScreen() {
  // State for managing form steps
  const [step, setStep] = useState(1);
  // State for collecting final submission data
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit>('pages'); 
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false); // Loading state for RPC call

  // Derived property: determines if the user is tracking by pages or minutes
  const derivedUnit: Unit = (selectedFormat === 'audio') ? 'minutes' : selectedUnit;

  // Handlers for step navigation and input selection
  const handleFormatSelect = (format: Format) => {
    setSelectedFormat(format);
    if (format === 'audio') {
      setSelectedUnit('minutes');
      setStep(3); // Skip Step 2 (Measure)
    } else {
      setSelectedUnit('pages'); // Reset to pages for physical
      setStep(2);
    }
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    setStep(3);
  };
  
  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setStep(4); // Move to nickname selection
  };
  
  /**
   * Handles navigation backwards, adjusting for the skipped step (audio).
   * Also ensures the user cannot easily exit the flow until setup is complete.
   */
  const handleBack = () => {
    if (step > 1) {
      // Logic for backing up specific steps
      if (step === 3 && selectedFormat === 'audio') {
        setStep(1); // If audio was selected, skip back to format selection
      } else {
        setStep(step - 1);
      }
    } else {
      // On the first step, allow user to go back to login selection
      router.back(); 
    }
  }

  /**
   * Final submission function that calls the create_initial_companion RPC.
   * This is the final step of the entire Onboarding flow, linking the Companion and the Goal.
   */
  const handleFinalSubmit = useCallback(async () => {
    if (!selectedGoal || !nickname.trim() || !selectedFormat) {
      Alert.alert("Missing Input", "Please complete all steps.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Ensure user session is available before proceeding
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Session Error", "Please log in again.");
        router.replace('/login');
        return;
      }

      // --- CRITICAL RPC CALL: Create Companion and Link Profile ---
      // This is the server-side function that creates the Companion record and updates the Profile atomically.
      const { error: companionError } = await supabase.rpc('create_initial_companion', {
          p_user_id: user.id, // The authenticated user's ID
          p_daily_goal_amount: selectedGoal.amount,
          p_daily_goal_unit: derivedUnit,
          p_preferred_format: selectedFormat,
          p_nickname: nickname.trim(), // User's chosen nickname
      });

      if (companionError) throw companionError;

      // SUCCESS: Navigate to the main app tabs (This is the final step of Day 1)
      Alert.alert("Welcome, Keeper!", `Your Companion, ${nickname.trim()}, has been summoned. Tend to your mind.`);
      router.replace('/(tabs)'); 

    } catch (error: any) {
      console.error("Onboarding Save Error:", error);
      Alert.alert("Error", "Could not complete setup. Please check console or try again.");
    } finally {
      setIsSaving(false);
    }
  }, [selectedGoal, nickname, derivedUnit, selectedFormat]);

  // --- Helper Components ---
  const BackButton = () => (
    <TouchableOpacity onPress={handleBack} className="p-2 absolute top-12 left-6 z-10">
      <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
    </TouchableOpacity>
  );

  const OptionCard = ({ icon, title, subtitle, isSelected, onPress }: { icon: string, title: string, subtitle: string, isSelected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isSaving}
      className={cn(
        "bg-white p-6 rounded-xl border-2 mb-4 w-full shadow-md",
        isSelected ? "border-cinnabar shadow-cinnabar/30" : "border-stone-200"
      )}
    >
      <MaterialCommunityIcons name={icon} size={30} color={isSelected ? '#DC2626' : '#1F2937'} className="mb-2" />
      <Text className="text-xl font-serif text-sumiInk font-bold mb-1">{title}</Text>
      <Text className="text-stone-500 font-sans text-sm">{subtitle}</Text>
    </TouchableOpacity>
  );
  
  const GoalCard = ({ goal, isSelected, onPress }: { goal: Goal, isSelected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isSaving}
      className={cn(
        "bg-white p-4 rounded-xl border-2 mb-3 w-full items-center shadow-md",
        isSelected ? "border-cinnabar shadow-cinnabar/30" : "border-stone-200"
      )}
    >
      <Text className="text-3xl font-serif text-sumiInk font-bold">{goal.amount}</Text>
      <Text className="text-stone-500 font-sans text-sm mt-1">{derivedUnit.toUpperCase()}</Text>
      <Text className="text-base font-sans text-sumiInk mt-2 text-center">{goal.description}</Text>
    </TouchableOpacity>
  );

  // --- Step Rendering Functions ---
  const renderStep1 = () => (
    <View>
      <OptionCard
        icon="book-open-page-variant"
        title="Physical / E-Reader"
        subtitle="I track by page number or percentage."
        isSelected={selectedFormat === 'physical'}
        onPress={() => handleFormatSelect('physical')}
      />
      <OptionCard
        icon="headphones"
        title="Audiobook"
        subtitle="I track by time (minutes/hours)."
        isSelected={selectedFormat === 'audio'}
        onPress={() => handleFormatSelect('audio')}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-base text-stone-500 font-sans mb-6 text-center">
        You chose **Physical**. Track by **Pages** or **Minutes**?
      </Text>
      <OptionCard
        icon="ruler"
        title="Pages Read"
        subtitle="Progress tied to physical movement through the book."
        isSelected={selectedUnit === 'pages'}
        onPress={() => handleUnitSelect('pages')}
      />
      <OptionCard
        icon="timer-outline"
        title="Minutes Read"
        subtitle="Progress tied purely to duration (reading sprints)."
        isSelected={selectedUnit === 'minutes'}
        onPress={() => handleUnitSelect('minutes')}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-base text-stone-500 font-sans mb-6 text-center">
        What is your **Daily Commitment**?
      </Text>
      {GOAL_OPTIONS[derivedUnit].map(goal => (
        <GoalCard
          key={goal.amount}
          goal={goal}
          isSelected={selectedGoal?.amount === goal.amount}
          onPress={() => handleGoalSelect(goal)}
        />
      ))}
    </View>
  );
  
  const renderStep4 = () => (
    <View className="items-center">
      <Text className="text-base text-stone-500 font-sans mb-6 text-center">
        Your companion, the Fox, awaits its name.
      </Text>
      <MaterialCommunityIcons name="paw" size={80} color="#DC2626" className="mb-6"/>

      <TextInput
        className="w-full p-4 text-center text-2xl border-2 border-stone-300 rounded-xl mb-8 bg-white text-sumiInk font-serif"
        placeholder="Choose a Nickname"
        placeholderTextColor="#A1A1AA"
        value={nickname}
        onChangeText={setNickname}
        maxLength={20}
        autoFocus
      />

      <TouchableOpacity
        onPress={handleFinalSubmit}
        disabled={isSaving || !nickname.trim()}
        className={cn(
          "w-full p-4 rounded-xl shadow-lg",
          isSaving || !nickname.trim() ? "bg-stone-400" : "bg-emerald-600"
        )}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-center text-white text-xl font-bold">
            Forge the Path & Summon Companion
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // --- Main Layout ---
  // Controls the main title based on the current step
  let title = "";
  if (step === 1) title = "Step 1: The Medium";
  if (step === 2) title = "Step 2: The Measure";
  if (step === 3) title = "Step 3: The Path";
  if (step === 4) title = "Step 4: The Companion's Name";

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1"
    >
      <View className="flex-1 bg-ricePaper">
        {step > 1 && <BackButton />}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="p-6 pt-20"
        >
          <View className="items-center mb-8">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-2">The Keeper's Oath</Text>
            <Text className="text-lg font-sans text-stone-500">Define your sacred reading journey.</Text>
          </View>

          <View className="w-full">
            <Text className="text-2xl font-serif text-sumiInk font-bold mb-6">{title}</Text>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}