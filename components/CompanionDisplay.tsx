// Filename: components/CompanionDisplay.tsx
// Purpose: Visualizes the Companion's state (Normal vs. Sleeping) and Progress.
// FIXED: Added 'levelLabel' and 'isFaint' to the interface.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '../utils/cn';

interface CompanionDisplayProps {
  currentXP: number;
  companionName: string;
  levelLabel: string; // NEW PROP
  isFaint: boolean;   // NEW PROP
}

export default function CompanionDisplay({ 
  currentXP, 
  companionName, 
  levelLabel, 
  isFaint 
}: CompanionDisplayProps) {
  
  // Calculate progress bar (assuming 250 XP per level cap for MVP visual)
  const progress = Math.min(Math.max((currentXP % 250) / 250, 0), 1);

  return (
    <View className="items-center justify-center">
      {/* 1. The Avatar Circle */}
      <View className={cn(
          "w-48 h-48 rounded-full items-center justify-center mb-6 border-4 shadow-lg",
          isFaint ? "bg-stone-200 border-stone-300" : "bg-white border-mainBrandColor"
      )}>
        {isFaint ? (
           // SLEEP STATE
           <MaterialCommunityIcons name="sleep" size={80} color="#A8A29E" />
        ) : (
           // ACTIVE STATE (Fox Icon for MVP)
           <MaterialCommunityIcons name="dog-side" size={100} color="#A26FD7" />
        )}
      </View>

      {/* 2. Status Labels */}
      <Text className="text-2xl font-serif font-bold text-sumiInk mb-1">
        {companionName}
      </Text>
      
      <View className={cn(
          "px-3 py-1 rounded-full mb-6",
          isFaint ? "bg-stone-200" : "bg-mainBrandColor/10"
      )}>
        <Text className={cn(
            "text-sm font-bold uppercase tracking-widest",
            isFaint ? "text-stone-500" : "text-mainBrandColor"
        )}>
            {isFaint ? "Needs Rest (Read to Wake)" : levelLabel}
        </Text>
      </View>

      {/* 3. XP Bar (Hidden if Faint) */}
      {!isFaint && (
          <View className="w-64 h-3 bg-stone-200 rounded-full overflow-hidden">
            <View 
                className="h-full bg-mainBrandColor" 
                style={{ width: `${progress * 100}%` }} 
            />
          </View>
      )}
      {!isFaint && (
          <Text className="text-xs text-stone-400 mt-2 font-bold">{Math.floor(progress * 100)}% to Next Level</Text>
      )}
    </View>
  );
}