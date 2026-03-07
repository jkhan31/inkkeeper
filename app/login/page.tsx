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
        <main className="flex min-h-screen flex-col items-center justify-center bg-rice-paper text-sumi-ink">
            <div className="flex flex-col gap-4 w-72">
                <h1 className="text-2xl font-bold text-center tracking-tight mb-2">InkKeeper</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ink-input"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ink-input"
                />

                <button
                    onClick={() => router.push('/forgot-password')}
                    className="text-xs text-right text-sumi-ink/40 hover:text-seal-rust transition-colors -mt-1"
                >
                    Forgot password?
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handlePasswordLogin}
                        disabled={loading}
                        className="btn-primary flex-1 !py-2.5 !px-4 text-sm font-medium"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="flex-1 border border-seal-rust text-seal-rust rounded-full px-4 py-2.5 font-medium hover:bg-seal-rust/5 disabled:opacity-50 transition-colors text-sm"
                    >
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                </div>

                <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-sumi-ink/10" />
                    <span className="text-xs text-sumi-ink/40">or</span>
                    <div className="flex-1 h-px bg-sumi-ink/10" />
                </div>

                <button
                    onClick={handleMagicLink}
                    disabled={loading}
                    className="border border-sumi-ink/20 text-sumi-ink/60 rounded-full px-4 py-2.5 font-medium hover:border-seal-rust hover:text-seal-rust disabled:opacity-50 transition-colors text-sm"
                >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                </button>

                {error && <p className="text-sm text-center text-seal-rust">{error}</p>}
                {message && <p className="text-sm text-center text-sumi-ink/60">{message}</p>}
            </div>
        </main>
    )
}
