'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ForgotPassword() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async () => {
        setMessage('')

        if (!email) {
            setMessage('Please enter your email')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/set-password`
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setMessage('Check your email for a password reset link')
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen flex-col bg-rice-paper text-sumi-ink">
            {/* Back button */}
            <div className="px-6 pt-8">
                <button
                    onClick={() => router.push('/login')}
                    className="inline-flex items-center text-sumi-ink/50 hover:text-sumi-ink transition-colors rounded-full"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-4 w-80">
                    <h1 className="text-2xl font-bold text-center tracking-tight mb-2">Reset Password</h1>

                    <p className="text-sm text-center text-sumi-ink/40">
                        Enter your email and we&apos;ll send you a link to reset your password.
                    </p>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ink-input"
                        disabled={success}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className="btn-primary w-full !py-2.5 text-sm font-medium"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    {message && (
                        <p className={`text-sm text-center ${success ? 'text-sumi-ink/60' : 'text-seal-rust'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    )
}
