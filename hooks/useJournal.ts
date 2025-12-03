// Filename: hooks/useJournal.ts
// Purpose: Fetches recent reading sessions for the Journal tab.
// FIXED: Removed 'pages_read' from the SELECT query.

import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type JournalEntry = {
  id: string;
  created_at: string;
  duration_seconds: number;
  book: {
    title: string;
    cover_url: string | null;
  } | null;
  reflection_data: {
    note: string;
    prompt?: string;
  } | null;
};

export function useJournal() {
  const [sessions, setSessions] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJournal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Select session data + joined book data
      // CRITICAL FIX: Removed 'pages_read' from selection
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          created_at,
          duration_seconds,
          reflection_data,
          book:books (
            title,
            cover_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSessions(data as any);

    } catch (e) {
      console.error("Journal Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJournal();
    }, [])
  );

  return { sessions, loading, refresh: fetchJournal };
}