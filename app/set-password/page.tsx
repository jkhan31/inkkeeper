'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function SetPassword() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [requiresCurrentPassword, setRequiresCurrentPassword] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    // Check if user has an existing password
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                router.replace('/login')
                return
            }

            setUserEmail(user.email || '')
            
            // Check if user has a password set (has email in identities means they signed up with password)
            const hasPasswordIdentity = user.identities?.some(
                identity => identity.provider === 'email'
            )
            setRequiresCurrentPassword(hasPasswordIdentity || false)
        }

        checkUser()
    }, [router])

    const handleSubmit = async () => {
        setMessage('')

        // Validation
        if (requiresCurrentPassword && !currentPassword) {
            setMessage('Please enter your current password')
            return
        }

        if (!newPassword || !confirmPassword) {
            setMessage('Please fill in all fields')
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        // If changing password, verify current password first
        if (requiresCurrentPassword) {
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: currentPassword
            })

            if (verifyError) {
                setMessage('Current password is incorrect')
                setLoading(false)
                return
            }
        }

        // Update to new password
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF5F0] text-[#1A1A1A]">
            <div className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-bold text-center tracking-tight mb-2">
                    {requiresCurrentPassword ? 'Change Password' : 'Set Password'}
                </h1>

                {requiresCurrentPassword && (
                    <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                    />
                )}

                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                />

                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border border-[#1A1A1A]/20 rounded-lg px-4 py-2.5 bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#8F270D] transition-colors"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#8F270D] text-white rounded-full px-4 py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>

                {message && (
                    <p className="text-sm text-center text-[#8F270D]">{message}</p>
                )}
            </div>
        </main>
    )
}
