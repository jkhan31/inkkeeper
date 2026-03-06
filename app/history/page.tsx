/**
 * History Page
 * 
 * Displays a read-only chronological list of the user's completed reading sessions.
 * Authentication-gated: redirects to login if user is not authenticated.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import SessionCard from '@/components/SessionCard'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

// Session shape mirrors the Supabase sessions table structure
interface Session {
  id: string
  created_at: string
  duration_minutes: number
  book_title: string
  main_reflection: string
}

export default function History() {
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
  // Compute lifetime summary metrics
  // ─────────────────────────────────────────────────────────
  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)

  // ─────────────────────────────────────────────────────────
  // Render session history
  // ─────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 pt-12 bg-[#FAF5F0] text-[#1A1A1A]">
      <h1 className="text-2xl font-semibold tracking-tight">History</h1>

      {/* Lifetime Summary */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Your Reading Record</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-4">
            <div className="text-2xl font-semibold">{totalSessions}</div>
            <div className="text-sm font-medium">Sessions</div>
          </div>
          <div className="bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-4">
            <div className="text-2xl font-semibold">{totalMinutes}</div>
            <div className="text-sm font-medium">Minutes</div>
          </div>
        </div>
      </div>


      {/* Session List */}
      <div className="w-full max-w-md">
        {sessions.length === 0 ? (
          <p>No sessions yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      <Link href="/dashboard">
        <button className="border border-[#8F270D] text-[#8F270D] rounded-full px-6 py-2.5 font-medium hover:bg-[#8F270D]/5 transition-colors">Back</button>
      </Link>
    </main>
  )
}
