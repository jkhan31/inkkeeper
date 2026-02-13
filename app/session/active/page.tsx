'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Active() {
    const router = useRouter()

    const targetDurationMinutes = 0.25 // 15 seconds for testing, actual should default to 15
    const targetSeconds = targetDurationMinutes * 60

    const minimumSessionSeconds = 5 // 5 seconds for testing, actual should be 5 * 60

    const startTimeRef = useRef<number>(Date.now())
    const pausedDurationRef = useRef<number>(0)
    const pauseStartRef = useRef<number | null>(null)
    
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            if (pauseStartRef.current === null) {
                setElapsedTime(Date.now() - startTimeRef.current - pausedDurationRef.current)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

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

    const handleEnd = () => {
        // 🔒 Close any active pause before final calculation
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
