// Filename: hooks/useHomeData.ts
// Purpose: Central data fetching for the Home Screen, including Companion and Streak Logic.
// CRITICAL FIX: Implements the Sleep check and the Streak Reset/Freeze logic using RPCs.
// Ensures accurate state management for the user's Companion and Streak status.


import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export function useHomeData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inkDrops, setInkDrops] = useState(0);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [freezesAvailable, setFreezesAvailable] = useState(0);
  
  const [companionData, setCompanionData] = useState({
    name: 'Fox',
    stageLabel: 'Level 1',
    isFaint: false, 
    progressPercent: 0,
    currentLimit: 250,
  });

  const checkAndHandleStreak = async (
    userId: string, 
    lastSessionAt: string | null,
    currentStreak: number,
    freezesAvailable: number
  ) => {
    if (!lastSessionAt || currentStreak === 0) return { streakHandled: true, newStreak: currentStreak };

    const lastSessionDate = new Date(lastSessionAt);
    const now = new Date();
    const hoursSince = (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60);

    // Streak Window Logic: 48 hours is the definitive break point (24 hours window + 24 hour buffer)
    if (hoursSince > 48) {
      // 1. STREAK IS BROKEN - Check for a save
      if (freezesAvailable > 0) {
        // Option A: Use a Streak Freeze
        const { data, error } = await supabase.rpc('use_streak_freeze', { p_user_id: userId });

        if (error) {
            console.error("RPC Error using streak freeze:", error);
            Alert.alert("Error", "Could not use streak freeze due to server error.");
        } else if (data && data.success) {
            // Success: Streak saved, freezers decremented.
            console.log("Streak saved using 1 freeze.");
            setFreezesAvailable(data.freezes_remaining);
            Alert.alert("Streak Saved!", "A Streak Freeze was consumed to maintain your current streak.");
            return { streakHandled: true, newStreak: currentStreak };
        }
      } 
      
      // Option B: Streak is broken and no freezers available
      if (freezesAvailable === 0) {
        await supabase.rpc('reset_broken_streak', { p_user_id: userId });
        console.log("Streak reset to 0.");
        Alert.alert("Streak Broken", `Your ${currentStreak}-day streak has ended.`);
        return { streakHandled: true, newStreak: 0 };
      }
    }
    
    return { streakHandled: false, newStreak: currentStreak };
  };


  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile and Companion data (including new columns)
      const { data: profile } = await supabase
        .from('profiles')
        .select('ink_drops, active_book_id, active_companion_id, last_session_at, current_streak, streak_freezes_available')
        .eq('id', user.id)
        .single();

      if (profile) {
        // --- 2. STREAK/SLEEP CHECK ---
        const { newStreak } = await checkAndHandleStreak(
            user.id,
            profile.last_session_at,
            profile.current_streak,
            profile.streak_freezes_available
        );

        // Calculate Faint Status
        let isFaint = false;
        if (profile.last_session_at) {
            const hoursSince = (new Date().getTime() - new Date(profile.last_session_at).getTime()) / (1000 * 60 * 60);
            // Companion Sleep Logic: Faint if > 24 hours since last session
            if (hoursSince > 24) isFaint = true;
        }
        
        // --- 3. STATE UPDATE ---
        setInkDrops(profile.ink_drops || 0);
        setActiveCompanionId(profile.active_companion_id);
        setCurrentStreak(newStreak);
        setFreezesAvailable(profile.streak_freezes_available);
        
        // Fetch Companion Data
        if (profile.active_companion_id) {
            const { data: comp } = await supabase.from('companions').select('*').eq('id', profile.active_companion_id).single();
            if (comp) {
                const level = Math.floor(comp.xp / 250) + 1;
                setCompanionData({
                    name: comp.nickname,
                    stageLabel: `Level ${level}`,
                    isFaint: isFaint,
                    progressPercent: (comp.xp % 250 / 250),
                    currentLimit: 250
                });
            }
        }
        
        // Fetch Active Book
        if (profile.active_book_id) {
            const { data: book } = await supabase.from('books').select('*').eq('id', profile.active_book_id).single();
            setActiveBook(book);
        }
      }
    } catch (e) { console.error("Error in useHomeData:", e); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  const refresh = () => { setRefreshing(true); fetchData(); };

  return { loading, refreshing, refresh, inkDrops, activeBook, companionData, activeCompanionId, currentStreak, freezesAvailable };
}