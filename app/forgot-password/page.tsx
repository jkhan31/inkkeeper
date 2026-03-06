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
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF5F0] text-[#1A1A1A]">
            <div className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-bold text-center tracking-tight mb-2">Reset Password</h1>

                <p className="text-sm text-center text-[#1A1A1A]/40">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                    disabled={success}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className="bg-[#8F270D] text-white rounded-full px-4 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {message && (
                    <p className={`text-sm text-center ${success ? 'text-[#1A1A1A]/60' : 'text-[#8F270D]'}`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={() => router.push('/login')}
                    className="border border-[#8F270D] text-[#8F270D] rounded-full px-4 py-2.5 font-medium hover:bg-[#8F270D]/5 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </main>
    )
}
