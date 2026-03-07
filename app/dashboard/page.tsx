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
}

export default function Dashboard() {
    const { user, loading } = useAuthGuard()
    const [weeklySessionCount, setWeeklySessionCount] = useState<number>(0)
    const [weeklyMinutesTotal, setWeeklyMinutesTotal] = useState<number>(0)
    const [recentSessions, setRecentSessions] = useState<Session[]>([])
    const router = useRouter()

    // Helper: Get start and end of current week (Monday-Sunday)
    const getWeekBounds = () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday = 1, Sunday = 0

        const monday = new Date(now)
        monday.setDate(now.getDate() + diff)
        monday.setHours(0, 0, 0, 0)

        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        return { start: monday, end: sunday }
    }

    // Fetch weekly metrics from sessions table
    const fetchWeeklyMetrics = useCallback(async () => {
        const { start, end } = getWeekBounds()

        const { data, error } = await supabase
            .from('sessions')
            .select('id, duration_minutes, created_at')
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())

        if (error) {
            console.error('Error fetching sessions:', error)
            return
        }

        if (data) {
            setWeeklySessionCount(data.length)
            const totalMinutes = data.reduce((sum: number, session: any) => sum + (session.duration_minutes || 0), 0)
            setWeeklyMinutesTotal(totalMinutes)
        }
    }, [])

    // Fetch 3 most recent sessions for preview
    const fetchRecentSessions = useCallback(async () => {
        const { data, error } = await supabase
            .from('sessions')
            .select('id, created_at, duration_minutes, book_title, main_reflection')
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchWeeklyMetrics()
        fetchRecentSessions()
    }, [user, fetchWeeklyMetrics, fetchRecentSessions])

    // Logout Flow: Clear Supabase session and return to login
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    // Format minutes to hours and minutes
    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        if (remainingMinutes === 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
        }
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`
    }

    // Prevent layout shift while auth check resolves
    if (loading) return <main className="min-h-screen bg-[#FAF5F0]" />

    return (
        <main className="flex min-h-screen flex-col bg-[#FAF5F0] text-[#1A1A1A] pt-8 pb-16">
            {/* Header - left aligned */}
            <header className="w-full max-w-md mx-auto px-8 mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-center">InkKeeper</h2>
            </header>

            {/* Main content - centered */}
            <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto px-8">

                {/* Weekly Metrics Summary */}
                <div className="w-full">
                    <h3 className="text-sm font-medium mb-3 opacity-60">This Week</h3>
                    <div className="bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-left">
                                <div className="text-sm font-medium">{weeklySessionCount} {weeklySessionCount === 1 ? 'session' : 'sessions'}</div>
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium">{formatTime(weeklyMinutesTotal)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Action: Start Session */}
                <button
                    onClick={() => router.push('/sessions/timer')}
                    className="w-full bg-[#8F270D] text-white rounded-full px-6 py-4 text-lg font-serif hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    Start Reading
                </button>

                {/* Recent Sessions */}
                {recentSessions.length > 0 && (
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium opacity-60">Recent Sessions</h3>
                            <button
                                onClick={() => router.push('/archive')}
                                className="text-xs opacity-60 hover:opacity-100 underline"
                            >
                                Archive
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {recentSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Account Actions */}
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => router.push('/set-password')}
                        className="text-sm opacity-60 hover:opacity-100"
                    >
                        Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm opacity-60 hover:opacity-100"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </main>
    )

}