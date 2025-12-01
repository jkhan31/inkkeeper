// Filename: app/_layout.tsx
// Directory: app/
// Purpose: The global root layout and navigation entry point for the entire application.
// This component manages authentication state, controls the critical Onboarding Gate,
// and handles conditional redirects to ensure users only access authorized parts of the app.

import { Stack, router, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Supabase client instance for Auth and Database access
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  // --- State Management ---
  const [session, setSession] = useState<any>(null);
  // Holds the user's basic profile data, essential for checking active_companion_id
  const [profile, setProfile] = useState<any>(null); 
  // Flags when the initial authentication and profile check is complete. Prevents race conditions.
  const [initialized, setInitialized] = useState(false);
  
  // Expo Router hooks for navigation control and route checking
  const segments = useSegments();
  const router = useRouter();

  // --- 1. Fetch Session and Listen for Changes ---
  useEffect(() => {
    // Check for an existing session immediately on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up real-time listener for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * --- 2. Fetch Profile Data (Callback) ---
   * Fetches the user's profile upon successful login to check if the companion is linked.
   * This determines if the user is a brand-new user who needs to complete onboarding.
   * @param userId - The UUID of the currently authenticated user.
   */
  const fetchProfile = useCallback(async (userId: string) => {
    setProfile(null); 
    const { data, error } = await supabase
      .from('profiles')
      .select('active_companion_id')
      .eq('id', userId)
      .single();

    // PGRST116 means resource not found, expected for brand new signups
    if (error && error.code !== 'PGRST116') { 
        console.error("Error fetching profile:", error);
    }
    // Set profile data (or empty object if not found yet) and mark as initialized
    setProfile(data || {});
    setInitialized(true);
  }, []);

  // Effect to trigger profile fetch whenever the session state changes
  useEffect(() => {
    if (session) {
      // If logged in, fetch the user's profile to check onboarding status
      fetchProfile(session.user.id);
    } else {
      // If logged out, reset status and allow redirection to login
      setProfile(null);
      setInitialized(true);
    }
  }, [session, fetchProfile]);


  /**
   * --- 3. Route Protection Logic (The Main Gate) ---
   * Runs whenever session, profile, or initialization status changes.
   * Enforces the three main navigation rules:
   * 1. Logged Out -> /login
   * 2. Logged In, NO Companion -> /onboarding (The Gate)
   * 3. Logged In, YES Companion -> /(tabs)
   */
  useEffect(() => {
    // Wait until we know if the user is logged in AND we have checked their profile
    if (!initialized) return;

    // Flags to check the current route group based on the first segment
    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'onboarding';

    if (session) {
      // Logic for Logged-In User
      const hasCompletedOnboarding = profile && profile.active_companion_id;
      
      if (!hasCompletedOnboarding && segments[0] !== 'onboarding') {
        // Rule 2: Force redirect to onboarding if missing companion ID
        router.replace('/onboarding');
      } else if (hasCompletedOnboarding && inAuthGroup) {
        // Rule 3: If setup is complete, redirect to home from login/onboarding screens
        router.replace('/(tabs)');
      }
      
    } else if (!session && !inAuthGroup) {
      // Rule 1: If logged out AND not on an auth screen, redirect to login
      router.replace('/login');
    }
  }, [session, initialized, profile, segments, router]);


  // Show loading indicator while authentication and profile state is being determined
  if (!initialized) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  // --- Main Stack Definition ---
  // The screen names must match the directory/file names exactly.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      {/* 1. WELCOME/AUTH FLOWS: Handles the entire /login group structure */}
      <Stack.Screen name="login" />

      {/* 2. ONBOARDING GATE: The critical setup screen for new users */}
      <Stack.Screen name="onboarding/index" /> 

      {/* 3. MAIN APP TABS: The core application functionality */}
      <Stack.Screen name="(tabs)" />
      
      {/* 4. MODALS/STACK SCREENS: Explicitly define the deep/modal screens */}
      <Stack.Screen 
        name="log-session/index"
        options={{ 
          presentation: 'modal', 
          headerShown: false,
        }} 
      />
      {/* Generic modal route for future use */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}