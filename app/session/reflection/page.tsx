'use client'

import { useEffect, useRef, useState } from 'react'
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
    const [showNotes, setShowNotes] = useState(false)

    const reflectionTextareaRef = useRef<HTMLTextAreaElement>(null)
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textareas as content grows
    useEffect(() => {
        if (reflectionTextareaRef.current) {
            reflectionTextareaRef.current.style.height = 'auto'
            reflectionTextareaRef.current.style.height = `${reflectionTextareaRef.current.scrollHeight}px`
        }
    }, [mainReflection])

    useEffect(() => {
        if (notesTextareaRef.current) {
            notesTextareaRef.current.style.height = 'auto'
            notesTextareaRef.current.style.height = `${notesTextareaRef.current.scrollHeight}px`
        }
    }, [additionalNotes])

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
        <main className="flex min-h-screen flex-col items-center bg-rice-paper text-sumi-ink pt-6 pb-12 px-6">
            <div className="w-full max-w-[640px] flex flex-col gap-6">
                {/* Back button */}
                <div>
                    <button
                        onClick={() => router.push('/session/active')}
                        className="inline-flex items-center text-sumi-ink/40 hover:text-sumi-ink transition-colors rounded-full"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Prompt Heading */}
                <h1 className="text-4xl font-serif tracking-tight text-center mt-2">
                    What stood out most?
                </h1>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        {/* 1. Reflection Text: Open writing space */}
                        <label htmlFor="mainReflection" className="sr-only">Main Reflection</label>
                        <textarea
                            ref={reflectionTextareaRef}
                            id="mainReflection"
                            autoFocus
                            value={mainReflection}
                            onChange={(e) => setMainReflection(e.target.value)}
                            placeholder="Write the idea that stayed with you…"
                            rows={4}
                            className="w-full bg-white/40 border border-sumi-ink/10 rounded-lg px-5 py-4 resize-none overflow-hidden text-2xl font-serif text-sumi-ink placeholder:text-sumi-ink/20 focus:outline-none leading-relaxed"
                        />

                        {/* Helper Text */}
                        <p className="text-sm font-sans text-sumi-ink/40">
                            One sentence is enough.
                        </p>

                        {/* Optional Notes Toggle */}
                        {!showNotes && (
                            <button
                                type="button"
                                onClick={() => setShowNotes(true)}
                                className="text-sm font-sans text-sumi-ink/40 hover:text-sumi-ink/60 transition-colors text-left"
                            >
                                + Add notes (optional)
                            </button>
                        )}

                        {/* Optional Notes Field */}
                        {showNotes && (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="additionalNotes" className="text-sm font-sans text-sumi-ink/40">
                                    Additional notes
                                </label>
                                <textarea
                                    ref={notesTextareaRef}
                                    id="additionalNotes"
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="Any additional context?"
                                    rows={3}
                                    className="w-full bg-white/40 border border-sumi-ink/10 rounded-lg px-5 py-4 resize-none overflow-hidden text-sm font-sans text-sumi-ink/60 placeholder:text-sumi-ink/20 focus:outline-none leading-relaxed"
                                />
                            </div>
                        )}
                    </div>

                    {/* Book Title */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="bookTitle" className="text-sm font-sans text-sumi-ink/40">
                            Book Title
                        </label>
                        <input
                            id="bookTitle"
                            type="text"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            placeholder="Title of the book"
                            className="w-full bg-white/40 border border-sumi-ink/10 rounded-lg px-5 py-3 text-sm font-sans text-sumi-ink placeholder:text-sumi-ink/30 focus:outline-none"
                        />
                    </div>

                    {/* Metadata */}
                    <p className="text-sm font-sans text-sumi-ink/40">
                        {formatDate(sessionData.startTime)} · {formatDuration(sessionData.durationMinutes)}
                    </p>

                    {validationError && (
                        <p className="text-sm text-seal-rust text-center">{validationError}</p>
                    )}

                    {/* Primary Action */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary w-full !py-4 text-lg font-serif disabled:opacity-50"
                    >
                        {isSaving ? 'Preserving...' : 'Save to Archive'}
                    </button>
                </form>
            </div>
        </main>
    )

}
