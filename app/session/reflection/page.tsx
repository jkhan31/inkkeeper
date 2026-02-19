'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// Temporary format for session data passed through sessionStorage
// after user ends a session in /session/timer
interface SessionData {
    startTime: number
    endTime: number
    durationMinutes: number
}


export default function Log() {
    const router = useRouter()
    const [sessionData, setSessionData] = useState<SessionData | null>(null)

    // ═══════════════════════════════════════════════════════════
    // Load session from sessionStorage
    // ═══════════════════════════════════════════════════════════
    // Session data arrives here via sessionStorage after redirect from /session/timer
    // If missing, user arrived incorrectly — redirect back to dashboard
    useEffect(() => {
        const storedSession = sessionStorage.getItem('inkkeeper_active_session')
        
        if (!storedSession) {
            router.push('/dashboard')
            return
        }

        try {
            const parsed: SessionData = JSON.parse(storedSession)
            setSessionData(parsed)

        } catch (error) {
            console.error('Failed to parse session data:', error)
            router.push('/dashboard')
        }
    }, [router])

    // Guard: wait for session data to load
    if (!sessionData) {
        return <div>Loading...</div>
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // ═══════════════════════════════════════════════════════════
    // Persist session to Supabase
    // ═══════════════════════════════════════════════════════════
    // RLS ensures user_id is enforced at database level
    // sessionStorage is cleared only after successful insert (data safety)
    // router.replace used to prevent back-navigation to this page
    const handleSave = async () => {

        if (!sessionData) return

        try {
            // Get authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                console.error('Authentication error:', authError)
                return
            }

            // Insert session into database
            const { error: insertError } = await supabase
                .from('sessions')
                .insert({
                    user_id: user.id,
                    start_time: new Date(sessionData.startTime).toISOString(),
                    end_time: new Date(sessionData.endTime).toISOString(),
                    duration_minutes: sessionData.durationMinutes,

                    book_title: null,
                    note: null
                })

            if (insertError) {
                console.error('Failed to insert session:', insertError)
                return
            }

            // Clean up temporary storage after successful persist
            sessionStorage.removeItem('inkkeeper_active_session')
            
            // Use replace to prevent back-navigation to this page
            router.replace('/dashboard')
        } catch (error) {
            console.error('Unexpected error saving session:', error)
        }
    }

    return (
        <main>
            <h1>Log Session</h1>

            <div>
                <h2>Duration: {sessionData.durationMinutes} minutes</h2>
                <p>Start: {formatTime(sessionData.startTime)}</p>
                <p>End: {formatTime(sessionData.endTime)}</p>
            </div>
            <button onClick={handleSave}>Save</button>
        </main>
    )
}
