// Filename: app/onboarding/index.tsx
// Directory: app/onboarding/
// Purpose: 5-stage onboarding flow capturing reading behaviors, goals, format, commitment, and companion naming.
// FIXED: Updated to collect user's timezone from device, uses golden_bookmarks terminology.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';

// --- Constants ---
const FORMAT_OPTIONS = [
    { label: "Physical Book", value: "physical", icon: "book-open-page-variant" },
    { label: "Audiobook", value: "audio", icon: "headphones" },
];

const READING_BEHAVIORS = [
    { id: 'casual', label: "Casual Reader", description: "Read for pleasure when I have time", icon: "book" },
    { id: 'regular', label: "Regular Reader", description: "Try to read a few times a week", icon: "book-multiple" },
    { id: 'avid', label: "Avid Reader", description: "Reading is a central part of my life", icon: "bookshelf" },
];

const GOALS = [
    { id: 'habit', label: "Build a reading habit", description: "Establish consistent reading routines", icon: "fire" },
    { id: 'knowledge', label: "Improve knowledge retention", description: "Remember and apply what I read", icon: "brain" },
    { id: 'track', label: "Track my reading", description: "Keep records of books and progress", icon: "chart-line" },
    { id: 'discover', label: "Discover new books", description: "Find recommendations and explore genres", icon: "compass" },
];

const COMMITMENT_OPTIONS = [
    { label: "10 minutes/day", value: 10, icon: "clock-outline" },
    { label: "30 minutes/day", value: 30, icon: "clock-outline" },
    { label: "60 minutes/day", value: 60, icon: "clock-outline" },
    { label: "Custom", value: 0, icon: "pencil" },
];

const MIN_GOAL = 10;
const MAX_GOAL = 120;

export default function OnboardingScreen() {
    // Stage 1: Reading Behaviors
    const [readingBehavior, setReadingBehavior] = useState<string | null>(null);

    // Stage 2: Goals
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    // Stage 3: Format Preference
    const [preferredFormat, setPreferredFormat] = useState('physical');

    // Stage 4: Daily Commitment
    const [dailyGoal, setDailyGoal] = useState('30');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Stage 5: Companion Naming
    const [companionNickname, setCompanionNickname] = useState('');

    // Auto-detected timezone
    const [timezone, setTimezone] = useState<string>('UTC');

    const [currentStage, setCurrentStage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Detect timezone on mount
    useEffect(() => {
        try {
            // Use native Intl API to get timezone
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            setTimezone(tz);
        } catch (e) {
            console.warn("Could not detect timezone, defaulting to UTC");
            setTimezone('UTC');
        }
    }, []);


    // Handlers for each stage
    const handleReadingBehaviorSelect = (behavior: string) => {
        setReadingBehavior(behavior);
        setCurrentStage(2);
    };

    const handleGoalToggle = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    const handleGoalsSubmit = () => {
        if (selectedGoals.length === 0) {
            Alert.alert("Select Goals", "Please select at least one goal.");
            return;
        }
        setCurrentStage(3);
    };

    const handleFormatSubmit = () => {
        setCurrentStage(4);
    };

    const handleCommitmentSubmit = () => {
        const goalAmount = parseInt(dailyGoal);
        if (isNaN(goalAmount) || goalAmount < MIN_GOAL || goalAmount > MAX_GOAL) {
            Alert.alert("Commitment Error", `Please set a goal between ${MIN_GOAL} and ${MAX_GOAL} minutes.`);
            return;
        }
        setCurrentStage(5);
    };

    /**
     * @function handleFinalSubmission
     * @description Calls the RPC to create the profile, companion, and initialize onboarding data.
     */
    const handleFinalSubmission = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !companionNickname.trim()) {
            Alert.alert("Error", "Please provide a name for your companion.");
            return;
        }

        setIsLoading(true);

        try {
            // --- RPC CALL ---
            // Create profile with all onboarding data + auto-detected timezone
            const { error: rpcError } = await supabase.rpc('create_initial_companion', {
                p_user_id: user.id,
                p_daily_goal_amount: parseInt(dailyGoal),
                p_preferred_format: preferredFormat,
                p_nickname: companionNickname.trim(),
                p_timezone: timezone,
                // Optional: could include reading_behavior and goals as JSONB if backend supports
            });

            if (rpcError) throw rpcError;

            // Wait a moment for the database to be updated
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verify the companion was created by checking the profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('active_companion_id')
                .eq('id', user.id)
                .single();

            if (!profileData?.active_companion_id) {
                throw new Error('Companion was not created successfully');
            }

            // Refresh the session to trigger auth state listeners
            await supabase.auth.refreshSession();

            // Redirect to the main app tabs
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error("Onboarding RPC Failed:", error);
            Alert.alert("Setup Failed", `Could not finish setup. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [dailyGoal, preferredFormat, companionNickname, timezone]);

    // --- UI Rendering ---

    const renderStage1 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-4 text-center">How Do You Read?</Text>
            <Text className="text-stone-500 text-sm mb-8 text-center">Let's start by understanding your reading style</Text>

            <View className="w-full space-y-3">
                {READING_BEHAVIORS.map((behavior) => (
                    <TouchableOpacity
                        key={behavior.id}
                        onPress={() => handleReadingBehaviorSelect(behavior.id)}
                        className="bg-white p-4 rounded-xl border-2 border-stone-200 active:border-mainBrandColor shadow-sm"
                    >
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-stone-100 rounded-full items-center justify-center mr-3">
                                <MaterialCommunityIcons name={behavior.icon as any} size={24} color="#A26FD7" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-sumiInk">{behavior.label}</Text>
                                <Text className="text-xs text-stone-500 mt-1">{behavior.description}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStage2 = () => (
        <View className="flex-1 p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-4 text-center">What Are Your Goals?</Text>
            <Text className="text-stone-500 text-sm mb-6 text-center">Select what matters most to you (choose multiple)</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-6">
                {GOALS.map((goal) => (
                    <TouchableOpacity
                        key={goal.id}
                        onPress={() => handleGoalToggle(goal.id)}
                        className={cn(
                            "p-4 rounded-xl border-2 mb-3 shadow-sm flex-row items-center",
                            selectedGoals.includes(goal.id)
                                ? "bg-mainBrandColor/10 border-mainBrandColor"
                                : "bg-white border-stone-200"
                        )}
                    >
                        <View className={cn(
                            "w-6 h-6 rounded-full border-2 mr-3 items-center justify-center",
                            selectedGoals.includes(goal.id)
                                ? "bg-mainBrandColor border-mainBrandColor"
                                : "border-stone-300"
                        )}>
                            {selectedGoals.includes(goal.id) && (
                                <MaterialCommunityIcons name="check" size={16} color="white" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={cn(
                                "font-bold",
                                selectedGoals.includes(goal.id) ? "text-mainBrandColor" : "text-sumiInk"
                            )}>{goal.label}</Text>
                            <Text className="text-xs text-stone-500 mt-1">{goal.description}</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={goal.icon as any}
                            size={20}
                            color={selectedGoals.includes(goal.id) ? "#A26FD7" : "#A8A29E"}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                onPress={handleGoalsSubmit}
                className="w-full p-5 rounded-xl shadow-lg bg-cinnabarRed items-center"
            >
                <Text className="text-center text-white text-lg font-bold">Next: Reading Format</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStage3 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-2 text-center">How Do You Like to Read?</Text>
            <Text className="text-stone-500 text-sm mb-8 text-center">Choose your primary reading format</Text>

            <View className="w-full mb-8">
                {FORMAT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setPreferredFormat(option.value)}
                        className={cn(
                            "p-4 rounded-xl border-2 mb-3 shadow-sm flex-row items-center",
                            preferredFormat === option.value
                                ? "bg-mainBrandColor/10 border-mainBrandColor"
                                : "bg-white border-stone-200"
                        )}
                    >
                        <MaterialCommunityIcons
                            name={option.icon as any}
                            size={32}
                            color={preferredFormat === option.value ? "#A26FD7" : "#A8A29E"}
                            style={{ marginRight: 16 }}
                        />
                        <Text className={cn(
                            "text-lg font-bold flex-1",
                            preferredFormat === option.value ? "text-mainBrandColor" : "text-sumiInk"
                        )}>{option.label}</Text>
                        {preferredFormat === option.value && (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#A26FD7" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                    onPress={() => setCurrentStage(2)}
                    className="flex-1 p-4 rounded-xl border-2 border-stone-300 items-center"
                >
                    <Text className="text-stone-600 font-bold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleFormatSubmit}
                    className="flex-1 p-4 rounded-xl shadow-lg bg-cinnabarRed items-center"
                >
                    <Text className="text-white font-bold">Next: Commitment</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStage4 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-2 text-center">Daily Reading Goal</Text>
            <Text className="text-stone-500 text-sm mb-8 text-center">How long can you commit to reading each day?</Text>

            <View className="w-full mb-8">
                {COMMITMENT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                            if (option.value === 0) {
                                setShowCustomInput(true);
                            } else {
                                setShowCustomInput(false);
                                setDailyGoal(option.value.toString());
                            }
                        }}
                        className={cn(
                            "p-4 rounded-xl border-2 mb-3 shadow-sm flex-row items-center",
                            dailyGoal === option.value.toString() && !showCustomInput
                                ? "bg-mainBrandColor/10 border-mainBrandColor"
                                : showCustomInput && option.value === 0
                                    ? "bg-mainBrandColor/10 border-mainBrandColor"
                                    : "bg-white border-stone-200"
                        )}
                    >
                        <MaterialCommunityIcons
                            name={option.icon as any}
                            size={28}
                            color={(dailyGoal === option.value.toString() && !showCustomInput) || (showCustomInput && option.value === 0)
                                ? "#A26FD7"
                                : "#A8A29E"}
                            style={{ marginRight: 12 }}
                        />
                        <Text className={cn(
                            "text-lg font-bold flex-1",
                            (dailyGoal === option.value.toString() && !showCustomInput) || (showCustomInput && option.value === 0)
                                ? "text-mainBrandColor"
                                : "text-sumiInk"
                        )}>{option.label}</Text>
                        {((dailyGoal === option.value.toString() && !showCustomInput) || (showCustomInput && option.value === 0)) && (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#A26FD7" />
                        )}
                    </TouchableOpacity>
                ))}

                {showCustomInput && (
                    <View className="mt-4 p-4 rounded-xl bg-stone-50 border-2 border-stone-200">
                        <Text className="text-sm font-bold text-sumiInk mb-2">Enter custom minutes:</Text>
                        <TextInput
                            className="bg-white p-3 rounded-lg border border-stone-300 text-sumiInk text-lg font-bold text-center"
                            placeholder="30"
                            placeholderTextColor="#A1A1AA"
                            onChangeText={setDailyGoal}
                            value={dailyGoal}
                            keyboardType="numeric"
                        />
                    </View>
                )}
            </View>

            <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                    onPress={() => setCurrentStage(3)}
                    className="flex-1 p-4 rounded-xl border-2 border-stone-300 items-center"
                >
                    <Text className="text-stone-600 font-bold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleCommitmentSubmit}
                    className="flex-1 p-4 rounded-xl shadow-lg bg-cinnabarRed items-center"
                >
                    <Text className="text-white font-bold">Next: Name Your Fox</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStage5 = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Text className="text-3xl font-serif text-sumiInk font-bold mb-2 text-center">Meet Your Reading Companion</Text>
            <Text className="text-stone-500 text-sm mb-8 text-center">Your fox will grow with you as you read</Text>

            {/* Fox Icon */}
            <View className="w-40 h-40 bg-gradient-to-b from-orange-100 to-orange-50 rounded-full items-center justify-center mb-8 border-4 border-orange-300 shadow-lg">
                <MaterialCommunityIcons name="dog" size={100} color="#EA580C" />
            </View>

            <Text className="text-lg font-bold text-sumiInk mb-3">What's your fox's name?</Text>
            <TextInput
                className="w-full p-4 rounded-xl border-2 border-stone-300 mb-8 bg-white text-sumiInk text-xl font-bold text-center"
                placeholder="e.g. Ember, Rusty, Sora..."
                placeholderTextColor="#A1A1AA"
                onChangeText={setCompanionNickname}
                value={companionNickname}
                maxLength={20}
            />

            <Text className="text-xs text-stone-500 text-center mb-8">Your {companionNickname || 'fox'} will be your reading companion. Level it up as you build your reading habit!</Text>

            <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                    onPress={() => setCurrentStage(4)}
                    className="flex-1 p-4 rounded-xl border-2 border-stone-300 items-center"
                >
                    <Text className="text-stone-600 font-bold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleFinalSubmission}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 p-4 rounded-xl shadow-lg items-center",
                        isLoading ? "bg-stone-400" : "bg-cinnabarRed"
                    )}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold">Start Your Journey</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-ricePaper">
            {/* Close button */}
            <View className="absolute top-0 right-0 z-10 p-4">
                <TouchableOpacity
                    onPress={() => router.replace('/login')}
                    className="w-10 h-10 rounded-full bg-stone-200 items-center justify-center"
                >
                    <MaterialCommunityIcons name="close" size={24} color="#78716C" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                {currentStage === 1 && renderStage1()}
                {currentStage === 2 && renderStage2()}
                {currentStage === 3 && renderStage3()}
                {currentStage === 4 && renderStage4()}
                {currentStage === 5 && renderStage5()}
            </ScrollView>
        </SafeAreaView>
    );
}