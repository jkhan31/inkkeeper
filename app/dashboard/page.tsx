'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import SessionCard from '../../components/SessionCard'


import { useAuthGuard } from '../../lib/hooks/useAuthGuard'

/**
 * Dashboard: Main landing page after authentication
 * 
 * Serves as the central hub for navigating to session creation and archive.
 * Implements auth gate pattern - redirects to login if no active session.
 */

// Session interface matching the Supabase sessions table
interface Session {
    id: string
    created_at: string
    duration_minutes: number
    book_title: string
    main_reflection: string
    additional_notes?: string
}


export default function Dashboard() {
    const { user, loading } = useAuthGuard()
    const [recentSessions, setRecentSessions] = useState<Session[]>([])
    const router = useRouter()

    // Fetch 3 most recent sessions for preview
    const fetchRecentSessions = useCallback(async () => {
        const { data, error } = await supabase
            .from('sessions')
            .select('id, created_at, duration_minutes, book_title, main_reflection, additional_notes')
            .order('created_at', { ascending: false })
            .limit(3)


        if (error) {
            console.error('Error fetching recent sessions:', error)
            return
        }

        if (data) {
            setRecentSessions(data)
        }
    }, [])

    // Fetch data once the auth guard confirms the session
    useEffect(() => {
        if (!user) return
        fetchRecentSessions()
    }, [user, fetchRecentSessions])

    // Logout Flow: Clear Supabase session and return to login
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    // Prevent layout shift while auth check resolves
    if (loading) return <main className="min-h-screen bg-[#FAF5F0]" />

    return (
        <main className="flex min-h-screen flex-col bg-[#FAF5F0] text-[#1A1A1A] pt-12 pb-16">
            {/* Header - quiet */}
            <header className="w-full max-w-md mx-auto px-8 mb-16">
                <h2 className="text-2xl font-serif tracking-tight text-center">InkKeeper</h2>
            </header>

            {/* Main content - centered */}
            <div className="flex flex-col items-center gap-12 w-full max-w-md mx-auto px-8">

                {/* Primary Action: Start Session */}
                <button
                    onClick={() => router.push('/session/active')}
                    className="w-full bg-[#8F270D] text-white rounded-full px-8 py-5 text-xl font-serif hover:opacity-95 active:scale-[0.99] transition-all shadow-sm"
                >
                    [ Start Reading Session ]
                </button>

                {/* Recent Reflections */}
                {recentSessions.length > 0 && (
                    <div className="w-full">
                        <h3 className="text-sm font-medium opacity-40 mb-6 uppercase tracking-widest text-center">Recent Reflections</h3>
                        <div className="flex flex-col gap-4">
                            {recentSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>
                )}

                {/* The Exit: Quiet Archive Link */}
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/archive')}
                        className="text-sm opacity-40 hover:opacity-100 transition-opacity font-sans tracking-wide"
                    >
                        View Archive
                    </button>
                </div>

                {/* Very Quiet Account Actions */}
                <div className="flex gap-6 mt-12 opacity-20 hover:opacity-60 transition-opacity">
                    <button
                        onClick={() => router.push('/set-password')}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        Security
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    )

}