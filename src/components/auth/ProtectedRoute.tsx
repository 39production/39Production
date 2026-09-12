import {
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
    getCurrentUser,
    getAuthToken,
} from '@/lib/auth'

export function ProtectedRoute() {
    const location = useLocation()

    const [checking, setChecking] =
        useState(true)

    const [authenticated, setAuthenticated] =
        useState(false)

    useEffect(() => {
        let mounted = true

        async function checkAuthentication() {
            const token = getAuthToken()

            if (!token) {
                if (mounted) {
                    setAuthenticated(false)
                    setChecking(false)
                }

                return
            }

            try {
                await getCurrentUser()

                if (mounted) {
                    setAuthenticated(true)
                }
            } catch {
                if (mounted) {
                    setAuthenticated(false)
                }
            } finally {
                if (mounted) {
                    setChecking(false)
                }
            }
        }

        checkAuthentication()

        return () => {
            mounted = false
        }
    }, [])

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-base">
                <div className="text-sm text-text-muted">
                    Checking authentication...
                </div>
            </div>
        )
    }

    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        )
    }

    return <Outlet />
}