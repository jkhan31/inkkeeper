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

    const inTabsGroup = segments[0] === '(tabs)';
    const inLogSession = segments[0] === 'log-session';
    const inModal = segments[0] === 'modal';
    
    if (session && !inTabsGroup && !inLogSession && !inModal) {
      // If Logged In -> Go to Home (unless in allowed screens)
      router.replace('/(tabs)');
    } else if (!session && inTabsGroup) {
      // If Logged Out -> Go to Login
      router.replace('/login');
    }
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
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}