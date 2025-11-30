import { Stack, router, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Check Initial Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. Listen for Changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Protect Routes
  useEffect(() => {
    if (!initialized) return;

    // We only protect the tabs and the root index path
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (session && !inAuthGroup) {
      // If Logged In -> Go to Home
      router.replace('/(tabs)');
    } else if (!session && inAuthGroup) {
      // If Logged Out -> Go to Login
      router.replace('/login');
    }
    
    // CRITICAL: We also need to allow the router to see the log-session screen
    // so we don't redirect if the user is logged in and pushing to /log-session
  }, [session, initialized, segments]);

  if (!initialized) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      
      {/* 🚀 CRITICAL FIX: Explicitly define the log-session route */}
      <Stack.Screen 
        name="log-session" 
        options={{ 
          presentation: 'modal', // This forces it to slide up over the tab bar
          headerShown: false,
        }} 
      />
    </Stack>
  );
}