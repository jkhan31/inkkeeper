'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

// Temporary format for session data passed through sessionStorage
// after user ends a session in /session/active
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
        if (!mainReflection.trim()) {
            setValidationError('One thought is required to save.')
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
            <div className="w-full max-w-md flex flex-col gap-10">
                {/* Back button */}
                <div>
                    <button
                        onClick={() => router.push('/session/active')}
                        className="inline-flex items-center text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Prompt Heading */}
                <h1 className="text-3xl font-serif tracking-tight text-center mt-2">
                    What stood out most?
                </h1>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-10">
                    <div className="flex flex-col gap-3">
                        {/* 1. Reflection Text: The Focal Point */}
                        <div className="bg-white rounded-[2rem] border border-[#1A1A1A]/10 p-8 shadow-sm">
                            <label htmlFor="mainReflection" className="sr-only">Main Reflection</label>
                            <textarea
                                id="mainReflection"
                                autoFocus
                                value={mainReflection}
                                onChange={(e) => setMainReflection(e.target.value)}
                                placeholder="Write here..."
                                rows={6}
                                className="w-full bg-transparent resize-none text-2xl font-serif text-[#1A1A1A] placeholder:text-[#1A1A1A]/10 focus:outline-none leading-relaxed"
                            />
                        </div>
                        {/* 1.1 Helper Text */}
                        <p className="text-center text-xs font-sans text-[#1A1A1A]/30 uppercase tracking-widest">
                            One sentence is enough.
                        </p>
                    </div>

                    {/* Optional Fields Container */}
                    <div className="bg-white rounded-[2rem] border border-[#1A1A1A]/10 p-8 shadow-sm flex flex-col">
                        {/* 2. Context / Notes */}
                        <div className="mb-0">
                            <label htmlFor="additionalNotes" className="text-[10px] font-sans text-[#1A1A1A]/30 uppercase tracking-widest mb-4 block">
                                Context / Notes
                            </label>
                            <textarea
                                id="additionalNotes"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Any additional context? (optional)"
                                rows={3}
                                className="w-full bg-transparent resize-none text-sm font-sans text-[#1A1A1A]/60 placeholder:text-[#1A1A1A]/10 focus:outline-none leading-relaxed"
                            />
                        </div>

                        {/* Visual Break */}
                        <hr className="border-[#1A1A1A]/10 my-8" />

                        {/* 3. Book Title & Meta */}
                        <div className="flex items-center flex-wrap gap-2 text-[10px] font-sans text-[#1A1A1A]/40 tracking-widest uppercase">
                            <div className="flex-1 min-w-[120px]">
                                <label htmlFor="bookTitle" className="sr-only">Book Title</label>
                                <input
                                    id="bookTitle"
                                    type="text"
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    placeholder="Book Title (Optional)"
                                    className="w-full bg-transparent text-[#1A1A1A]/60 placeholder:text-[#1A1A1A]/20 focus:outline-none border-none p-0 h-auto uppercase tracking-widest"
                                />
                            </div>
                            <span>•</span>
                            <span>{new Date(sessionData.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{sessionData.durationMinutes}m</span>
                        </div>
                    </div>

                    {validationError && (
                        <p className="text-sm text-[#8F270D] text-center -mt-4">{validationError}</p>
                    )}

                    {/* Primary Action */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#8F270D] text-white rounded-full px-4 py-5 text-lg font-serif hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
                    >
                        {isSaving ? 'Preserving...' : 'Save to Archive'}
                    </button>
                </form>
            </div>
        </main>
    )

}
