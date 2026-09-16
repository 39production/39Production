const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

const AUTH_TOKEN_KEY = '39production_auth_token'

export interface AuthUser {
    id: number
    name: string
    email: string
    status: string
}

interface AuthResponse {
    success: boolean
    message?: string
    data?: {
        token?: string
        expires_at?: string
        user?: AuthUser
    }
}

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
    return Boolean(getAuthToken())
}

export async function login(
    email: string,
    password: string,
): Promise<AuthUser> {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        },
    )

    const result =
        (await response.json()) as AuthResponse

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            'Invalid email or password.',
        )
    }

    const token = result.data?.token
    const user = result.data?.user

    if (!token || !user) {
        throw new Error(
            'Invalid authentication response.',
        )
    }

    setAuthToken(token)

    return user
}

export async function getCurrentUser(): Promise<AuthUser> {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Authentication required.')
    }

    const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    const result =
        (await response.json()) as {
            success: boolean
            message?: string
            data?: {
                user?: AuthUser
            }
        }

    if (!response.ok || !result.success) {
        removeAuthToken()

        throw new Error(
            result.message ||
            'Authentication session expired.',
        )
    }

    if (!result.data?.user) {
        removeAuthToken()

        throw new Error(
            'Invalid authentication response.',
        )
    }

    return result.data.user
}

export async function logout() {
    const token = getAuthToken()

    try {
        if (token) {
            await fetch(
                `${API_BASE_URL}/api/auth/logout`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
        }
    } finally {
        removeAuthToken()
    }
}

export async function changePassword(
    currentPassword: string,
    newPassword: string,
) {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Authentication required.')
    }

    const response = await fetch(
        `${API_BASE_URL}/api/auth/change-password`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        },
    )

    const result =
        (await response.json()) as {
            success: boolean
            message?: string
        }

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            'Failed to change password.',
        )
    }

    // Worker revokes all sessions after password change.
    removeAuthToken()

    return result.message ||
        'Password changed successfully.'
}

export async function authenticatedFetch(
    input: string,
    init: RequestInit = {},
) {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Authentication required.')
    }

    const headers = new Headers(init.headers)

    headers.set(
        'Authorization',
        `Bearer ${token}`,
    )

    if (
        init.body &&
        !headers.has('Content-Type')
    ) {
        headers.set(
            'Content-Type',
            'application/json',
        )
    }

    const response = await fetch(input, {
        ...init,
        headers,
    })

    if (response.status === 401) {
        removeAuthToken()
    }

    return response
}

