'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Setup() {
    const router = useRouter()

    // ─── Session Duration Selection ────────────────────────────────────────────
    const [totalSessions, setTotalSessions] = useState<number>(0)
    const [selectedDuration, setSelectedDuration] = useState<number>(15)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isAutoScrollingRef = useRef<boolean>(false)

    useEffect(() => {
        async function fetchSessionCount() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { count } = await supabase
                .from('sessions')
                .select('id', { count: 'exact', head: true })

            setTotalSessions(count ?? 0)
        }

        fetchSessionCount()
    }, [])

    const isRestricted = totalSessions < 3

    const durations = isRestricted 
        ? [10, 15, 20]
        : Array.from({ length: 60 / 5 }, (_, i) => (i + 1) * 5)

    // Scroll to 15 on mount
    useEffect(() => {
        if (scrollContainerRef.current && durations.length > 0) {
            const index = durations.indexOf(15)
            if (index !== -1) {
                const itemHeight = 50
                isAutoScrollingRef.current = true
                scrollContainerRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: 'auto'
                })

                setTimeout(() => {
                    isAutoScrollingRef.current = false
                }, 50)
            }
        }
    }, [durations])


    // Handle scroll to detect centered item
    const handleScroll = () => {
        if (!scrollContainerRef.current) return
        if (isAutoScrollingRef.current) return

        const container = scrollContainerRef.current
        const itemHeight = 50

        const centeredIndex = Math.round(container.scrollTop / itemHeight)

        if (centeredIndex >= 0 && centeredIndex < durations.length) {
            setSelectedDuration(durations[centeredIndex])
        }
    }

    // Scroll to a specific index
    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return

        const itemHeight = 50
        const top = index * itemHeight

        scrollContainerRef.current.scrollTo({ top, behavior: 'auto' })
        setSelectedDuration(durations[index])
    }

    const handleConfirm = () => {
        sessionStorage.setItem(
            'inkkeeper_selected_duration',
            selectedDuration.toString()
        )

        router.push('/session/active')
    }


    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-8">Session Setup</h1>

            <div className="relative">
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="w-32 h-[150px] overflow-y-scroll snap-y snap-proximity scroll-smooth [&::-webkit-scrollbar]:hidden"
                    style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <div className="h-[50px]" />
                    {durations.map((duration, index) => (
                        <div
                            key={duration}
                            onClick={() => scrollToIndex(index)}
                            className={`h-[50px] flex items-center justify-center snap-center transition-all cursor-pointer ${
                                duration === selectedDuration
                                    ? 'font-semibold opacity-100'
                                    : 'opacity-40'
                            }`}
                        >
                            {duration} min
                        </div>
                    ))}
                    <div className="h-[50px]" />
                </div>
                <div className="absolute top-[50px] left-0 right-0 h-[50px] border-t border-b border-gray-400 pointer-events-none" />
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleConfirm}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Confirm Duration
                </button>



                <Link href="/dashboard">
                    <button className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                        Cancel
                    </button>
                </Link>
            </div>
        </main>
    )
}
