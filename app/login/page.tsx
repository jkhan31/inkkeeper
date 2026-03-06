'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePasswordLogin = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleMagicLink = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Check your email for a login link.')
        }

        setLoading(false)
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF5F0] text-[#1A1A1A]">
            <div className="flex flex-col gap-4 w-72">
                <h1 className="text-2xl font-bold text-center tracking-tight mb-2">InkKeeper</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                />

                <button
                    onClick={() => router.push('/forgot-password')}
                    className="text-xs text-right text-[#1A1A1A]/40 hover:text-[#8F270D] transition-colors -mt-1"
                >
                    Forgot password?
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handlePasswordLogin}
                        disabled={loading}
                        className="flex-1 bg-[#8F270D] text-white rounded-full px-4 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="flex-1 border border-[#8F270D] text-[#8F270D] rounded-full px-4 py-2.5 font-medium hover:bg-[#8F270D]/5 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                </div>

                <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#1A1A1A]/10" />
                    <span className="text-xs text-[#1A1A1A]/40">or</span>
                    <div className="flex-1 h-px bg-[#1A1A1A]/10" />
                </div>

                <button
                    onClick={handleMagicLink}
                    disabled={loading}
                    className="border border-[#1A1A1A]/20 text-[#1A1A1A]/60 rounded-full px-4 py-2.5 font-medium hover:border-[#8F270D] hover:text-[#8F270D] disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                </button>

                {error && <p className="text-sm text-center text-[#8F270D]">{error}</p>}
                {message && <p className="text-sm text-center text-[#1A1A1A]/60">{message}</p>}
            </div>
        </main>
    )
}
