'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Setup() {
    const [totalSessions, setTotalSessions] = useState<number>(0)

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

    return (
        <main>
            <h1>Session Setup</h1>

            <Link href="/session/active">
                <button>Confirm Duration</button>
            </Link>

            <Link href="/dashboard">
                <button>Cancel</button>
            </Link>
        </main>
    )
}
