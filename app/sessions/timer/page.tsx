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
    const { user, loading } = useAuthGuard()

    // ─── Session Configuration ────────────────────────────────────────────────

    const minimumSessionSeconds = 5 // * 60 // 5 minutes, 5 seconds for testing

    // ─── Time Tracking (refs to avoid re-render on every calculation) ─────────

    const startTimeRef = useRef<number>(Date.now())
    const pausedDurationRef = useRef<number>(0)
    const pauseStartRef = useRef<number | null>(null)
    
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // ─── Timer Loop ───────────────────────────────────────────────────────────

    useEffect(() => {
        const interval = setInterval(() => {
            // Only update elapsed time when not paused
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
            // Resume
            if (pauseStartRef.current !== null) {
                pausedDurationRef.current += Date.now() - pauseStartRef.current
                pauseStartRef.current = null
            }
            setIsPaused(false)
        } else {
            // Pause
            pauseStartRef.current = Date.now()
            setIsPaused(true)
        }
    }

    // ─── End Session ──────────────────────────────────────────────────────────
    // Finalizes the session, enforces minimum duration, stores to sessionStorage

    const handleEnd = () => {
        // Close any active pause before final calculation
        if (pauseStartRef.current !== null) {
            pausedDurationRef.current += Date.now() - pauseStartRef.current
            pauseStartRef.current = null
        }

        const sessionData = {
            startTime: startTimeRef.current,
            endTime: Date.now(),
            durationMinutes: Math.max(1, Math.floor(elapsedSeconds / 60))
        }

        sessionStorage.setItem(
            'inkkeeper_active_session',
            JSON.stringify(sessionData)
        )

        router.push('/sessions/reflection')
    }

    // ─── Display Logic ────────────────────────────────────────────────────────
    // Count up from 0 seconds

    const elapsedSeconds = Math.floor(elapsedTime / 1000)
    const canEndSession = elapsedSeconds >= minimumSessionSeconds

    // Prevent layout shift while auth check resolves
    if (loading) return <main className="min-h-screen bg-[#FAF5F0]" />

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF5F0] text-[#1A1A1A]">
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
        </main>
    )
}
