const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

const AUTH_TOKEN_KEY =
    '39production_auth_token'

function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Helper utama untuk request ke Business API.
 *
 * Semua endpoint /api/admin/* membutuhkan
 * authentication token.
 */
export async function businessApi<T = any>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getAuthToken()

    if (!token) {
        throw new Error(
            'Authentication required.',
        )
    }

    const headers = new Headers(
        options.headers,
    )

    headers.set(
        'Content-Type',
        'application/json',
    )

    headers.set(
        'Authorization',
        `Bearer ${token}`,
    )

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            ...options,
            headers,
        },
    )

    const text =
        await response.text()

    let data: any = null

    try {
        data = text
            ? JSON.parse(text)
            : null
    } catch {
        throw new Error(
            text ||
            `HTTP ${response.status}`,
        )
    }

    /**
     * Session tidak valid / expired.
     */
    if (response.status === 401) {
        removeAuthToken()

        throw new Error(
            data?.message ||
            'Authentication session expired.',
        )
    }

    /**
     * Error dari Worker.
     */
    if (
        !response.ok ||
        data?.success === false
    ) {
        throw new Error(
            data?.message ||
            `HTTP ${response.status}`,
        )
    }

    return data as T
}

/* =========================
   GET
========================= */

export function get<T = any>(
    path: string,
): Promise<T> {
    return businessApi<T>(path)
}

/* =========================
   POST
========================= */

export function post<T = any>(
    path: string,
    body: unknown,
): Promise<T> {
    return businessApi<T>(
        path,
        {
            method: 'POST',
            body: JSON.stringify(body),
        },
    )
}

/* =========================
   PUT
========================= */

export function put<T = any>(
    path: string,
    body: unknown,
): Promise<T> {
    return businessApi<T>(
        path,
        {
            method: 'PUT',
            body: JSON.stringify(body),
        },
    )
}

/* =========================
   DELETE
========================= */

export function del<T = any>(
    path: string,
): Promise<T> {
    return businessApi<T>(
        path,
        {
            method: 'DELETE',
        },
    )
}

/* =========================
   FORMAT CURRENCY
========================= */

export function formatCurrency(
    value: number,
): string {
    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        },
    ).format(
        Number(value || 0),
    )
}

/* =========================
   FORMAT DATE
========================= */

export function formatDate(
    value: string,
): string {
    if (!value) {
        return '-'
    }

    const date = new Date(
        `${value.slice(0, 10)}T00:00:00`,
    )

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value
    }

    return new Intl.DateTimeFormat(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(date)
}