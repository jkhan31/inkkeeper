// Filename: app/login/signup.tsx
// Directory: app/login/
// Purpose: Handles the creation of a new user account (credentials only). 
//          This screen is the first step in the three-part authentication funnel.
//          Successful signup triggers a redirect to the Onboarding form via app/_layout.tsx.

import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase'; // Client instance for connecting to Supabase Auth/DB
import { cn } from '../../utils/cn'; // Utility function for conditionally joining Tailwind classes

/**
 * Main component for creating a new user account via email and password.
 * Success leads to an automatic redirect to the /onboarding flow.
 */
export default function SignUpScreen() {
  // State variables for managing user input and UI status
  const [email, setEmail] = useState(''); // Stores the user's email input
  const [password, setPassword] = useState(''); // Stores the user's password input
  const [loading, setLoading] = useState(false); // Controls the loading spinner on the button

  /**
   * Handles the sign-up submission process.
   * This function calls the Supabase authentication API to create a new user.
   */
  const handleSignUp = async () => {
    // Basic input validation
    if (!email || password.length < 6) {
      Alert.alert("Input Error", "Please enter a valid email and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    
    // CRITICAL: This call creates the auth.uid() in the database.
    // The successful creation triggers the redirect logic in app/_layout.tsx 
    // to send the user to /onboarding for companion creation.
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Supabase Sign Up Error:", error);
      Alert.alert("Sign Up Failed", error.message);
    } else {
      // Success: The user is now authenticated. app/_layout.tsx handles redirection.
      Alert.alert("Success!", "Account created. Redirecting to set your goals.");
      // NOTE: We do NOT manually navigate here; the global auth listener handles the route change!
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-8 bg-ricePaper">
      <Text className="text-3xl font-serif text-sumiInk font-bold mb-2">Create Your Account</Text>
      <Text className="text-base font-sans text-stone-500 mb-8 text-center">
        This step grants you keeper privileges.
      </Text>

      {/* Email Input */}
      <TextInput
        className="w-full p-4 rounded-xl border border-stone-300 mb-4 bg-white text-sumiInk"
        placeholder="Email"
        placeholderTextColor="#A1A1AA"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      {/* Password Input */}
      <TextInput
        className="w-full p-4 rounded-xl border border-stone-300 mb-6 bg-white text-sumiInk"
        placeholder="Password (min 6 characters)"
        placeholderTextColor="#A1A1AA"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Sign Up Button (Action) */}
      <TouchableOpacity
        onPress={handleSignUp}
        disabled={loading}
        className={cn(
          "w-full p-4 rounded-xl shadow-lg",
          loading ? "bg-stone-400" : "bg-emerald-600"
        )}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-center text-white text-xl font-bold">Sign Up & Continue</Text>
        )}
      </TouchableOpacity>
      
      {/* Link to Login */}
      <TouchableOpacity onPress={() => router.push('/login')} className="mt-8">
        <Text className="text-sumiInk text-sm underline">Already have an account? Log in.</Text>
      </TouchableOpacity>

    </View>
  );
}