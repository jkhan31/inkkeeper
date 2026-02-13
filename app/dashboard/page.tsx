'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

/**
 * Dashboard: Main landing page after authentication
 * 
 * Serves as the central hub for navigating to session creation and history.
 * Implements auth gate pattern - redirects to login if no active session.
 */
export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [weeklySessionCount, setWeeklySessionCount] = useState<number>(0)
    const [weeklyMinutesTotal, setWeeklyMinutesTotal] = useState<number>(0)
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
    const fetchWeeklyMetrics = async () => {
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
            const totalMinutes = data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
            setWeeklyMinutesTotal(totalMinutes)
        }
    }

    // Auth Gate: Verify session exists before rendering dashboard
    // Uses replace() to prevent back-navigation to this page when logged out
    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (!data.session) {
                router.replace('/login')
            } else {
                setUser(data.session.user)
                await fetchWeeklyMetrics()
            }
        }

        checkSession()
    }, [router])

    // Logout Flow: Clear Supabase session and return to login
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    // Prevent flash of content while auth check completes
    if (!user) return null

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAF5F0] text-[#1A1A1A]">
            <h1>Welcome, {user.email}</h1>

            {/* Weekly Metrics Summary */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-white border border-[#E5E5E5] p-4">
                    <div className="text-2xl font-semibold">{weeklySessionCount}</div>
                    <div className="text-sm font-medium">Sessions</div>
                    <div className="text-xs opacity-60 mt-1">this week</div>
                </div>
                <div className="bg-white border border-[#E5E5E5] p-4">
                    <div className="text-2xl font-semibold">{weeklyMinutesTotal}</div>
                    <div className="text-sm font-medium">Minutes</div>
                    <div className="text-xs opacity-60 mt-1">this week</div>
                </div>
            </div>

            {/* Primary Action: Session Creation */}
            <button
                onClick={() => router.push('/session/setup')}
                className="bg-[#3F5A4A] text-white px-6 py-3"
            >
                Begin Session
            </button>

            {/* Secondary Action: Review Past Sessions */}
            <button
                onClick={() => router.push('/history')}
                className="border border-[#1A1A1A] px-6 py-3"
            >
                View History
            </button>

            {/* Tertiary Action: Account Management */}
            <button
                onClick={handleLogout}
                className="text-sm opacity-60"
            >
                Logout
            </button>
        </main>
    )

}