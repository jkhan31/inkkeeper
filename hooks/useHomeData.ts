import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { COMPANION_DATA } from '@/constants/companions'; 

export function useHomeData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data State
  const [inkDrops, setInkDrops] = useState(0);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [companionData, setCompanionData] = useState({
    name: 'Fox',
    stageLabel: 'Egg',
    progressPercent: 0,
    currentLimit: 100,
  });

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Profile (with Self-Healing)
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('ink_drops, active_book_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile if missing
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email })
          .select()
          .single();
        profile = newProfile;
      }

      const currentInk = profile?.ink_drops || 0;
      setInkDrops(currentInk);

      // 2. Calculate Companion Logic (Moved out of UI)
      const species = COMPANION_DATA['fox'];
      const currentStage = species.stages.find((s: any) => currentInk < s.limit) || species.stages[species.stages.length - 1];
      const stageIndex = species.stages.indexOf(currentStage);
      const prevLimit = stageIndex === 0 ? 0 : species.stages[stageIndex - 1].limit;
      const nextLimit = currentStage.limit;
      const percent = Math.min(Math.max(((currentInk - prevLimit) / (nextLimit - prevLimit)) * 100, 0), 100);

      setCompanionData({
        name: species.name,
        stageLabel: currentStage.label,
        progressPercent: percent,
        currentLimit: currentStage.limit,
      });

      // 3. Get Active Book
      if (profile?.active_book_id) {
        const { data: book } = await supabase
          .from('books')
          .select('*')
          .eq('id', profile.active_book_id)
          .single();
        setActiveBook(book);
      } else {
        setActiveBook(null);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return { 
    loading, 
    refreshing, 
    refresh, 
    inkDrops, 
    activeBook, 
    companionData 
  };
}