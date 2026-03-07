'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

// Temporary format for session data passed through sessionStorage
// after user ends a session in /sessions/timer
interface SessionData {
    startTime: number
    endTime: number
    durationMinutes: number
}


export default function Log() {
    const router = useRouter()
    const [sessionData] = useState<SessionData | null>(() => {
        if (typeof window === 'undefined') return null

        const storedSession = sessionStorage.getItem('inkkeeper_active_session')
        if (!storedSession) return null

        try {
            return JSON.parse(storedSession) as SessionData
        } catch (error) {
            console.error('Failed to parse session data:', error)
            return null
        }
    })
    const [bookTitle, setBookTitle] = useState('')
    const [mainReflection, setMainReflection] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState('')
    const [validationError, setValidationError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // ═══════════════════════════════════════════════════════════
    // Load session from sessionStorage
    // ═══════════════════════════════════════════════════════════
    // If session data is missing, user arrived incorrectly — redirect to dashboard.
    useEffect(() => {
        if (!sessionData) {
            router.push('/dashboard')
        }
    }, [router, sessionData])

    // Guard: wait for session data to load
    if (!sessionData) {
        return <main className="min-h-screen bg-[#FAF5F0]" />
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
            sessionStorage.removeItem('inkkeeper_timer_state')

            // Use replace to prevent back-navigation to this page
            router.replace('/dashboard')
        } catch (error) {
            console.error('Unexpected error saving session:', error)
            setIsSaving(false)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#FAF5F0] text-[#1A1A1A] pt-10 pb-16 px-6">
            <div className="w-full max-w-md flex flex-col gap-6">
                <div>
                    <button
                        onClick={() => router.push('/sessions/timer')}
                        className="inline-flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors mb-8"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-2xl font-semibold tracking-tight">Log Session</h1>
                    <p className="text-sm text-[#1A1A1A]/40 mt-1">
                        {formatDate(sessionData.startTime)} · {formatDuration(sessionData.durationMinutes)}
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-4">
                    <div className="bg-white rounded-[2rem] border border-[#1A1A1A]/5 p-6 flex flex-col gap-6">
                        <div>
                            <label htmlFor="bookTitle" className="text-xs font-medium text-[#1A1A1A]/40 uppercase tracking-widest mb-2 block">
                                Book Title *
                            </label>
                            <input
                                id="bookTitle"
                                type="text"
                                value={bookTitle}
                                onChange={(e) => setBookTitle(e.target.value)}
                                placeholder="Enter book title"
                                className="w-full border-b border-[#1A1A1A]/10 bg-transparent pb-2 text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#8F270D] transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="mainReflection" className="text-xs font-medium text-[#1A1A1A]/40 uppercase tracking-widest mb-2 block">
                                What stood out most? *
                            </label>
                            <textarea
                                id="mainReflection"
                                value={mainReflection}
                                onChange={(e) => setMainReflection(e.target.value)}
                                placeholder="Share your main reflection"
                                rows={4}
                                className="w-full bg-transparent resize-none border-b border-[#1A1A1A]/10 pb-2 text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#8F270D] transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="additionalNotes" className="text-xs font-medium text-[#1A1A1A]/40 uppercase tracking-widest mb-2 block">
                                Additional notes
                            </label>
                            <textarea
                                id="additionalNotes"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Any other thoughts? (optional)"
                                rows={3}
                                className="w-full bg-transparent resize-none text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none"
                            />
                        </div>
                    </div>

                    {validationError && (
                        <p className="text-sm text-[#8F270D] text-center">{validationError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#8F270D] text-white rounded-full px-4 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isSaving ? 'Saving...' : 'Save Reflection'}
                    </button>
                </form>
            </div>
        </main>
    )
}
