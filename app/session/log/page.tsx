'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SessionData {
    startTime: string
    endTime: string
}

export default function Log() {
    const router = useRouter()
    const [sessionData, setSessionData] = useState<SessionData | null>(null)
    const [durationMinutes, setDurationMinutes] = useState<number>(0)

    useEffect(() => {
        const storedSession = sessionStorage.getItem('inkkeeper_active_session')
        
        if (!storedSession) {
            router.push('/dashboard')
            return
        }

        try {
            const parsed: SessionData = JSON.parse(storedSession)
            setSessionData(parsed)

            // Calculate duration in minutes
            const start = new Date(parsed.startTime)
            const end = new Date(parsed.endTime)
            const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60)
            setDurationMinutes(duration)
        } catch (error) {
            console.error('Failed to parse session data:', error)
            router.push('/dashboard')
        }
    }, [router])

    if (!sessionData) {
        return <div>Loading...</div>
    }

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleString()
    }

    return (
        <main>
            <h1>Log Session</h1>

            <div>
                <h2>Duration: {durationMinutes} minutes</h2>
                <p>Start: {formatTime(sessionData.startTime)}</p>
                <p>End: {formatTime(sessionData.endTime)}</p>
            </div>

            <Link href="/dashboard">
                <button>Save</button>
            </Link>
        </main>
    )
}
