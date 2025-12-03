// Filename: app/(tabs)/profile.tsx
// Purpose: Displays user profile, stats, and settings.
// FIXED: Removed 'created_at' from DB query (it doesn't exist in public.profiles).
// FIXED: Uses 'user.created_at' from Auth metadata instead.

import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalMinutes: 0, sessions: 0 });

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      // 1. Fetch Profile 
      // CRITICAL FIX: Ensure 'created_at' is NOT in this string below!
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('ink_drops, active_companion_id, email, daily_goal_amount')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Fetch Time Stats (Time-Only Logic)
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('duration_seconds');
        
      if (sessionError) throw sessionError;

      const totalSecs = sessionData?.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) || 0;

      // 3. Set State (Merge Auth data with Profile data)
      // We use user.created_at because the public.profiles table doesn't have it.
      setProfile({
        ...profileData,
        created_at: user.created_at 
      });

      setStats({
        totalMinutes: Math.floor(totalSecs / 60),
        sessions: sessionData?.length || 0
      });

    } catch (error: any) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        Alert.alert("Error Signing Out", error.message);
    } else {
        router.replace('/login');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-ricePaper">
        <ActivityIndicator size="large" color="#A26FD7" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ricePaper">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header Section */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-stone-200 rounded-full items-center justify-center mb-4 border-2 border-stone-300">
             <MaterialCommunityIcons name="account" size={50} color="#8E89AD" />
          </View>
          <Text className="text-2xl font-serif text-sumiInk font-bold">{profile?.email?.split('@')[0] || 'Keeper'}</Text>
          <Text className="text-sm text-stone-500">Keeper since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2025'}</Text>
        </View>

        {/* Stats Grid (Time-Only) */}
        <View className="flex-row justify-between mb-8">
            <View className="bg-white p-4 rounded-xl flex-1 mr-2 items-center shadow-sm">
                <Text className="text-3xl font-bold text-mainBrandColor">{stats.totalMinutes}</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-wider">Minutes Read</Text>
            </View>
            <View className="bg-white p-4 rounded-xl flex-1 ml-2 items-center shadow-sm">
                <Text className="text-3xl font-bold text-mainBrandColor">{profile?.ink_drops || 0}</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-wider">Ink Drops</Text>
            </View>
        </View>

        {/* Settings / Actions List */}
        <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
             {/* Daily Goal Display */}
             <TouchableOpacity className="flex-row items-center p-4 border-b border-stone-100">
                <MaterialCommunityIcons name="target" size={24} color="#414382" />
                <Text className="flex-1 ml-4 text-base text-sumiInk">Daily Goal: {profile?.daily_goal_amount} min</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
             </TouchableOpacity>
             
             {/* Sign Out Button */}
             <TouchableOpacity className="flex-row items-center p-4" onPress={handleSignOut}>
                <MaterialCommunityIcons name="logout" size={24} color="#DC2626" />
                <Text className="flex-1 ml-4 text-base text-red-600 font-bold">Sign Out</Text>
             </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}