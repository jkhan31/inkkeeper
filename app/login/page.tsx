'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignIn = async () => {
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            setMessage('Account created! Check your email to confirm.')
            setLoading(false)
        }
    }

    const handleMagicLink = async () => {
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
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
            <div className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2"
                />
                
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2"
                />

                <button
                    onClick={() => router.push('/forgot-password')}
                    className="text-xs text-right opacity-60 hover:opacity-100"
                >
                    Forgot Password?
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="bg-[#802B0A] text-white px-4 py-2 flex-1"
                    >
                        {loading ? 'Loading...' : 'Sign In'}
                    </button>
                    
                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="bg-[#1A1A1A] text-white px-4 py-2 flex-1"
                    >
                        {loading ? 'Loading...' : 'Create Account'}
                    </button>
                </div>

                <div className="border-t pt-4">
                    <button
                        onClick={handleMagicLink}
                        disabled={loading}
                        className="border border-[#802B0A] text-[#802B0A] px-4 py-2 w-full"
                    >
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </div>

                {message && <p className="text-sm text-center">{message}</p>}
            </div>
        </main>
    )
}