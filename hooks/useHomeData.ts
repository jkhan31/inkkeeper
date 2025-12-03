// Filename: hooks/useHomeData.ts
// Purpose: Central data fetching for the Home Screen.
// FIXED: Added 'isFaint: false' to initial state to fix TypeScript inference error.

import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useHomeData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inkDrops, setInkDrops] = useState(0);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);
  
  // 🛑 CRITICAL FIX: 'isFaint: false' added here
  const [companionData, setCompanionData] = useState({
    name: 'Fox',
    stageLabel: 'Level 1',
    isFaint: false, 
    progressPercent: 0,
    currentLimit: 250,
  });

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('ink_drops, active_book_id, active_companion_id, last_session_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        setInkDrops(profile.ink_drops || 0);
        setActiveCompanionId(profile.active_companion_id);

        // Calculate Sleep Status
        let isFaint = false;
        if (profile.last_session_at) {
            const hoursSince = (new Date().getTime() - new Date(profile.last_session_at).getTime()) / (1000 * 60 * 60);
            if (hoursSince > 24) isFaint = true;
        }
        
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
    } catch (e) { console.error(e); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  const refresh = () => { setRefreshing(true); fetchData(); };

  return { loading, refreshing, refresh, inkDrops, activeBook, companionData, activeCompanionId };
}