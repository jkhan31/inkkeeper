'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: 'http://localhost:3000/dashboard'
            }
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Check your email for the login link!')
        }

        setLoading(false)
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF5F0] text-[#1A1A1A]">
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2"
            />
            <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-[#802B0A] text-white px-4 py-2"
            >
                {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            {message && <p>{message}</p>}
        </main>
    )
}