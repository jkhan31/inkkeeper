import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

/**
 * @function ProfileScreen
 * @description The main component for the Profile Tab. This screen acts as the user's
 * identity hub, displaying core profile stats, managing past companions, active challenges,
 * and handling critical account actions like Sign Out and permanent deletion.
 */
export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null); // Stores user profile data (rank, ink, email, joined_at)
  const [companions, setCompanions] = useState<any[]>([]); // Stores archived companion data
  const [isDeleting, setIsDeleting] = useState(false); // State for managing the deletion process spinner

  /**
   * @function fetchData
   * @description Fetches all necessary user data from Supabase, including core profile metrics
   * (for the stats grid) and the list of archived companions (for the Sanctuary section).
   */
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch essential Profile Stats (Ink, Rank, Email, etc.)
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('rank, ink_drops, email, active_companion_id') 
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      // Merge the profile data with the user's creation date from the auth table
      setProfile({
        ...dbProfile,
        email: user.email, 
        joined_at: user.created_at
      });
      
      // 2. Fetch Companions: Get all pets EXCEPT the active one (for the Sanctuary)
      const { data: companionData } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'active'); 
        
      setCompanions(companionData || []);

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @hook useFocusEffect
   * @description Ensures that data is re-fetched every time the Profile tab comes into focus.
   */
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  /**
   * @function onRefresh
   * @description Handles the pull-to-refresh action, manually triggering a data reload.
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  /**
   * @function handleSignOut
   * @description Logs the user out via Supabase Auth and redirects them to the login screen.
   */
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/login'); 
    } else {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };
  
  /**
   * @function handleDeleteAccount
   * @description Initiates the permanent account deletion process, calling the backend RPC.
   * This includes a mandatory confirmation alert for user compliance.
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Account Deletion",
      "⚠️ WARNING: This action is permanent and cannot be undone. All your books, sessions, ink, and your Kitsune will be permanently deleted. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE ACCOUNT", 
          style: "destructive", 
          onPress: async () => {
            setIsDeleting(true);
            try {
              const userId = (await supabase.auth.getSession()).data.session?.user.id;
              if (!userId) throw new Error("User session not found.");
              
              // 1. Call the Atomic Cleanup Function (deletes all data from profiles, companions, books, sessions)
              const { error: rpcError } = await supabase.rpc('delete_user_account');
              if (rpcError) throw rpcError;

              // 2. Delete the user from the auth.users table (Admin API)
              const { error: authError } = await supabase.auth.admin.deleteUser(userId);
              
              if (authError) throw authError;

              Alert.alert("Success", "Your account and all data have been permanently deleted.");
              router.replace('/login');

            } catch (error: any) {
              console.error("Deletion Error:", error);
              Alert.alert("Deletion Failed", `Could not delete account. Error: ${error.message}. Please contact support.`);
            } finally {
              setIsDeleting(false);
            }
          } 
        }
      ]
    );
  };


  if (loading) return <View className="flex-1 bg-stone-100 justify-center items-center"><ActivityIndicator color="#EA580C" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
      >
        
        {/* Profile Header and Settings Icon */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-serif text-stone-800">My Inkkeeper</Text>
          <TouchableOpacity onPress={() => {/* Future settings modal */}}>
            <MaterialCommunityIcons name="cog-outline" size={28} color="#57534E" />
          </TouchableOpacity>
        </View>

        {/* Identity Card (Displays Username, Rank, and Ink Drops) */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 mb-6 flex-row items-center">
          
          <View className="h-16 w-16 bg-stone-200 rounded-full items-center justify-center mr-4">
            <Text className="text-2xl font-serif text-stone-600">{profile?.email?.[0]?.toUpperCase() || 'K'}</Text>
          </View>
          
          <View>
            <Text className="text-stone-800 font-bold text-lg mb-1">
                {profile?.email?.split('@')[0] || 'Keeper'}
            </Text>
            
            <View className="flex-row items-center">
              <View className="bg-red-700 px-3 py-1 rounded-md mr-2">
                <Text className="text-white text-xs font-bold">Rank {profile?.rank || 1}</Text>
              </View>
              
              <Text className="text-stone-400 text-xs">
                  Ink: {profile?.ink_drops || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Core Stats Grid (Only essential profile data: Join Date, Companions Count) */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-white p-4 rounded-2xl flex-1 mr-2 items-center shadow-sm border border-stone-200">
            <MaterialCommunityIcons name="calendar-check-outline" size={24} color="#EA580C" />
            <Text className="text-base font-bold text-stone-800 mt-2">
              {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString() : '...'}
            </Text>
            <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Joined</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl flex-1 mx-2 items-center shadow-sm border border-stone-200">
            <MaterialCommunityIcons name="seal-variant" size={24} color="#059669" />
            <Text className="text-base font-bold text-stone-800 mt-2">
              {companions.length + 1}
            </Text>
            <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Companions</Text>
          </View>
          {/* Placeholder for future features like Streak Count or Notifications */}
          <View className="bg-stone-200 p-4 rounded-2xl flex-1 ml-2 items-center border border-dashed border-stone-300">
             <MaterialCommunityIcons name="bell-outline" size={24} color="#A8A29E" />
             <Text className="text-xs text-stone-400 uppercase font-bold tracking-widest mt-1">Notifications</Text>
          </View>
        </View>
        
        {/* Active Challenges / Goals (Future Feature Hook) */}
        <View className="mb-8">
          <Text className="text-lg font-serif text-stone-800 mb-4">Active Challenges</Text>
          
          <View className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
             
            <View className="flex-row items-center mb-3">
               <MaterialCommunityIcons name="target" size={20} color="#EA580C" className="mr-3" />
               <Text className="font-bold text-stone-800">7-Day Reading Streak</Text>
            </View>
            <View className="bg-stone-200 h-2 rounded-full overflow-hidden">
               <View className="bg-red-700 h-full" style={{ width: '71.4%'}} /> 
            </View>
            <Text className="text-xs text-stone-500 mt-2">5/7 days logged this week</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/journal')}
            className="mt-4 py-3 border-b border-stone-200 flex-row justify-center items-center"
          >
             <Text className="text-stone-500 font-medium">View All Goals</Text>
          </TouchableOpacity>
        </View>
        
        {/* The Sanctuary (Past Companions) - Companion Management Hub */}
        <View className="mb-8">
          <Text className="text-lg font-serif text-stone-800 mb-4">Past Companions (Sanctuary)</Text>
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

        {/* Link to Full Reading Journal (History is now separate) */}
        <View className="mb-8">
           <Text className="text-lg font-serif text-stone-800 mb-4">Recent History (Full list moved to Journal Tab)</Text>
           <TouchableOpacity 
             onPress={() => router.navigate('/(tabs)/journal')}
             className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex-row justify-between items-center"
           >
              <Text className="text-stone-700 font-bold">View Full Reading Journal</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#EA580C" />
           </TouchableOpacity>
        </View>

        {/* ACCOUNT ACTIONS & COMPLIANCE - Sign Out */}
        <Text className="text-stone-500 font-bold uppercase tracking-widest text-xs mb-3 mt-6">Account Actions</Text>
        
        <TouchableOpacity 
          onPress={handleSignOut}
          className="bg-white py-4 px-6 rounded-xl shadow-sm border border-stone-200 flex-row justify-between items-center mb-4"
        >
          <Text className="text-stone-800 font-bold text-lg">Sign Out</Text>
          <MaterialCommunityIcons name="logout" size={24} color="#EA580C" />
        </TouchableOpacity>

        {/* Legal Links (for App Store compliance) */}
        <Text className="text-stone-500 font-bold uppercase tracking-widest text-xs mb-3 mt-6">Help & Legal</Text>
        
        <TouchableOpacity 
          onPress={() => Linking.openURL('https://jasonkhanani.com/privacy')}
          className="bg-white py-4 px-6 rounded-xl shadow-sm border border-stone-200 flex-row justify-between items-center mb-2"
        >
          <Text className="text-stone-800 text-lg">Privacy Policy</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#A8A29E" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => Linking.openURL('https://jasonkhanani.com/terms')}
          className="bg-white py-4 px-6 rounded-xl shadow-sm border border-stone-200 flex-row justify-between items-center mb-2"
        >
          <Text className="text-stone-800 text-lg">Terms of Service</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#A8A29E" />
        </TouchableOpacity>

        {/* Danger Zone: Account Deletion (Compliance) */}
        <View className="mt-12 p-4 border border-red-300 rounded-xl bg-red-50">
          <Text className="text-red-700 font-bold text-lg mb-2">Danger Zone</Text>
          <Text className="text-red-700 text-sm mb-4">Permanently delete your account and all associated data, including your Kitsune and reading history.</Text>
          
          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            className={`py-3 rounded-lg flex-row items-center justify-center ${isDeleting ? 'bg-red-400' : 'bg-red-600'}`}
          >
            {isDeleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">DELETE ACCOUNT</Text>
            )}
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}