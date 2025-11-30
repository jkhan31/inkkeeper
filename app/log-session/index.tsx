// app/(tabs)/index.tsx - TEMPORARY TEST CODE

import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Testing Router Functionality</Text>
      
      <Button 
        title="Push to Log Session"
        onPress={() => router.push('/log-session')} 
      />
      
    </SafeAreaView>
  );
}