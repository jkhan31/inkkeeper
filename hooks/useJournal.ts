// hooks/useJournal.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

export interface SessionLog {
  id: string;
  created_at: string;
  duration_seconds: number;
  pages_read: number;
  reflection_data: { note?: string } | null;
  book_title: string;
}

export function useJournal() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionLog[]>([]);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all sessions and join with the books table to get the title
      const { data: rawSessions, error } = await supabase
        .from('sessions')
        .select(`
          id, created_at, duration_seconds, pages_read, reflection_data,
          books ( title )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedSessions: SessionLog[] = (rawSessions || []).map(s => ({
        id: s.id,
        created_at: s.created_at,
        duration_seconds: s.duration_seconds,
        pages_read: s.pages_read,
        reflection_data: s.reflection_data,
        book_title: s.books ? (s.books as { title: string }).title : 'Unknown Book',
      }));

      setSessions(formattedSessions);

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

  return { loading, sessions, refreshJournal: fetchJournal };
}