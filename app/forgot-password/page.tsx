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
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF5F0] text-[#1A1A1A]">
            <div className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>
                
                <p className="text-sm text-center opacity-60">
                    Enter your email and we'll send you a link to reset your password.
                </p>
                
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2"
                    disabled={success}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className="bg-[#802B0A] text-white px-4 py-2"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {message && (
                    <p className={`text-sm text-center ${success ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={() => router.push('/login')}
                    className="text-sm text-center opacity-60 hover:opacity-100"
                >
                    Back to Login
                </button>
            </div>
        </main>
    )
}
