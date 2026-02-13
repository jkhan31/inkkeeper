/**
 * History Page
 * 
 * Displays a read-only chronological list of the user's completed reading sessions.
 * Authentication-gated: redirects to login if user is not authenticated.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

// Session shape mirrors the Supabase sessions table structure
interface Session {
  id: string
  created_at: string
  duration_minutes: number
  book_title: string | null
  note: string | null
}

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      // ─────────────────────────────────────────────────────────
      // Authentication check
      // ─────────────────────────────────────────────────────────
      // Verify user session before loading data to prevent unauthorized access
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.replace('/login')
        return
      }

      // ─────────────────────────────────────────────────────────
      // Fetch all sessions
      // ─────────────────────────────────────────────────────────
      // Ordered newest-first to show most recent reading activity at the top
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSessions(data)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [router])

  // Prevent flash of empty state while authentication and data load
  if (loading) {
    return <main><p>Loading...</p></main>
  }

  // ─────────────────────────────────────────────────────────
  // Render session history
  // ─────────────────────────────────────────────────────────
  return (
    <main>
      <h1>History</h1>
      
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id} style={{ marginBottom: '1.5rem' }}>
              <p>{new Date(session.created_at).toLocaleString()}</p>
              <p>Duration: {session.duration_minutes} minutes</p>
              {session.book_title && <p>Book: {session.book_title}</p>}
              {session.note && <p>Note: {session.note}</p>}
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard">
        <button>Back</button>
      </Link>
    </main>
  )
}
