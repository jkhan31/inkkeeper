// Filename: app/onboarding/index.tsx
// Directory: app/onboarding/
// Purpose: Handles the user's initial setup (Goal setting, Companion naming).
// FIXED: Updates imports to point to root ../../lib and ../../utils
// FIXED: Implements v6.0 Time-Only logic (minutes).
// FIXED: Removed missing 'refreshSessionAndProfile' dependency; uses native session refresh.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase'; // FIXED: Points to root lib
import { cn } from '../../utils/cn'; // FIXED: Points to root utils

// --- Constants ---
const FORMAT_OPTIONS = [
    { label: "Physical Book", value: "physical", icon: "book-open-page-variant" },
    { label: "Audiobook", value: "audio", icon: "headphones" },
];

const MIN_GOAL = 10;
const MAX_GOAL = 120;

export default function OnboardingScreen() {
    // Stage 1: Goal Setting (Simplified to minutes)
    const [dailyGoal, setDailyGoal] = useState('20');
    const [preferredFormat, setPreferredFormat] = useState('physical');

    // Stage 2: Naming Companion
    const [companionNickname, setCompanionNickname] = useState('');

    const [currentStage, setCurrentStage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);


    const handleGoalSubmission = () => {
        const goalAmount = parseInt(dailyGoal);
        if (isNaN(goalAmount) || goalAmount < MIN_GOAL || goalAmount > MAX_GOAL) {
            Alert.alert("Goal Error", `Please set a goal between ${MIN_GOAL} and ${MAX_GOAL} minutes.`);
            return;
        }
        setCurrentStage(2);
    };

    /**
     * @function handleFinalSubmission
     * @description Calls the simplified RPC to create the profile and companion atomically.
     */
    const handleFinalSubmission = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !companionNickname.trim()) {
            Alert.alert("Error", "Please provide a name for your Companion.");
            return;
        }

        setIsLoading(true);

        try {
            // --- CRITICAL RPC CALL (Simplified Contract) ---
            // RPC now only expects amount, format, and nickname (no unit)
            const { error: rpcError } = await supabase.rpc('create_initial_companion', {
                p_user_id: user.id,
                p_daily_goal_amount: parseInt(dailyGoal),
                p_preferred_format: preferredFormat,
                p_nickname: companionNickname.trim(),
            });

            if (rpcError) throw rpcError;

            // CRITICAL FIX: Refresh the session to trigger any auth state listeners in _layout.tsx
            // This replaces the missing 'refreshSessionAndProfile' utility.
            await supabase.auth.refreshSession();

            // Redirect to the main app tabs
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error("Onboarding RPC Failed:", error);
            Alert.alert("Setup Failed", `Could not finish setup. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [dailyGoal, preferredFormat, companionNickname]);

    // --- UI Rendering ---

    const renderStage1 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-8 text-center">Set Your Daily Ritual</Text>

            {/* Goal Input (Simplified to Minutes) */}
            <Text className="text-lg font-bold text-sumiInk mb-2">My Daily Reading Goal (Minutes)</Text>
            <TextInput
                className="w-full p-4 rounded-xl border border-stone-300 mb-6 bg-white text-sumiInk text-xl font-sans text-center"
                placeholder="20"
                placeholderTextColor="#A1A1AA"
                onChangeText={setDailyGoal}
                value={dailyGoal}
                keyboardType="numeric"
            />
            <Text className="text-sm text-stone-500 mb-8">
                We'll track your reading by time spent. Start small!
            </Text>

            {/* Reading Format Selector (REMAINS for BI) */}
            <Text className="text-lg font-bold text-sumiInk mb-4">What's your primary reading format?</Text>
            <View className="flex-row justify-center mb-10 w-full">
                {FORMAT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setPreferredFormat(option.value)}
                        className={cn(
                            "p-4 rounded-xl items-center flex-1 mx-2 border",
                            preferredFormat === option.value ? "border-mainBrandColor bg-mainBrandColor/10" : "border-stone-300 bg-white"
                        )}
                    >
                        <MaterialCommunityIcons 
                            name={option.icon as any} 
                            size={30} 
                            color={preferredFormat === option.value ? '#A26FD7' : '#414382'}
                        />
                        <Text className="text-sm font-bold text-sumiInk mt-2">{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                onPress={handleGoalSubmission}
                className="w-full p-5 rounded-xl shadow-lg bg-cinnabarRed items-center"
            >
                <Text className="text-center text-white text-xl font-bold">Next: Meet Your Companion</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStage2 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-8 text-center">Name Your Kitsune</Text>

            {/* Companion Visual Placeholder */}
            <View className="w-36 h-36 bg-stone-200 rounded-full items-center justify-center mb-8 border-4 border-white shadow-md">
                <MaterialCommunityIcons name="dog-side" size={60} color="#8E89AD" />
            </View>

            <Text className="text-lg font-bold text-sumiInk mb-2">Companion Nickname</Text>
            <TextInput
                className="w-full p-4 rounded-xl border border-stone-300 mb-8 bg-white text-sumiInk text-xl font-sans text-center"
                placeholder="Ember, Kaito, etc."
                placeholderTextColor="#A1A1AA"
                onChangeText={setCompanionNickname}
                value={companionNickname}
                maxLength={20}
            />

            <TouchableOpacity
                onPress={handleFinalSubmission}
                disabled={isLoading}
                className={cn(
                    "w-full p-5 rounded-xl shadow-lg items-center",
                    isLoading ? "bg-stone-400" : "bg-cinnabarRed"
                )}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text className="text-center text-white text-xl font-bold">Start Your Journey</Text>
                )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setCurrentStage(1)} className="mt-4">
                <Text className="text-sm text-stone-500 underline">Back to Goal</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-ricePaper">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                {currentStage === 1 ? renderStage1() : renderStage2()}
            </ScrollView>
        </SafeAreaView>
    );
}