'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

/**
 * Active Session Page
 *
 * Runs a reading timer that counts up from 0 seconds.
 * Supports pause/resume to exclude breaks during a reading session.
 * Requires minimum 5 minutes before ending the session.
 */
export default function Active() {
    const router = useRouter()
    const { loading } = useAuthGuard()

    // ─── Session Configuration ────────────────────────────────────────────────

    const minimumSessionSeconds = 5 // * 60 // 5 minutes, 5 seconds for testing

    // ─── Time Tracking (refs to avoid re-render on every calculation) ─────────

    const startTimeRef = useRef<number>(0)
    const pausedDurationRef = useRef<number>(0)
    const pauseStartRef = useRef<number | null>(null)

    const [elapsedTime, setElapsedTime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [showBackConfirm, setShowBackConfirm] = useState(false)

    // ─── Restore Timer State ──────────────────────────────────────────────────
    // If the user navigated back from the reflection page, restore the saved
    // start time and paused duration so the timer continues from where it left off.

    useEffect(() => {
        if (startTimeRef.current === 0) {
            startTimeRef.current = Date.now()
        }

        const saved = sessionStorage.getItem('inkkeeper_timer_state')
        if (saved) {
            try {
                const { elapsedAtEnd } = JSON.parse(saved)
                // Rebase startTime so elapsed = elapsedAtEnd at this exact moment,
                // ignoring any time spent on the reflection page.
                startTimeRef.current = Date.now() - elapsedAtEnd
                pausedDurationRef.current = 0
                sessionStorage.removeItem('inkkeeper_timer_state')
            } catch {
                // ignore malformed state
            }
        }
    }, [])

    // ─── Timer Loop ───────────────────────────────────────────────────────────

    useEffect(() => {
        const interval = setInterval(() => {
            if (pauseStartRef.current === null) {
                setElapsedTime(Date.now() - startTimeRef.current - pausedDurationRef.current)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // ─── Utilities ────────────────────────────────────────────────────────────

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

    // ─── Pause & Resume ───────────────────────────────────────────────────────
    // Tracks paused duration separately to exclude break time from reading time

    const handlePauseResume = () => {
        if (isPaused) {
            if (pauseStartRef.current !== null) {
                pausedDurationRef.current += Date.now() - pauseStartRef.current
                pauseStartRef.current = null
            }
            setIsPaused(false)
        } else {
            pauseStartRef.current = Date.now()
            setIsPaused(true)
        }
    }

    // ─── End Session ──────────────────────────────────────────────────────────
    // Saves timer origin for back-navigation, then stores session snapshot
    // and navigates to the reflection page.

    const handleEnd = () => {
        if (pauseStartRef.current !== null) {
            pausedDurationRef.current += Date.now() - pauseStartRef.current
            pauseStartRef.current = null
        }

        const endTime = Date.now()
        const totalElapsedMs = endTime - startTimeRef.current - pausedDurationRef.current

        // Save elapsed ms at End Session so back-navigation resumes from this exact point
        sessionStorage.setItem(
            'inkkeeper_timer_state',
            JSON.stringify({ elapsedAtEnd: totalElapsedMs })
        )
        const durationMinutes = Math.max(1, Math.floor(totalElapsedMs / 1000 / 60))

        sessionStorage.setItem(
            'inkkeeper_active_session',
            JSON.stringify({ startTime: startTimeRef.current, endTime, durationMinutes })
        )

        router.push('/sessions/reflection')
    }

    // ─── Abandon Session ──────────────────────────────────────────────────────
    // Clears all session state and returns to dashboard without saving.

    const handleAbandon = () => {
        sessionStorage.removeItem('inkkeeper_active_session')
        sessionStorage.removeItem('inkkeeper_timer_state')
        router.replace('/dashboard')
    }

    // ─── Display Logic ────────────────────────────────────────────────────────

    const elapsedSeconds = Math.floor(elapsedTime / 1000)
    const canEndSession = elapsedSeconds >= minimumSessionSeconds

    if (loading) return <main className="min-h-screen bg-[#FAF5F0]" />

    return (
        <main className="flex min-h-screen flex-col bg-[#FAF5F0] text-[#1A1A1A]">
            {/* Back button */}
            <div className="px-6 pt-8">
                <button
                    onClick={() => setShowBackConfirm(true)}
                    className="inline-flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Timer content — centred in remaining space */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                    <p className="text-xs font-medium tracking-widest uppercase text-[#1A1A1A]/40">
                        Active Session
                    </p>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-8xl font-semibold tracking-tight tabular-nums">
                            {formatTime(elapsedSeconds)}
                        </span>
                        {isPaused && (
                            <span className="text-sm text-[#1A1A1A]/40 tracking-wide">Paused</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePauseResume}
                            className="border border-[#1A1A1A]/20 text-[#1A1A1A]/60 rounded-full px-6 py-2.5 font-medium hover:border-[#8F270D] hover:text-[#8F270D] transition-colors"
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>

                        <button
                            onClick={handleEnd}
                            disabled={!canEndSession}
                            className="bg-[#8F270D] text-white rounded-full px-6 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Abandon confirmation modal */}
            {showBackConfirm && (
                <div className="fixed inset-0 bg-[#1A1A1A]/40 flex items-center justify-center px-6">
                    <div className="bg-[#FAF5F0] rounded-[2rem] p-8 w-full max-w-sm flex flex-col gap-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Leave this session?</h2>
                            <p className="text-sm text-[#1A1A1A]/50 mt-2">
                                Your progress will not be saved.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowBackConfirm(false)}
                                className="w-full bg-[#8F270D] text-white rounded-full py-2.5 font-medium hover:opacity-90 transition-opacity"
                            >
                                Keep Reading
                            </button>
                            <button
                                onClick={handleAbandon}
                                className="w-full border border-[#1A1A1A]/20 text-[#1A1A1A]/60 rounded-full py-2.5 font-medium hover:border-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
                            >
                                Leave Without Saving
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
