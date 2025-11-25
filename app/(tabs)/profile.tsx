import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <--- Fixed Import
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { PET_DATA } from '../../constants/pets';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalPages: 0, totalHours: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [companions, setCompanions] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Profile Stats
      // FIXED: Removed 'created_at' from the query to prevent the error
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('rank, ink_drops, email') 
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      // MERGE: Combine Database stats with Auth timestamp
      setProfile({
        ...dbProfile,
        joined_at: user.created_at // <--- Use the Auth date instead!
      });

      // 2. Calculate Totals from Sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('pages_read, duration_seconds, created_at, books(title)');
        
      if (sessionError) throw sessionError;

      const totalPages = sessionData?.reduce((sum, s) => sum + (s.pages_read || 0), 0) || 0;
      const totalSeconds = sessionData?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      
      setStats({
        totalPages,
        totalHours: parseFloat((totalSeconds / 3600).toFixed(1))
      });
      
      // 3. History List (Limit 5)
      setHistory(sessionData?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) || []);

      // 4. Companions
      const { data: companionData } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'archived');
        
      setCompanions(companionData || []);

    } catch (error) {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) return <View className="flex-1 bg-stone-100 justify-center items-center"><ActivityIndicator color="#EA580C" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
      >
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-serif text-stone-800">Keeper Journal</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="cog-outline" size={28} color="#57534E" />
          </TouchableOpacity>
        </View>

        {/* Identity Card */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 mb-6 flex-row items-center">
          {/* Avatar */}
          <View className="h-16 w-16 bg-stone-200 rounded-full items-center justify-center mr-4">
            <Text className="text-2xl font-serif text-stone-600">{profile?.email?.[0]?.toUpperCase() || 'K'}</Text>
          </View>
          
          {/* User Info */}
          <View>
            <Text className="text-stone-800 font-bold text-lg mb-1">
                {profile?.email?.split('@')[0] || 'Keeper'}
            </Text>
            
            <View className="flex-row items-center">
              <View className="bg-red-700 px-3 py-1 rounded-md mr-2">
                <Text className="text-white text-xs font-bold">Rank {profile?.rank || 1}</Text>
              </View>
              
              {/* <--- INSERT THE DATE HERE */}
              <Text className="text-stone-400 text-xs">
                 Joined {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString() : '...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-white p-4 rounded-2xl flex-1 mr-2 items-center shadow-sm border border-stone-200">
            <MaterialCommunityIcons name="water" size={24} color="#EA580C" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{profile?.ink_drops || 0}</Text>
            <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Ink</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl flex-1 mx-2 items-center shadow-sm border border-stone-200">
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#059669" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{stats.totalPages}</Text>
            <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Pages</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl flex-1 ml-2 items-center shadow-sm border border-stone-200">
            <MaterialCommunityIcons name="clock-outline" size={24} color="#2563EB" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{stats.totalHours}</Text>
            <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Hours</Text>
          </View>
        </View>

        {/* The Sanctuary */}
        <View className="mb-8">
          <Text className="text-lg font-serif text-stone-800 mb-4">Past Companions</Text>
          {companions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {companions.map((pet) => (
                <View key={pet.id} className="mr-4 items-center">
                  <View className="w-16 h-16 bg-stone-200 rounded-full items-center justify-center border-2 border-stone-300">
                     <MaterialCommunityIcons name="dog-side" size={30} color="#78716C" />
                  </View>
                  <Text className="text-xs text-stone-500 mt-2 font-bold">{pet.nickname || 'Unknown'}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-stone-200/50 p-6 rounded-xl items-center border border-dashed border-stone-300">
              <Text className="text-stone-400">No ancestors yet.</Text>
            </View>
          )}
        </View>

        {/* Reading Log */}
        <View className="mb-8">
          <Text className="text-lg font-serif text-stone-800 mb-4">Recent History</Text>
          {history.length > 0 ? (
            history.map((session) => (
              <View key={session.created_at} className="bg-white p-4 rounded-xl border border-stone-200 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-bold text-stone-800">{session.books?.title || 'Unknown Book'}</Text>
                  <Text className="text-xs text-stone-400 mt-1">
                    {new Date(session.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="bg-green-50 px-3 py-1 rounded-full">
                   <Text className="text-green-700 font-bold text-xs">
                     {session.pages_read > 0 ? `+${session.pages_read} pgs` : `${Math.floor(session.duration_seconds/60)} min`}
                   </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-stone-400 text-center py-4">No reading history found.</Text>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-stone-200 py-4 rounded-xl items-center"
        >
          <Text className="text-red-600 font-bold">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}