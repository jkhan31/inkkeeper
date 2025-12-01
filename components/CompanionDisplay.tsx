// components/CompanionDisplay.tsx

import { View, Text } from 'react-native';
// Assuming NativeWind is set up for tailwind classes

interface CompanionDisplayProps {
  currentXP: number;
  companionName: string;
}

interface Stage {
    limit: number;
    label: string;
    color: string;
}

// Define the companion evolution stages and their properties
const companionStages: Stage[] = [
    // Must match the progression logic in useHomeData.ts
    { limit: 250, label: 'Rough Sketch', color: 'bg-gray-200' },
    { limit: 1000, label: 'Bold Line Art', color: 'bg-blue-200' },
    { limit: 2500, label: 'B&W Inkwash', color: 'bg-purple-200' },
    { limit: Infinity, label: 'Ink Wash Master', color: 'bg-slate-800' },
];


export default function CompanionDisplay({ currentXP, companionName }: CompanionDisplayProps) {

    // 1. Determine Current Stage (Fixed implicit 'any' error)
    const currentStage = companionStages.find((stage: Stage) => currentXP < stage.limit) || companionStages[companionStages.length - 1];
    
    // 2. Calculate Progress
    const stageIndex = companionStages.indexOf(currentStage);
    const prevLimit = stageIndex === 0 ? 0 : companionStages[stageIndex - 1].limit;
    const nextLimit = currentStage.limit;

    const progressRange = nextLimit - prevLimit;
    const progressValue = currentXP - prevLimit;
    
    // Prevent division by zero and cap between 0 and 1
    const progressPercent = progressRange > 0 ? Math.min(Math.max((progressValue / progressRange), 0), 1) : 1;

    // Determine the next stage's threshold for display (Fixed implicit 'any' errors)
    // We use a safe check and return the limit of the current stage
    const nextStageThreshold = currentStage.limit; 

    return (
        <View className="items-center p-4">
            {/* Image Placeholder */}
            <View className={`w-48 h-48 rounded-xl items-center justify-center ${currentStage.color} shadow-lg shadow-black/20`}>
                <Text className="text-xl font-bold text-gray-700">🦊</Text>
            </View>

            {/* Name */}
            <Text className="text-3xl font-bold text-stone-800 mt-4">{companionName}</Text>
            <Text className="text-lg text-stone-600 mb-4">Stage: {currentStage.label}</Text>

            {/* Progress Bar */}
            <View className="w-64 bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                <View 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${progressPercent * 100}%` }} 
                />
            </View>

            {/* XP Text */}
            <Text className="text-stone-500 text-sm mt-1">
                {currentXP} / {nextStageThreshold === Infinity ? 'MAX' : nextStageThreshold} XP
            </Text>
        </View>
    );
}