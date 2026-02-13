'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Active Session Page
 * 
 * Runs a reading timer that counts down from a target duration,
 * then continues counting up if the session goes beyond the target.
 * Supports pause/resume to exclude breaks during a reading session.
 */
export default function Active() {
    const router = useRouter()

    // ─── Session Configuration ────────────────────────────────────────────────

    const targetDurationMinutes = 0.25 // 15 seconds for testing, actual should default to 15
    const targetSeconds = targetDurationMinutes * 60

    const minimumSessionSeconds = 5 // 5 seconds for testing, actual should be 5 * 60

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
    // Tracks paused duration separately to exclude break time from billable hours

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

        if (elapsedSeconds < minimumSessionSeconds) {
            alert(`Minimum session is ${minimumSessionSeconds} seconds while testing. Update code when ready.`)
            return
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

        router.push('/session/log')
    }

    // ─── Display Logic ────────────────────────────────────────────────────────
    // Countdown to target duration, then switch to count-up for overrun

    const elapsedSeconds = Math.floor(elapsedTime / 1000)

    let displaySeconds: number

    if (elapsedSeconds < targetSeconds) {
        displaySeconds = targetSeconds - elapsedSeconds
    } else {
        displaySeconds = elapsedSeconds
    }

    return (
        <main>
            <h1>Active Session</h1>
            <div>{formatTime(displaySeconds)}</div>
            <button onClick={handlePauseResume}>
                {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleEnd}>End</button>
        </main>
    )
}
