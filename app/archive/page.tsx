/**
 * Archive Page
 * 
 * Displays a read-only chronological list of the user's completed reading sessions.
 * Authentication-gated: redirects to login if user is not authenticated.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import SessionCard from '../../components/SessionCard'
import { useAuthGuard } from '../../lib/hooks/useAuthGuard'

// Session shape mirrors the Supabase sessions table structure
interface Session {
  id: string
  created_at: string
  duration_minutes: number
  book_title: string
  main_reflection: string
  additional_notes?: string
}


export default function Archive() {
  const { user, loading } = useAuthGuard()
  const [sessions, setSessions] = useState<Session[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchSessions = async () => {
      setDataLoading(true)

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSessions(data)
      }

      setDataLoading(false)
    }

    fetchSessions()
  }, [user])

  // Prevent layout shift while auth check and data fetch resolve
  if (loading || dataLoading) {
    return <main className="min-h-screen bg-[#FAF5F0]" />
  }

  // ─────────────────────────────────────────────────────────
  // Render session archive
  // ─────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 pt-8 pb-16 bg-[#FAF5F0] text-[#1A1A1A]">
      {/* Back button */}
      <div className="w-full max-w-md px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <h1 className="text-2xl font-serif tracking-tight mt-4">Archive</h1>

      {/* Session List */}
      <div className="w-full max-w-md">
        {sessions.length === 0 ? (
          <p>No sessions yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session: Session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
