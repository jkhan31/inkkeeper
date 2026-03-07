'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function SetPassword() {
    const router = useRouter()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRecoveryMode, setIsRecoveryMode] = useState(false)

    useEffect(() => {
        const handleSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            // Recovery links can surface as query/hash params depending on provider flow.
            const href = window.location.href
            const hasRecoveryParam = href.includes('type=recovery')
            setIsRecoveryMode(hasRecoveryParam)

            if (!session) {
                router.replace('/login')
            }
        }

        handleSession()

        // Listen for the recovery event specifically
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true)
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSubmit = async () => {
        setMessage('')

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        // In Recovery Mode, we ONLY need the new password. 
        // Supabase handles the identity via the session token.
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            // Success! Clear recovery state and head to dashboard
            setIsRecoveryMode(false)
            router.push('/dashboard')
        }
    }

    return (
        <main className="flex min-h-screen flex-col bg-rice-paper text-sumi-ink">
            <div className="px-6 pt-8">
                <button
                    onClick={() => router.push('/dashboard')}
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
                    <h1 className="text-2xl font-bold text-center tracking-tight mb-2">
                        {isRecoveryMode ? 'Create New Password' : 'Set Account Password'}
                    </h1>

                    <p className="text-sm text-center text-sumi-ink/60 mb-2">
                        {isRecoveryMode
                            ? "Enter a new password to regain access to your archive."
                            : "Secure your archive with a password."}
                    </p>

                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="ink-input"
                    />

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="ink-input"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary w-full !py-2.5 text-sm font-medium mt-2"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>

                    {message && (
                        <p className="text-sm text-center text-seal-rust animate-pulse">{message}</p>
                    )}
                </div>
            </div>
        </main>
    )
}