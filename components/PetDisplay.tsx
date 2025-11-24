import React from 'react';
import { View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PET_DATA } from '../constants/pets';

interface PetDisplayProps {
  xp: number; // We now accept XP as a prop
}

export default function PetDisplay({ xp }: PetDisplayProps) {
  // 1. Determine Current Stage
  const species = PET_DATA['fox'];
  const currentStage = species.stages.find(stage => xp < stage.limit) || species.stages[species.stages.length - 1];

  // 2. Calculate Progress to Next Stage
  // If stage limit is 250 and we have 150, progress is 60%
  // We need to find the "previous limit" to calculate the bar correctly
  const stageIndex = species.stages.indexOf(currentStage);
  const prevLimit = stageIndex === 0 ? 0 : species.stages[stageIndex - 1].limit;
  const stageTotal = currentStage.limit - prevLimit;
  const stageCurrent = xp - prevLimit;
  const progressPercent = Math.min(Math.max((stageCurrent / stageTotal) * 100, 0), 100);

  return (
    <View className="items-center justify-center w-40 h-40">
      {/* Background Circle */}
      <View className="absolute w-32 h-32 bg-stone-50 rounded-full border-4 border-stone-200" />
      
      {/* The Pet Icon */}
      <MaterialCommunityIcons 
        name={currentStage.icon as any} 
        size={80} 
        color="#EA580C" 
      />

      {/* Progress Ring (Simple version for MVP) */}
      <View className="absolute bottom-0 bg-stone-800 px-3 py-1 rounded-full">
         <View className="flex-row">
            {/* Dots representing stage */}
            {species.stages.map((_, index) => (
                <View 
                  key={index} 
                  className={`w-2 h-2 rounded-full mx-0.5 ${index <= stageIndex ? 'bg-orange-500' : 'bg-stone-600'}`} 
                />
            ))}
         </View>
      </View>
    </View>
  );
}