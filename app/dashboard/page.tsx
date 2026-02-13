'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            // DEV BYPASS
            if (process.env.NEXT_PUBLIC_DEV_BYPASS === 'true') {
                setUser({ email: 'dev@local.test' })
                return
            }

            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.replace('/login')
            } else {
                setUser(session.user)
            }
        }

        checkSession()
    }, [router])



    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!user) return null

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAF5F0] text-[#1A1A1A]">
            <h1>Welcome, {user.email}</h1>

            <button
                onClick={() => router.push('/session/setup')}
                className="bg-[#3F5A4A] text-white px-6 py-3"
            >
                Begin Session
            </button>

            <button
                onClick={() => router.push('/history')}
                className="border border-[#1A1A1A] px-6 py-3"
            >
                View History
            </button>

            <button
                onClick={handleLogout}
                className="text-sm opacity-60"
            >
                Logout
            </button>
        </main>
    )

}