import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        Alert.alert("Success", "Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Success -> Go to Tabs
        router.replace('/(tabs)/');
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 30 }}>
          
          {/* Brand */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-stone-800 rounded-full items-center justify-center mb-4 shadow-xl">
              <MaterialCommunityIcons name="feather" size={48} color="#EA580C" />
            </View>
            <Text className="text-4xl font-serif text-stone-800 font-bold">Inkkeeper</Text>
            <Text className="text-stone-500 mt-2 tracking-widest uppercase text-xs">Tend to your mind</Text>
          </View>

          {/* Form */}
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <Text className="text-xl font-serif text-stone-800 mb-6 text-center">
              {isSignUp ? "Begin Your Journey" : "Welcome Back"}
            </Text>

            <View className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200 mb-4 flex-row items-center">
              <MaterialCommunityIcons name="email-outline" size={20} color="#78716C" className="mr-3" />
              <TextInput 
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                className="flex-1 text-stone-800"
              />
            </View>

            <View className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200 mb-6 flex-row items-center">
              <MaterialCommunityIcons name="lock-outline" size={20} color="#78716C" className="mr-3" />
              <TextInput 
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 text-stone-800"
              />
            </View>

            <TouchableOpacity 
              onPress={handleAuth}
              disabled={loading}
              className="bg-stone-800 py-4 rounded-xl items-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Loading..." : (isSignUp ? "Create Account" : "Enter Library")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} className="mt-8 items-center">
            <Text className="text-stone-500">
              {isSignUp ? "Already have an account? " : "First time here? "}
              <Text className="text-orange-600 font-bold">
                {isSignUp ? "Sign In" : "Create Account"}
              </Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}