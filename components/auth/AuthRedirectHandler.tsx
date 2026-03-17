'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthRedirectHandler() {
    const router = useRouter()

    useEffect(() => {
        const handleRedirect = () => {
            const hash = window.location.hash
            if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
                // If we detect a recovery fragment on any page (usually the home page fallback),
                // we redirect to the reset-password page preserving the hash for the Supabase client.
                router.replace(`/auth/reset-password${hash}`)
            }
        }

        handleRedirect()
        // Also listen for hash changes if any
        window.addEventListener('hashchange', handleRedirect)
        return () => window.removeEventListener('hashchange', handleRedirect)
    }, [router])

    return null
}
