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
                        className="inline-flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors mb-12"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-4">
                    <div className="bg-white rounded-[2rem] border border-[#1A1A1A]/5 p-8 shadow-sm flex flex-col">
                        {/* 1. Reflection Text: The Hero */}
                        <div className="mb-0">
                            <label htmlFor="mainReflection" className="sr-only">Main Reflection</label>
                            <textarea
                                id="mainReflection"
                                value={mainReflection}
                                onChange={(e) => setMainReflection(e.target.value)}
                                placeholder="What's the one thought that stayed?"
                                rows={4}
                                className="w-full bg-transparent resize-none text-xl font-serif italic text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 focus:outline-none leading-relaxed"
                            />
                        </div>

                        {/* 2. Additional Notes */}
                        <div className="mt-4 pt-4 border-t border-[#1A1A1A]/5">
                            <label htmlFor="additionalNotes" className="text-[10px] font-sans text-[#1A1A1A]/30 uppercase tracking-widest mb-2 block">
                                Additional Notes
                            </label>
                            <textarea
                                id="additionalNotes"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Any context or citations? (optional)"
                                rows={3}
                                className="w-full bg-transparent resize-none text-sm font-sans text-[#1A1A1A]/70 placeholder:text-[#1A1A1A]/20 focus:outline-none leading-relaxed"
                            />
                        </div>

                        {/* 3. Visual Break: Subtle hairline divider */}
                        <hr className="border-[#1A1A1A]/5 my-6" />

                        {/* 4. Metadata Row: Book Title (Input) • Date • Duration */}
                        <div className="flex items-center flex-wrap gap-2 text-[10px] font-sans text-[#1A1A1A]/40 tracking-widest uppercase">
                            <div className="flex-1 min-w-[120px]">
                                <label htmlFor="bookTitle" className="sr-only">Book Title</label>
                                <input
                                    id="bookTitle"
                                    type="text"
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    placeholder="Book Title *"
                                    className="w-full bg-transparent font-semibold text-[#1A1A1A]/60 placeholder:text-[#1A1A1A]/20 focus:outline-none border-none p-0 h-auto uppercase tracking-widest"
                                />
                            </div>
                            <span>•</span>
                            <span>{new Date(sessionData.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{sessionData.durationMinutes}m</span>
                        </div>
                    </div>

                    {validationError && (
                        <p className="text-sm text-[#8F270D] text-center my-2">{validationError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#8F270D] text-white rounded-full px-4 py-4 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
                    >
                        {isSaving ? 'Saving...' : 'Save to Archive'}
                    </button>
                </form>
            </div>
        </main>
    )

}
