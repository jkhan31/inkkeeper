'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            if (!data.user) {
                router.push('/login')
            } else {
                setUser(data.user)
            }
        }

        getUser()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!user) return null

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF5F0] text-[#1A1A1A]">
            <h1>Welcome, {user.email}</h1>
            <button
                onClick={handleLogout}
                className="bg-[#802B0A] text-white px-4 py-2"
            >
                Logout
            </button>
        </main>
    )
}