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
    const [bookTitle, setBookTitle] = useState('')
    const [mainReflection, setMainReflection] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState('')
    const [validationError, setValidationError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

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

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        })
    }

    const formatDuration = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60)
            const remainingMinutes = minutes % 60
            if (remainingMinutes === 0) {
                return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
            }
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`
        }
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    }

    // ═══════════════════════════════════════════════════════════
    // Persist session to Supabase
    // ═══════════════════════════════════════════════════════════
    // RLS ensures user_id is enforced at database level
    // sessionStorage is cleared only after successful insert (data safety)
    // router.replace used to prevent back-navigation to this page
    const handleSave = async () => {
        // Prevent double submission
        if (isSaving) return

        // Validate required fields
        if (!bookTitle.trim() || !mainReflection.trim()) {
            setValidationError('Please fill in all required fields')
            return
        }

        setValidationError('')
        setIsSaving(true)

        if (!sessionData) return

        try {
            // Get authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                console.error('Authentication error:', authError)
                setIsSaving(false)
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
                    book_title: bookTitle.trim(),
                    main_reflection: mainReflection.trim(),
                    additional_notes: additionalNotes.trim() || null
                })

            if (insertError) {
                console.error('Failed to insert session:', insertError)
                setIsSaving(false)
                return
            }

            // Clean up temporary storage after successful persist
            sessionStorage.removeItem('inkkeeper_active_session')
            
            // Use replace to prevent back-navigation to this page
            router.replace('/dashboard')
        } catch (error) {
            console.error('Unexpected error saving session:', error)
            setIsSaving(false)
        }
    }

    return (
        <main>
            <h1>Log Session</h1>

            <div>
                <p><strong>{formatDate(sessionData.startTime)}</strong></p>
                <p><strong>Duration:</strong> {formatDuration(sessionData.durationMinutes)}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div>
                    <label htmlFor="bookTitle">Book Title *</label>
                    <input
                        id="bookTitle"
                        type="text"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="Enter book title"
                    />
                </div>

                <div>
                    <label htmlFor="mainReflection">What stood out most? *</label>
                    <textarea
                        id="mainReflection"
                        value={mainReflection}
                        onChange={(e) => setMainReflection(e.target.value)}
                        placeholder="Share your main reflection"
                        rows={4}
                    />
                </div>

                <div>
                    <label htmlFor="additionalNotes">Additional notes</label>
                    <textarea
                        id="additionalNotes"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Any other thoughts? (optional)"
                        rows={3}
                    />
                </div>

                {validationError && (
                    <p style={{ color: 'red' }}>{validationError}</p>
                )}

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </main>
    )
}
