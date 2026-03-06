import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

/**
 * Guards client-side pages that require authentication.
 * Uses getSession() — reads from the local cookie without a network call,
 * so it works correctly both online and offline (PWA).
 *
 * Returns { user, loading } so pages can show a neutral loading state
 * before the auth check resolves, preventing layout shift.
 */
export function useAuthGuard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace('/login')
            } else {
                setUser(session.user)
            }
            setLoading(false)
        })
    }, [router])

    return { user, loading }
}
