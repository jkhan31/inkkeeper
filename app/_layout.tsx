import { Stack, router, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // State to hold the profile data
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // --- 1. Fetch Session and Listen for Changes ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. Fetch Profile Data (Runs when session changes) ---
  const fetchProfile = useCallback(async (userId: string) => {
    setProfile(null); // Reset profile while fetching
    const { data, error } = await supabase
      .from('profiles')
      .select('active_companion_id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means resource not found, expected for brand new signups
        console.error("Error fetching profile:", error);
    }
    setProfile(data || {});
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (session) {
      // If logged in, fetch the user's profile to check onboarding status
      fetchProfile(session.user.id);
    } else {
      // If logged out, reset status
      setProfile(null);
      setInitialized(true);
    }
  }, [session, fetchProfile]);


  // --- 3. Protection Logic (Runs after profile is initialized) ---
  useEffect(() => {
    // Wait until we know if the user is logged in AND we have checked their profile
    if (!initialized) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (session) {
      // User is logged in. Now check onboarding status (profile is guaranteed to be loaded if session exists)
      const hasCompletedOnboarding = profile && profile.active_companion_id;
      
      if (!hasCompletedOnboarding && !inOnboarding) {
        // If logged in but MISSING companion ID, force redirect to onboarding
        router.replace('/onboarding');
      } else if (hasCompletedOnboarding && (inLogin || !inTabsGroup)) {
        // If logged in AND onboarding complete, redirect to home
        router.replace('/(tabs)');
      }
      
    } else if (!session && !inLogin) {
      // If logged out AND not on the login screen, redirect to login
      router.replace('/login');
    }
  }, [session, initialized, profile, segments, router]);


  if (!initialized) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" /> {/* <-- New Screen Definition */}
      <Stack.Screen name="(tabs)" />
      
      {/* CRITICAL FIX: Explicitly define the log-session route */}
      <Stack.Screen 
        name="log-session" 
        options={{ 
          presentation: 'modal', 
          headerShown: false,
        }} 
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}