// hooks/useStats.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

// Define the shape of the data returned by your get_reading_summary RPC
export interface ReadingSummary {
  total_pages_read: number;
  total_minutes_read: number;
  total_sessions: number;
  most_sessions_in_a_day: number;
  best_day_date: string; // Date string from the RPC
}

export function useStats() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReadingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not logged in.");
        return;
      }

      // Calculate start and end dates for a full-history view
      const endDate = new Date().toISOString();
      const startDate = new Date(0).toISOString(); // Start from Unix Epoch (beginning of time)

      // 🚀 CRITICAL: Calling the Report Engine RPC
      const { data, error: rpcError } = await supabase.rpc('get_reading_summary', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      }).select().single();

      if (rpcError) throw rpcError;
      
      // The RPC returns a single row with the columns defined in the function
      if (data) {
        // Fix the date format for display
        const stats: ReadingSummary = {
          ...data,
          best_day_date: data.best_day_date ? new Date(data.best_day_date).toLocaleDateString() : 'N/A'
        };
        setSummary(stats);
      } else {
        // This case should not happen if RPC returns COALESCE(0) but is a safeguard
        setSummary(null);
      }

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

  return { loading, summary, error, refreshStats: fetchStats };
}