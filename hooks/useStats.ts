// Filename: hooks/useStats.ts
// Purpose: Fetches aggregated reading stats.
// FIXED: Removed 'pages_read' logic. Focused purely on duration (minutes/hours).

import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    totalSessions: 0,
    streak: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Profile for Streak
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      // 2. Get All Sessions for Totals
      // We only fetch duration_seconds now.
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('duration_seconds');

      if (sessionError) throw sessionError;

      const totalSeconds = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const totalMinutes = Math.floor(totalSeconds / 60);

      setStats({
        totalMinutes,
        totalSessions: sessions?.length || 0,
        streak: profile?.current_streak || 0,
      });

    } catch (e: any) {
      console.error("Stats Fetch Error:", e);
      setError(e.message || "Failed to load summary stats.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  return { stats, loading, error, refetch: fetchStats };
}