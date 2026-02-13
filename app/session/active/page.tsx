'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Active() {
    const router = useRouter()

    const startTimeRef = useRef<number>(Date.now())
    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Date.now() - startTimeRef.current)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

    const handleEnd = () => {
        router.push('/dashboard')
    }

    return (
        <main>
            <h1>Active Session</h1>
            <div>{formatTime(elapsedTime)}</div>
            <button onClick={handleEnd}>End</button>
        </main>
    )
}
