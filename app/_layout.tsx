// Filename: app/_layout.tsx
// Purpose: Main app navigation configuration.
// FIXED: Ensures 'log-session' opens as a modal, preventing navigation loops.

import { router, Stack, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

// --- Auth Gate Component (Guards protected routes) ---
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state and onboarding status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuth(!!session);
      
      // If authenticated, check if onboarding is complete
      if (session) {
        checkOnboardingStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuth(!!session);
      
      if (session) {
        checkOnboardingStatus(session.user.id);
      } else {
        setHasCompletedOnboarding(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('active_companion_id')
        .eq('id', userId)
        .single();
      
      // If active_companion_id exists, onboarding is complete
      setHasCompletedOnboarding(!!data?.active_companion_id);
    } catch (e) {
      console.error('Error checking onboarding status:', e);
      setHasCompletedOnboarding(false);
    }
  };

  useEffect(() => {
    // Protected route logic
    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inLogin = segments[0] === 'login';
    
    // 🛑 CRITICAL FIX: EXEMPT the log-session modal from the authentication redirect loop.
    const inModal = segments[0] === 'log-session'; // Check if we are trying to open the modal stack
    
    // If not authenticated and trying to access tabs, redirect to login
    if (isAuth === false && inAuthGroup) {
      router.replace('/login');
    } 
    // If authenticated but NOT onboarded and NOT already in login/onboarding/modal
    else if (isAuth === true && hasCompletedOnboarding === false && !inOnboarding && !inModal && !inLogin) {
      // Redirect to onboarding
      router.replace('/onboarding');
    }
    // If authenticated and onboarded, redirect from login/onboarding to tabs
    // EXEMPTION APPLIED HERE: If we are in a modal, don't redirect back to tabs.
    else if (isAuth === true && hasCompletedOnboarding === true && !inAuthGroup && !inModal) {
      router.replace('/(tabs)');
    }
  }, [isAuth, hasCompletedOnboarding, segments]);

  if (isAuth === null || hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A26FD7" />
      </View>
    );
  }

  return <>{children}</>;
};

// --- Main Layout Component ---
export default function RootLayout() {
  return (
    // Wrap the entire stack in the AuthGate for protection
    <AuthGate>
      <Stack>
        {/* Login/Signup stack (Not protected) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="login/signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />

        {/* Main Tab Routes (Protected) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 🛑 CRITICAL FIX: Explicitly define log-session as a modal */}
        <Stack.Screen
          name="log-session/index"
          options={{
            presentation: 'modal',
            headerShown: false,
            title: 'Log Session',
          }}
        />
        
        {/* Modal route defined in a separate folder */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </AuthGate>
  );
}