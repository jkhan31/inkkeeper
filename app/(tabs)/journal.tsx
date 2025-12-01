import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 🚀 Import BOTH hooks: useStats for aggregated KPIs and useJournal for session history
import { useJournal } from '@/hooks/useJournal'; 
import { useStats } from '@/hooks/useStats'; 


/**
 * @component StatCard
 * @description A reusable component to display a single Key Performance Indicator (KPI)
 * aggregated from the backend RPC (via useStats).
 */
function StatCard({ icon, value, label, color }: { icon: string, value: string | number, label: string, color: string }) {
  return (
    <View className="w-[48%] mb-4 p-4 bg-white rounded-xl shadow-sm border border-stone-200">
      {/* Icon with a light background wash */}
      <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${color}/20`}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      {/* The main data value, converted to a locale string for readability */}
      <Text className="text-xl font-bold text-stone-900">{value.toLocaleString()}</Text>
      {/* Label for the metric */}
      <Text className="text-stone-500 text-xs mt-1 uppercase tracking-wider">{label}</Text>
    </View>
  );
}

/**
 * @component SessionCard
 * @description Displays the detailed data for a single reading session fetched from the useJournal hook,
 * emphasizing the book title, duration, and the user's reflection (Active Recall).
 */
const SessionCard = ({ session }: { session: any }) => {
  const date = new Date(session.created_at).toLocaleDateString();
  const durationMinutes = Math.round(session.duration_seconds / 60);
  const reflection = session.reflection_data?.note || "The Kitsune kept watch over this silent session.";
  
  // Logic to determine if the reflection earned the "Active Ink Bonus" (simple check for now)
  const isDetailed = reflection.length > 50 && reflection !== "The Kitsune kept watch over this silent session.";

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-4">
      {/* Session Header: Title, Date, Units Read */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-lg font-bold text-stone-900" numberOfLines={1}>{session.book_title}</Text>
          <Text className="text-stone-500 text-xs">{date} • {durationMinutes} min</Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-bold text-emerald-600">+{session.pages_read} units</Text>
          <Text className="text-stone-400 text-xs">Logged</Text>
        </View>
      </View>

      {/* Reflection Section (The core of the Journal) */}
      <View className="border-t border-stone-100 pt-3 mt-2">
        <Text className="text-stone-600 font-medium mb-1 flex-row items-center">
          <MaterialCommunityIcons name="feather" size={14} color="#78716C" className="mr-1" />
          <Text className="ml-1 font-bold text-stone-700">Reflection:</Text>
        </Text>
        <Text className={`text-stone-800 ${isDetailed ? 'italic' : ''}`} numberOfLines={isDetailed ? 3 : 2}>
          {reflection}
        </Text>
        
        {/* Visual feedback for earning the reflection bonus */}
        {isDetailed && (
             <Text className="text-orange-600 text-xs mt-1">Earned Active Ink Bonus!</Text>
        )}
      </View>
    </View>
  );
};


/**
 * @function JournalScreen
 * @description The main component for the Journal Tab. Merges aggregated stats and
 * detailed session history into a single, comprehensive dashboard.
 */
export default function JournalScreen() {
  // Use separate loading states to track both data sources
  const { loading: loadingJournal, sessions, refreshJournal } = useJournal();
  const { loading: loadingStats, summary, error, refreshStats } = useStats(); 

  // Combined loading state for the pull-to-refresh control
  const loading = loadingJournal || loadingStats;
  
  // Default summary object to prevent crashes if stats data is null
  const s = summary || { 
    total_pages_read: 0, 
    total_minutes_read: 0, 
    total_sessions: 0, 
    most_sessions_in_a_day: 0, 
    best_day_date: 'N/A' 
  };
  
  const totalHours = Math.floor(s.total_minutes_read / 60);
  
  /**
   * @function onRefresh
   * @description Triggers a refresh for both the detailed history and the aggregated stats.
   */
  const onRefresh = () => {
      refreshJournal();
      refreshStats();
  };


  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#EA580C" />}
      >
        <Text className="text-3xl font-serif font-bold text-stone-900 mb-6">Your Reading Journal</Text>

        {/* --------------------------- */}
        {/* 1. STATS DASHBOARD SECTION (KPIs) */}
        {/* --------------------------- */}
        <Text className="text-lg font-bold text-stone-800 mb-4 mt-2">Metrics Summary</Text>
        
        <View className="flex-row flex-wrap justify-between">
          <StatCard 
            icon="book-open-page-variant" 
            value={s.total_pages_read} 
            label="Total Pages Read" 
            color="#10B981" 
          />
          <StatCard 
            icon="clock-time-four-outline" 
            value={totalHours} 
            label={`Total Hours Read (${s.total_minutes_read % 60} mins)`} 
            color="#F59E0B" 
          />
          <StatCard 
            icon="trophy-outline" 
            value={s.total_sessions} 
            label="Total Sessions" 
            color="#8B5CF6" 
          />
          <StatCard 
            icon="calendar-check" 
            value={s.most_sessions_in_a_day} 
            label="Best Day Sessions" 
            color="#0EA5E9" 
          />
        </View>
        
        {/* Secondary Card: Reading Peak */}
        <View className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-stone-200 flex-row items-center mb-8">
          <MaterialCommunityIcons name="star-circle-outline" size={32} color="#F59E0B" className="mr-3" />
          <View>
            <Text className="text-lg font-bold text-stone-800">Reading Peak</Text>
            <Text className="text-stone-500 text-sm">You logged {s.most_sessions_in_a_day} sessions on {s.best_day_date}.</Text>
          </View>
        </View>

        {/* --------------------------- */}
        {/* 2. JOURNAL HISTORY SECTION (Detailed logs) */}
        {/* --------------------------- */}
        <Text className="text-lg font-bold text-stone-800 mb-4 mt-2">Session History</Text>
        
        {/* Loading and Empty State Handling */}
        {loadingJournal && sessions.length === 0 && <ActivityIndicator size="large" color="#EA580C" className="mt-8" />}

        {sessions.length === 0 && !loadingJournal && (
          <View className="mt-4 items-center p-6 bg-white rounded-xl">
            <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#A8A29E" className="mb-3" />
            <Text className="text-stone-600 font-medium text-center">Your scroll is blank. Log your first session!</Text>
          </View>
        )}

        {/* Render the list of session cards */}
        {sessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
        
      </ScrollView>
    </SafeAreaView>
  );
}