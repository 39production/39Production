interface Env {
    DB: D1Database

    // Required only for the first admin bootstrap.
    // Store ADMIN_PASSWORD as a Cloudflare Secret.
    ADMIN_EMAIL?: string
    ADMIN_PASSWORD?: string
    // Optional comma-separated browser origins. Defaults to production + local Vite origins.
    ALLOWED_ORIGINS?: string

    // Resend transactional email
    RESEND_API_KEY?: string
    RESEND_FROM?: string

    // DANA QRIS MPM / SNAP
    DANA_ENV?: string
    DANA_BASE_URL?: string
    DANA_MERCHANT_ID?: string
    DANA_PARTNER_ID?: string
    DANA_CLIENT_SECRET?: string
    DANA_PRIVATE_KEY?: string
    DANA_PUBLIC_KEY?: string
    DANA_WEBHOOK_PUBLIC_KEY?: string
    DANA_STORE_ID?: string
    DANA_ORIGIN?: string
    DANA_CHANNEL_ID?: string
}

/* =========================
   CORS
========================= */

const DEFAULT_ALLOWED_ORIGINS = [
    'https://39production.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

const MAX_REQUEST_BODY_BYTES = 2 * 1024 * 1024
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

// Best-effort per-isolate protection. For production-wide/distributed rate
// limiting, also configure Cloudflare WAF/Rate Limiting at the zone level.
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

const publicRateLimits = new Map<string, { count: number; resetAt: number }>()

function consumePublicRateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
    const now = Date.now()
    const key = `${bucket}:${getClientIp(request)}`
    const current = publicRateLimits.get(key)

    if (!current || current.resetAt <= now) {
        publicRateLimits.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, retryAfter: 0 }
    }

    if (current.count >= limit) {
        return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
    }

    current.count += 1
    return { allowed: true, retryAfter: 0 }
}

function rateLimitResponse(retryAfter: number, request?: Request, env?: Env) {
    return new Response(JSON.stringify({ success: false, message: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Retry-After': String(retryAfter),
            ...getCorsHeaders(request?.headers.get('Origin') || undefined, env),
            ...securityHeaders(),
        },
    })
}



function getAllowedOrigins(env?: Env) {
    const configured = env?.ALLOWED_ORIGINS?.split(',').map((value) => value.trim()).filter(Boolean) || []
    return configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS
}

function getCorsHeaders(origin?: string, env?: Env) {
    const allowed = getAllowedOrigins(env)

    // If the browser supplied an Origin, only echo it when it is explicitly
    // allowlisted. Do not emit an arbitrary fallback ACAO value for a denied
    // origin; that makes security testing and browser behavior unambiguous.
    if (origin) {
        if (!allowed.includes(origin)) {
            return {
                'Vary': 'Origin',
            }
        }

        return {
            'Access-Control-Allow-Origin': origin,
            'Vary': 'Origin',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        }
    }

    return {
        'Access-Control-Allow-Origin': allowed[0],
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    }
}

function securityHeaders() {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
        'Cache-Control': 'no-store',
    }
}

function json(
    data: unknown,
    status = 200,
    origin?: string,
    env?: Env,
) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                ...getCorsHeaders(origin, env),
                ...securityHeaders(),
            },
        },
    )
}

function getClientIp(request: Request) {
    return request.headers.get('CF-Connecting-IP')
        || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
        || 'unknown'
}

function consumeLoginAttempt(request: Request, email: string) {
    const now = Date.now()
    const key = `${getClientIp(request)}:${email}`
    const current = loginAttempts.get(key)

    if (!current || current.resetAt <= now) {
        loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
        return { allowed: true, retryAfter: 0 }
    }

    if (current.count >= LOGIN_MAX_ATTEMPTS) {
        return {
            allowed: false,
            retryAfter: Math.ceil((current.resetAt - now) / 1000),
        }
    }

    current.count += 1
    return { allowed: true, retryAfter: 0 }
}

function resetLoginAttempts(request: Request, email: string) {
    loginAttempts.delete(`${getClientIp(request)}:${email}`)
}

async function checkRequestBodySize(request: Request) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return null

    const contentLength = request.headers.get('content-length')
    if (contentLength) {
        const size = Number(contentLength)
        if (!Number.isFinite(size) || size < 0) return json({ success: false, message: 'Invalid Content-Length.' }, 400)
        if (size > MAX_REQUEST_BODY_BYTES) {
            return json({ success: false, message: 'Request body is too large.' }, 413)
        }
        return null
    }

    // Chunked requests may omit Content-Length. Inspect a clone so the actual
    // request body remains available to request.json()/formData().
    if (request.body) {
        const bytes = new Uint8Array(await request.clone().arrayBuffer())
        if (bytes.byteLength > MAX_REQUEST_BODY_BYTES) {
            return json({ success: false, message: 'Request body is too large.' }, 413)
        }
    }

    return null
}

/* =========================
   SECURITY SCHEMA / RBAC
========================= */

let securitySchemaReady = false

async function backfillLegacyPublicPaymentTokenHashes(env: Env) {
    // Legacy orders may still contain a raw public token. Convert a bounded
    // batch at startup so new code never needs to depend on plaintext tokens.
    // The hash is sufficient for all subsequent authorization checks.
    const rows = await env.DB.prepare(`
        SELECT id, public_payment_token
        FROM orders
        WHERE public_payment_token IS NOT NULL
          AND public_payment_token != ''
          AND (public_payment_token_hash IS NULL OR public_payment_token_hash = '')
        LIMIT 100
    `).all<{ id: number; public_payment_token: string }>()

    if (!rows.results.length) return

    const statements = []
    for (const row of rows.results) {
        const tokenHash = await sha256(row.public_payment_token)
        statements.push(
            env.DB.prepare(`
                UPDATE orders
                SET public_payment_token_hash = ?, public_payment_token = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND public_payment_token = ?
            `).bind(tokenHash, row.id, row.public_payment_token),
        )
    }

    if (statements.length) {
        await env.DB.batch(statements)
    }
}

async function ensureSecuritySchema(env: Env) {
    if (securitySchemaReady) return

    // These are additive compatibility checks. Production schema changes
    // should be applied through the committed D1 migration as well.
    try {
        await env.DB.prepare(`ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'Founder'`).run()
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        if (!message.includes('duplicate column') && !message.includes('already exists')) throw error
    }

    try {
        await env.DB.prepare(`ALTER TABLE payment_transactions ADD COLUMN public_access_token_hash TEXT`).run()
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        if (!message.includes('duplicate column') && !message.includes('already exists')) throw error
    }

    try {
        await env.DB.prepare(`ALTER TABLE orders ADD COLUMN public_payment_token_hash TEXT`).run()
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        if (!message.includes('duplicate column') && !message.includes('already exists')) throw error
    }

    await env.DB.batch([
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash)`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_public_payment_token_hash ON orders(public_payment_token_hash)`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_access_token_hash ON payment_transactions(public_access_token_hash)`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(payment_reference)`),
    ])

    await backfillLegacyPublicPaymentTokenHashes(env)
    securitySchemaReady = true
}

type AdminRole = 'Founder' | 'Co-Founder' | 'Admin' | 'Viewer'

const ADMIN_PERMISSIONS: Record<AdminRole, Set<string>> = {
    Founder: new Set(['*']),
    'Co-Founder': new Set([
        'dashboard:read', 'members:read', 'members:write',
        'projects:read', 'projects:write', 'finance:read', 'finance:write',
        'revenue:read', 'revenue:write', 'documents:read', 'documents:write',
        'audit:read', 'content:read', 'content:write', 'orders:read', 'settings:write', 'notifications:read', 'notifications:write',
    ]),
    Admin: new Set([
        'dashboard:read', 'members:read', 'projects:read', 'projects:write',
        'finance:read', 'finance:write', 'documents:read', 'documents:write', 'settings:write', 'notifications:read', 'notifications:write',
        'content:read', 'content:write', 'orders:read',
    ]),
    Viewer: new Set(['dashboard:read', 'members:read', 'projects:read', 'finance:read', 'documents:read', 'orders:read']),
}

function hasPermission(role: string, permission: string) {
    const permissions = ADMIN_PERMISSIONS[role as AdminRole]
    return !!permissions && (permissions.has('*') || permissions.has(permission))
}

async function requirePermission(
    request: Request,
    env: Env,
    permission: string,
) {
    const auth = await requireAuth(request, env)
    if (auth instanceof Response) return auth

    if (!hasPermission(auth.user.role || 'Viewer', permission)) {
        return json({ success: false, message: 'Forbidden.' }, 403)
    }

    return auth
}

/* =========================
   AUTHENTICATION
========================= */

type AuthUser = {
    id: number
    name: string
    email: string
    status: string
    role: string
}

interface LoginPayload {
    email?: unknown
    password?: unknown
}

interface ChangePasswordPayload {
    current_password?: unknown
    new_password?: unknown
}

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7
const PBKDF2_ITERATIONS = 100000

function bytesToBase64Url(bytes: Uint8Array) {
    let binary = ''

    for (const byte of bytes) {
        binary += String.fromCharCode(byte)
    }

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

function base64UrlToBytes(value: string) {
    const base64 = value
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(value.length / 4) * 4, '=')

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i)
    }

    return bytes
}

async function sha256(value: string) {
    const data = new TextEncoder().encode(value)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return bytesToBase64Url(new Uint8Array(digest))
}

function constantTimeEqual(
    a: Uint8Array,
    b: Uint8Array,
) {
    if (a.length !== b.length) {
        return false
    }

    let result = 0

    for (let i = 0; i < a.length; i += 1) {
        result |= a[i] ^ b[i]
    }

    return result === 0
}

async function hashPassword(password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16))

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    )

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        key,
        256,
    )

    return [
        'pbkdf2',
        String(PBKDF2_ITERATIONS),
        bytesToBase64Url(salt),
        bytesToBase64Url(new Uint8Array(derivedBits)),
    ].join('$')
}

async function verifyPassword(
    password: string,
    storedHash: string,
) {
    const parts = storedHash.split('$')

    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
        return false
    }

    const iterations = Number(parts[1])
    const salt = base64UrlToBytes(parts[2])
    const expected = base64UrlToBytes(parts[3])

    if (
        !Number.isInteger(iterations) ||
        iterations < 1 ||
        salt.length === 0 ||
        expected.length === 0
    ) {
        return false
    }

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    )

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256',
        },
        key,
        expected.length * 8,
    )

    return constantTimeEqual(
        new Uint8Array(derivedBits),
        expected,
    )
}

function getBearerToken(request: Request) {
    const header = request.headers.get('Authorization')

    if (!header) {
        return null
    }

    const match = header.match(/^Bearer\s+(.+)$/i)
    return match?.[1]?.trim() || null
}

async function createSession(
    env: Env,
    userId: number,
) {
    const tokenBytes = crypto.getRandomValues(
        new Uint8Array(32),
    )

    const token = bytesToBase64Url(tokenBytes)
    const tokenHash = await sha256(token)
    const expiresAt =
        Math.floor(Date.now() / 1000) +
        SESSION_DURATION_SECONDS

    await env.DB.prepare(`
    INSERT INTO admin_sessions (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `)
        .bind(userId, tokenHash, expiresAt)
        .run()

    return {
        token,
        expires_at: new Date(
            expiresAt * 1000,
        ).toISOString(),
    }
}

async function getAuthUser(
    request: Request,
    env: Env,
): Promise<{
    user: AuthUser
    tokenHash: string
} | null> {
    const token = getBearerToken(request)

    if (!token) {
        return null
    }

    const tokenHash = await sha256(token)
    const now = Math.floor(Date.now() / 1000)

    const result = await env.DB.prepare(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.status,
      COALESCE(u.role, 'Founder') AS role
    FROM admin_sessions s
    INNER JOIN admin_users u
      ON u.id = s.user_id
    WHERE s.token_hash = ?
      AND s.expires_at > ?
      AND u.status = 'Active'
    LIMIT 1
  `)
        .bind(tokenHash, now)
        .first<AuthUser>()

    if (!result) {
        return null
    }

    return {
        user: result,
        tokenHash,
    }
}

async function requireAuth(
    request: Request,
    env: Env,
) {
    const auth = await getAuthUser(request, env)

    if (!auth) {
        return json(
            {
                success: false,
                message: 'Authentication required.',
            },
            401,
        )
    }

    return auth
}

async function ensureAdminUser(env: Env) {
    const existing = await env.DB.prepare(`
    SELECT id
    FROM admin_users
    WHERE id = 1
    LIMIT 1
  `).first<{ id: number }>()

    if (existing) {
        return true
    }

    const email = env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = env.ADMIN_PASSWORD

    if (!email || !password) {
        throw new Error(
            'ADMIN_EMAIL and ADMIN_PASSWORD secrets are required to bootstrap the first admin.',
        )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('ADMIN_EMAIL is invalid.')
    }

    if (password.length < 12) {
        throw new Error(
            'ADMIN_PASSWORD must be at least 12 characters.',
        )
    }

    const passwordHash = await hashPassword(password)

    await env.DB.prepare(`
    INSERT INTO admin_users (
      id,
      name,
      email,
      password_hash,
      status
    )
    VALUES (1, ?, ?, ?, 'Active')
  `)
        .bind(
            'Admin 39Production',
            email,
            passwordHash,
        )
        .run()

    return true
}

async function loginAdmin(
    request: Request,
    env: Env,
    body: LoginPayload,
) {
    const email =
        typeof body.email === 'string'
            ? body.email.trim().toLowerCase()
            : ''

    const password =
        typeof body.password === 'string'
            ? body.password
            : ''

    if (!email || !password) {
        return json(
            {
                success: false,
                message: 'Email and password are required.',
            },
            400,
        )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(
            {
                success: false,
                message: 'Please enter a valid email address.',
            },
            400,
        )
    }

    const loginLimit = consumeLoginAttempt(request, email)
    if (!loginLimit.allowed) {
        return new Response(
            JSON.stringify({ success: false, message: 'Too many login attempts. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Retry-After': String(loginLimit.retryAfter),
                    ...getCorsHeaders(request.headers.get('Origin') || undefined, env),
                    ...securityHeaders(),
                },
            },
        )
    }

    try {
        await ensureAdminUser(env)

        const user = await env.DB.prepare(`
      SELECT
        id,
        name,
        email,
        password_hash,
        status,
        COALESCE(role, 'Founder') AS role
      FROM admin_users
      WHERE lower(email) = ?
      LIMIT 1
    `)
            .bind(email)
            .first<{
                id: number
                name: string
                email: string
                password_hash: string
                status: string
            }>()

        if (!user || user.status !== 'Active') {
            return json(
                {
                    success: false,
                    message: 'Invalid email or password.',
                },
                401,
            )
        }

        const validPassword = await verifyPassword(
            password,
            user.password_hash,
        )

        if (!validPassword) {
            return json(
                {
                    success: false,
                    message: 'Invalid email or password.',
                },
                401,
            )
        }

        resetLoginAttempts(request, email)

        const session = await createSession(
            env,
            user.id,
        )

        return json({
            success: true,
            message: 'Login successful.',
            data: {
                token: session.token,
                expires_at: session.expires_at,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: user.status,
                    role: user.role || 'Founder',
                },
            },
        })
    } catch (error) {
        console.error('Admin login error:', error)

        return json(
            {
                success: false,
                message: 'Authentication is not configured correctly.',
            },
            500,
        )
    }
}

async function getCurrentAdmin(
    request: Request,
    env: Env,
) {
    const auth = await requireAuth(request, env)

    if (auth instanceof Response) {
        return auth
    }

    return json({
        success: true,
        data: {
            user: auth.user,
        },
    })
}

async function logoutAdmin(
    request: Request,
    env: Env,
) {
    const token = getBearerToken(request)

    if (!token) {
        return json({
            success: true,
            message: 'Logged out successfully.',
        })
    }

    const tokenHash = await sha256(token)

    try {
        await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE token_hash = ?
    `)
            .bind(tokenHash)
            .run()

        return json({
            success: true,
            message: 'Logged out successfully.',
        })
    } catch (error) {
        console.error('Admin logout error:', error)

        return json(
            {
                success: false,
                message: 'Failed to logout.',
            },
            500,
        )
    }
}

async function changeAdminPassword(
    request: Request,
    env: Env,
    body: ChangePasswordPayload,
) {
    const auth = await requireAuth(request, env)

    if (auth instanceof Response) {
        return auth
    }

    const currentPassword =
        typeof body.current_password === 'string'
            ? body.current_password
            : ''

    const newPassword =
        typeof body.new_password === 'string'
            ? body.new_password
            : ''

    if (!currentPassword || !newPassword) {
        return json(
            {
                success: false,
                message:
                    'Current password and new password are required.',
            },
            400,
        )
    }

    if (newPassword.length < 12) {
        return json(
            {
                success: false,
                message:
                    'New password must be at least 12 characters.',
            },
            400,
        )
    }

    if (currentPassword === newPassword) {
        return json(
            {
                success: false,
                message:
                    'New password must be different from the current password.',
            },
            400,
        )
    }

    try {
        const user = await env.DB.prepare(`
      SELECT password_hash
      FROM admin_users
      WHERE id = ?
      LIMIT 1
    `)
            .bind(auth.user.id)
            .first<{ password_hash: string }>()

        if (!user) {
            return json(
                {
                    success: false,
                    message: 'Admin account not found.',
                },
                404,
            )
        }

        const validPassword = await verifyPassword(
            currentPassword,
            user.password_hash,
        )

        if (!validPassword) {
            return json(
                {
                    success: false,
                    message: 'Current password is incorrect.',
                },
                400,
            )
        }

        const passwordHash = await hashPassword(
            newPassword,
        )

        await env.DB.prepare(`
      UPDATE admin_users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(passwordHash, auth.user.id)
            .run()

        // Revoke all sessions after a password change.
        await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE user_id = ?
    `)
            .bind(auth.user.id)
            .run()

        return json({
            success: true,
            message:
                'Password changed successfully. Please login again.',
        })
    } catch (error) {
        console.error(
            'Change admin password error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to change password.',
            },
            500,
        )
    }
}

async function cleanupExpiredSessions(env: Env) {
    try {
        const now = Math.floor(Date.now() / 1000)

        await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE expires_at <= ?
    `)
            .bind(now)
            .run()
    } catch (error) {
        console.error(
            'Cleanup expired sessions error:',
            error,
        )
    }
}

/* =========================
   ADMIN NOTIFICATIONS
========================= */

async function createAdminNotification(
    env: Env,
    input: {
        type: string
        title: string
        message: string
        referenceType?: string | null
        referenceId?: number | null
        referenceNumber?: string | null
    },
) {
    try {
        await env.DB.prepare(`
      INSERT INTO admin_notifications (
        type,
        title,
        message,
        reference_type,
        reference_id,
        reference_number,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `)
            .bind(
                input.type,
                input.title,
                input.message,
                input.referenceType ?? null,
                input.referenceId ?? null,
                input.referenceNumber ?? null,
            )
            .run()
    } catch (error) {
        // Notification failure must never break the actual customer transaction.
        console.error('Create admin notification error:', error)
    }
}

async function getAdminNotifications(
    request: Request,
    env: Env,
) {
    const auth = await requireAuth(request, env)

    if (auth instanceof Response) {
        return auth
    }

    try {
        const result = await env.DB.prepare(`
      SELECT
        id,
        type,
        title,
        message,
        reference_type,
        reference_id,
        reference_number,
        is_read,
        created_at
      FROM admin_notifications
      ORDER BY id DESC
      LIMIT 30
    `).all()

        const unread = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM admin_notifications
      WHERE is_read = 0
    `).first<{ count: number }>()

        return json({
            success: true,
            data: {
                unread_count: Number(unread?.count ?? 0),
                notifications: result.results,
            },
        })
    } catch (error) {
        console.error('Get admin notifications error:', error)
        return json(
            {
                success: false,
                message: 'Failed to fetch admin notifications.',
            },
            500,
        )
    }
}

async function markAdminNotificationRead(
    request: Request,
    env: Env,
    id: number,
) {
    const auth = await requireAuth(request, env)

    if (auth instanceof Response) {
        return auth
    }

    try {
        await env.DB.prepare(`
      UPDATE admin_notifications
      SET is_read = 1
      WHERE id = ?
    `).bind(id).run()

        return json({
            success: true,
            message: 'Notification marked as read.',
        })
    } catch (error) {
        console.error('Mark notification read error:', error)
        return json(
            {
                success: false,
                message: 'Failed to update notification.',
            },
            500,
        )
    }
}

async function markAllAdminNotificationsRead(
    request: Request,
    env: Env,
) {
    const auth = await requireAuth(request, env)

    if (auth instanceof Response) {
        return auth
    }

    try {
        await env.DB.prepare(`
      UPDATE admin_notifications
      SET is_read = 1
      WHERE is_read = 0
    `).run()

        return json({
            success: true,
            message: 'All notifications marked as read.',
        })
    } catch (error) {
        console.error('Mark all notifications read error:', error)
        return json(
            {
                success: false,
                message: 'Failed to update notifications.',
            },
            500,
        )
    }
}

async function sendAdminEmailNotification(
    env: Env,
    input: {
        title: string
        message: string
        referenceType?: string | null
        referenceNumber?: string | null
        customerName?: string | null
        customerEmail?: string | null
        customerPhone?: string | null
        itemName?: string | null
        amount?: number | null
    },
) {
    const apiKey = env.RESEND_API_KEY?.trim()
    const from = env.RESEND_FROM?.trim()

    if (!apiKey || !from) {
        console.warn(
            'Admin email notification skipped: RESEND_API_KEY or RESEND_FROM is not configured.',
        )
        return
    }

    try {
        let adminEmail = env.ADMIN_EMAIL?.trim()

        if (!adminEmail) {
            const settings = await env.DB.prepare(`
        SELECT admin_email FROM site_settings WHERE id = 1 LIMIT 1
      `).first<{ admin_email: string }>()
            adminEmail = settings?.admin_email?.trim()
        }

        if (!adminEmail) {
            console.warn('Admin email notification skipped: admin email is not configured.')
            return
        }

        const safe = (value: unknown) => String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')

        const amountText = typeof input.amount === 'number'
            ? `Rp ${input.amount.toLocaleString('id-ID')}` : '-'

        const html = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#18181b">
  <div style="padding:24px;background:#09090b;color:#fff;border-radius:16px 16px 0 0">
    <div style="font-size:12px;letter-spacing:.12em;color:#a1a1aa">39PRODUCTION</div>
    <h1 style="margin:8px 0 0;font-size:24px">${safe(input.title)}</h1>
  </div>
  <div style="padding:24px;border:1px solid #e4e4e7;border-top:0;border-radius:0 0 16px 16px">
    <p style="margin-top:0">${safe(input.message)}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <tr><td style="padding:8px 0;color:#71717a">Reference</td><td style="padding:8px 0;font-weight:600">${safe(input.referenceNumber || '-')}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Customer</td><td style="padding:8px 0">${safe(input.customerName || '-')}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Email</td><td style="padding:8px 0">${safe(input.customerEmail || '-')}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Phone</td><td style="padding:8px 0">${safe(input.customerPhone || '-')}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Item / Service</td><td style="padding:8px 0">${safe(input.itemName || '-')}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Amount</td><td style="padding:8px 0;font-weight:700">${safe(amountText)}</td></tr>
    </table>
    <p style="margin:24px 0 0;color:#71717a;font-size:13px">This is an automatic notification from the 39Production system.</p>
  </div>
</div>`

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from, to: [adminEmail],
                subject: `[39Production] ${input.title} — ${input.referenceNumber || 'Notification'}`,
                html,
            }),
        })

        if (!response.ok) {
            console.error('Resend admin notification failed:', response.status, await response.text())
            return
        }

        console.log('Admin email notification sent:', await response.json())
    } catch (error) {
        console.error('Send admin email notification error:', error)
    }
}

/* =========================
   SERVICES
========================= */

interface ServicePayload {
    name?: unknown
    category?: unknown
    description?: unknown
    price?: unknown
    pricing_type?: unknown
    starting_price?: unknown
    status?: unknown
}

const allowedServiceStatuses =
    ['Active', 'Draft'] as const

const allowedServicePricingTypes =
    ['fixed', 'starting_from', 'custom_quote'] as const

type ServiceStatus =
    (typeof allowedServiceStatuses)[number]

type ServicePricingType =
    (typeof allowedServicePricingTypes)[number]

function getServiceId(pathname: string) {
    const match = pathname.match(
        /^\/api\/services\/(\d+)$/,
    )

    return match ? Number(match[1]) : null
}

function validateServicePayload(body: ServicePayload) {
    const name =
        typeof body.name === 'string'
            ? body.name.trim()
            : ''

    const category =
        typeof body.category === 'string'
            ? body.category.trim()
            : 'Development'

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const pricingType =
        typeof body.pricing_type === 'string'
            ? body.pricing_type
            : 'fixed'

    const rawPrice =
        body.price !== undefined &&
            body.price !== null &&
            body.price !== ''
            ? Number(body.price)
            : null

    const rawStartingPrice =
        body.starting_price !== undefined &&
            body.starting_price !== null &&
            body.starting_price !== ''
            ? Number(body.starting_price)
            : null

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Active'

    if (!name) {
        return { error: 'Service name is required.' }
    }

    if (!category) {
        return { error: 'Service category is required.' }
    }

    if (!description) {
        return { error: 'Service description is required.' }
    }

    if (
        !allowedServicePricingTypes.includes(
            pricingType as ServicePricingType,
        )
    ) {
        return {
            error:
                'Pricing type must be fixed, starting_from, or custom_quote.',
        }
    }

    if (pricingType === 'fixed') {
        if (
            rawPrice === null ||
            !Number.isFinite(rawPrice) ||
            rawPrice <= 0
        ) {
            return {
                error:
                    'Fixed service price must be greater than zero.',
            }
        }
    }

    if (pricingType === 'starting_from') {
        if (
            rawStartingPrice === null ||
            !Number.isFinite(rawStartingPrice) ||
            rawStartingPrice <= 0
        ) {
            return {
                error:
                    'Starting price must be greater than zero.',
            }
        }
    }

    if (
        !allowedServiceStatuses.includes(
            status as ServiceStatus,
        )
    ) {
        return {
            error:
                'Service status must be Active or Draft.',
        }
    }

    return {
        data: {
            name,
            category,
            description,
            pricing_type:
                pricingType as ServicePricingType,
            // D1 `services.price` is NOT NULL, so non-fixed services use 0 here.
            // Public pricing is determined by pricing_type and starting_price.
            price:
                pricingType === 'fixed'
                    ? rawPrice
                    : 0,
            starting_price:
                pricingType === 'starting_from'
                    ? rawStartingPrice
                    : null,
            status,
        },
    }
}

async function getServices(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        id,
        name,
        category,
        description,
        price,
        pricing_type,
        starting_price,
        status,
        image_url,
        created_at,
        updated_at
      FROM services
      WHERE status = 'Active'
      ORDER BY id DESC
    `).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error('Get services error:', error)

        return json(
            {
                success: false,
                message: 'Failed to fetch services.',
            },
            500,
        )
    }
}

async function getService(env: Env, id: number) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        id,
        name,
        category,
        description,
        price,
        pricing_type,
        starting_price,
        status,
        image_url,
        created_at,
        updated_at
      FROM services
      WHERE id = ? AND status = 'Active'
    `)
            .bind(id)
            .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Service not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Get service error:', error)

        return json(
            {
                success: false,
                message: 'Failed to fetch service.',
            },
            500,
        )
    }
}

async function createService(
    env: Env,
    body: ServicePayload,
    image: File | null,
) {
    const validation =
        validateServicePayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        category,
        description,
        price,
        pricing_type,
        starting_price,
        status,
    } = validation.data

    try {
        const result = await env.DB.prepare(`
      INSERT INTO services (
        name,
        category,
        description,
        price,
        pricing_type,
        starting_price,
        status,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
            .bind(
                name,
                category,
                description,
                price,
                pricing_type,
                starting_price,
                status,
                '',
            )
            .run()

        const id = result.meta.last_row_id
        let imageUrl = ''

        if (image) {
            try {
                imageUrl = await saveProductImage(image)
                await env.DB.prepare(`
          UPDATE services
          SET image_url = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(imageUrl, id).run()
            } catch (imageError) {
                await env.DB.prepare(
                    `DELETE FROM services WHERE id = ?`,
                ).bind(id).run()
                throw imageError
            }
        }

        return json(
            {
                success: true,
                message: 'Service created successfully.',
                data: {
                    id,
                    name,
                    category,
                    description,
                    price,
                    pricing_type,
                    starting_price,
                    status,
                    image_url: imageUrl,
                },
            },
            201,
        )
    } catch (error) {
        console.error('Create service error:', error)

        return json(
            {
                success: false,
                message: 'Failed to create service.',
            },
            500,
        )
    }
}

async function updateService(
    env: Env,
    id: number,
    body: ServicePayload,
    image: File | null,
) {
    const validation =
        validateServicePayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        category,
        description,
        price,
        pricing_type,
        starting_price,
        status,
    } = validation.data

    try {
        const existing = await env.DB.prepare(`
      SELECT id, image_url
      FROM services
      WHERE id = ?
    `)
            .bind(id)
            .first<{ id: number; image_url: string | null }>()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Service not found.',
                },
                404,
            )
        }

        let imageUrl = String(existing.image_url || '')
        if (image) {
            imageUrl = await saveProductImage(image)
        }

        await env.DB.prepare(`
      UPDATE services
      SET
        name = ?,
        category = ?,
        description = ?,
        price = ?,
        pricing_type = ?,
        starting_price = ?,
        status = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(
                name,
                category,
                description,
                price,
                pricing_type,
                starting_price,
                status,
                imageUrl,
                id,
            )
            .run()

        return json({
            success: true,
            message: 'Service updated successfully.',
            data: {
                id,
                name,
                category,
                description,
                price,
                pricing_type,
                starting_price,
                status,
                image_url: imageUrl,
            },
        })
    } catch (error) {
        console.error('Update service error:', error)

        const message =
            error instanceof Error
                ? error.message
                : 'Unknown server error.'

        return json(
            {
                success: false,
                message: 'Failed to update service.',
            },
            500,
        )
    }
}

async function deleteService(env: Env, id: number) {
    try {
        const existing = await env.DB.prepare(`
      SELECT id
      FROM services
      WHERE id = ?
    `)
            .bind(id)
            .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Service not found.',
                },
                404,
            )
        }

        await env.DB.prepare(`
      DELETE FROM services
      WHERE id = ?
    `)
            .bind(id)
            .run()

        return json({
            success: true,
            message: 'Service deleted successfully.',
        })
    } catch (error) {
        console.error('Delete service error:', error)

        return json(
            {
                success: false,
                message: 'Failed to delete service.',
            },
            500,
        )
    }
}

/* =========================
   SERVICE QUOTES
========================= */

interface QuotePayload {
    service_id?: unknown
    customer_name?: unknown
    customer_email?: unknown
    customer_phone?: unknown
    project_name?: unknown
    project_description?: unknown
    budget_range?: unknown
    deadline?: unknown
    reference_url?: unknown
    additional_requirements?: unknown
    proposed_price?: unknown
    dp_amount?: unknown
    status?: unknown
    expires_at?: unknown
}

const allowedQuoteStatuses = [
    'Pending',
    'Reviewing',
    'Quoted',
    'Accepted',
    'Rejected',
    'Expired',
] as const

type QuoteStatus =
    (typeof allowedQuoteStatuses)[number]

function getQuoteId(pathname: string) {
    const match = pathname.match(
        /^\/api\/quotes\/(\d+)$/,
    )
    return match ? Number(match[1]) : null
}

function getPublicQuoteToken(pathname: string) {
    const match = pathname.match(
        /^\/api\/quotes\/public\/([^/]+)(?:\/accept)?$/,
    )
    return match ? decodeURIComponent(match[1]) : null
}

function isPublicQuoteAcceptPath(pathname: string) {
    return /^\/api\/quotes\/public\/[^/]+\/accept$/.test(pathname)
}

function validateQuoteCreatePayload(body: QuotePayload) {
    const serviceId = Number(body.service_id)
    const customerName =
        typeof body.customer_name === 'string'
            ? body.customer_name.trim()
            : ''
    const customerEmail =
        typeof body.customer_email === 'string'
            ? body.customer_email.trim().toLowerCase()
            : ''
    const customerPhone =
        typeof body.customer_phone === 'string'
            ? body.customer_phone.trim()
            : ''
    const projectName =
        typeof body.project_name === 'string'
            ? body.project_name.trim()
            : ''
    const projectDescription =
        typeof body.project_description === 'string'
            ? body.project_description.trim()
            : ''
    const budgetRange =
        typeof body.budget_range === 'string'
            ? body.budget_range.trim()
            : ''
    const deadline =
        typeof body.deadline === 'string'
            ? body.deadline.trim()
            : ''
    const referenceUrl =
        typeof body.reference_url === 'string'
            ? body.reference_url.trim()
            : ''
    const additionalRequirements =
        typeof body.additional_requirements === 'string'
            ? body.additional_requirements.trim()
            : ''

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        return { error: 'Valid service_id is required.' }
    }
    if (!customerName) {
        return { error: 'Customer name is required.' }
    }
    if (!customerEmail) {
        return { error: 'Customer email is required.' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return { error: 'Invalid customer email.' }
    }
    if (!customerPhone) {
        return { error: 'Customer phone is required.' }
    }
    if (!projectName) {
        return { error: 'Project name is required.' }
    }
    if (!projectDescription) {
        return { error: 'Project description is required.' }
    }

    return {
        data: {
            serviceId,
            customerName,
            customerEmail,
            customerPhone,
            projectName,
            projectDescription,
            budgetRange,
            deadline,
            referenceUrl,
            additionalRequirements,
        },
    }
}

function generateQuoteNumber() {
    const now = new Date()
    const stamp = [
        now.getUTCFullYear(),
        String(now.getUTCMonth() + 1).padStart(2, '0'),
        String(now.getUTCDate()).padStart(2, '0'),
    ].join('')

    const random = Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()

    return `QT-${stamp}-${random}`
}

async function createQuote(env: Env, body: QuotePayload) {
    const validation =
        validateQuoteCreatePayload(body)

    if ('error' in validation) {
        return json(
            { success: false, message: validation.error },
            400,
        )
    }

    const data = validation.data

    try {
        const service = await env.DB.prepare(`
      SELECT
        id,
        name,
        pricing_type,
        status
      FROM services
      WHERE id = ?
      LIMIT 1
    `)
            .bind(data.serviceId)
            .first<{
                id: number
                name: string
                pricing_type: ServicePricingType
                status: string
            }>()

        if (!service) {
            return json(
                { success: false, message: 'Service not found.' },
                404,
            )
        }

        if (service.status !== 'Active') {
            return json(
                { success: false, message: 'This service is not available.' },
                400,
            )
        }

        if (service.pricing_type === 'fixed') {
            return json(
                {
                    success: false,
                    message:
                        'This service has a fixed price. Please use direct checkout instead.',
                },
                400,
            )
        }

        // Public quote links are generated only after the admin publishes
        // the request as `Quoted`. A pending request has no public token.
        const quoteNumber = generateQuoteNumber()

        const result = await env.DB.prepare(`
      INSERT INTO quotes (
        quote_number,
        service_id,
        customer_name,
        customer_email,
        customer_phone,
        project_name,
        project_description,
        budget_range,
        deadline,
        reference_url,
        additional_requirements,
        proposed_price,
        dp_amount,
        remaining_amount,
        status,
        accept_token_hash,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        NULL, NULL, NULL, 'Pending', NULL, NULL,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `)
            .bind(
                quoteNumber,
                data.serviceId,
                data.customerName,
                data.customerEmail,
                data.customerPhone,
                data.projectName,
                data.projectDescription,
                data.budgetRange,
                data.deadline,
                data.referenceUrl,
                data.additionalRequirements,
            )
            .run()

        const id = result.meta.last_row_id

        await createAdminNotification(env, {
            type: 'quote',
            title: 'New Quote Request',
            message: `${data.projectName} — ${service.name}`,
            referenceType: 'quote',
            referenceId: Number(id),
            referenceNumber: quoteNumber,
        })

        await sendAdminEmailNotification(env, {
            title: 'New Quote Request',
            message: `A new quote request has been submitted for ${service.name}.`,
            referenceType: 'quote', referenceNumber: quoteNumber,
            customerName: data.customerName, customerEmail: data.customerEmail,
            customerPhone: data.customerPhone, itemName: service.name,
        })

        return json(
            {
                success: true,
                message: 'Quote request submitted successfully.',
                data: {
                    id,
                    quote_number: quoteNumber,
                    service_id: data.serviceId,
                    service_name: service.name,
                    status: 'Pending',
                },
            },
            201,
        )
    } catch (error) {
        console.error('Create quote error:', error)
        return json(
            {
                success: false,
                message: 'Failed to create quote request.',
            },
            500,
        )
    }
}

async function getQuotes(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        q.*,
        s.name AS service_name,
        s.category AS service_category
      FROM quotes q
      LEFT JOIN services s ON s.id = q.service_id
      ORDER BY q.id DESC
    `).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error('Get quotes error:', error)
        return json(
            {
                success: false,
                message: 'Failed to fetch quotes.',
            },
            500,
        )
    }
}

async function getQuote(env: Env, id: number) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        q.*,
        s.name AS service_name,
        s.category AS service_category,
        s.description AS service_description,
        s.pricing_type,
        s.starting_price
      FROM quotes q
      LEFT JOIN services s ON s.id = q.service_id
      WHERE q.id = ?
      LIMIT 1
    `)
            .bind(id)
            .first<any>()

        if (!result) {
            return json(
                { success: false, message: 'Quote not found.' },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Get quote error:', error)
        return json(
            { success: false, message: 'Failed to fetch quote.' },
            500,
        )
    }
}

async function getPublicQuote(env: Env, token: string) {
    try {
        const tokenHash = await sha256(token)
        const result = await env.DB.prepare(`
      SELECT
        q.id,
        q.quote_number,
        q.service_id,
        q.customer_name,
        q.customer_email,
        q.customer_phone,
        q.project_name,
        q.project_description,
        q.budget_range,
        q.deadline,
        q.reference_url,
        q.additional_requirements,
        q.proposed_price,
        q.dp_amount,
        q.remaining_amount,
        q.status,
        q.expires_at,
        q.created_at,
        q.updated_at,
        s.name AS service_name,
        s.category AS service_category,
        s.pricing_type,
        s.starting_price
        FROM quotes q
        LEFT JOIN services s ON s.id = q.service_id
        WHERE q.accept_token_hash = ?
        LIMIT 1
    `)
            .bind(tokenHash)
            .first<any>()

        if (!result) {
            return json(
                { success: false, message: 'Quote link is invalid.' },
                404,
            )
        }

        if (
            result.status !== 'Accepted' &&
            result.expires_at &&
            new Date(result.expires_at).getTime() < Date.now()
        ) {
            await env.DB.prepare(`
        UPDATE quotes
        SET status = 'Expired', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status NOT IN ('Accepted', 'Rejected')
      `)
                .bind(result.id)
                .run()

            result.status = 'Expired'
        }

        return json({ success: true, data: result })
    } catch (error) {
        console.error('Get public quote error:', error)
        return json(
            { success: false, message: 'Failed to fetch quote.' },
            500,
        )
    }
}

async function updateQuote(
    request: Request,
    env: Env,
    id: number,
    body: QuotePayload,
) {
    const proposedPrice =
        body.proposed_price === null ||
            body.proposed_price === undefined ||
            body.proposed_price === ''
            ? null
            : Number(body.proposed_price)

    const status =
        typeof body.status === 'string'
            ? body.status as QuoteStatus
            : null

    if (
        proposedPrice !== null &&
        (!Number.isFinite(proposedPrice) || proposedPrice <= 0)
    ) {
        return json(
            { success: false, message: 'Final price must be greater than zero.' },
            400,
        )
    }

    if (status !== null && !allowedQuoteStatuses.includes(status)) {
        return json(
            { success: false, message: 'Invalid quote status.' },
            400,
        )
    }

    // Accepted is a customer action from QuotePage, never an admin action.
    if (status === 'Accepted') {
        return json(
            {
                success: false,
                message: 'Quote can only be accepted by the customer from the public quote link.',
            },
            400,
        )
    }

    try {
        const existing = await env.DB.prepare(`
      SELECT * FROM quotes WHERE id = ? LIMIT 1
    `)
            .bind(id)
            .first<any>()

        if (!existing) {
            return json(
                { success: false, message: 'Quote request not found.' },
                404,
            )
        }

        const nextPrice =
            proposedPrice !== null
                ? proposedPrice
                : existing.proposed_price

        const nextStatus =
            status ||
            (proposedPrice !== null ? 'Quoted' : existing.status)

        const requestedDpAmount =
            body.dp_amount === null ||
                body.dp_amount === undefined ||
                body.dp_amount === ''
                ? null
                : Number(body.dp_amount)

        if (
            requestedDpAmount !== null &&
            (!Number.isFinite(requestedDpAmount) || requestedDpAmount <= 0)
        ) {
            return json(
                { success: false, message: 'DP amount must be greater than zero.' },
                400,
            )
        }

        let dpAmount = existing.dp_amount
        let remainingAmount = existing.remaining_amount

        if (nextPrice !== null && nextPrice !== undefined) {
            const finalPrice = Number(nextPrice)
            dpAmount =
                requestedDpAmount !== null
                    ? requestedDpAmount
                    : existing.dp_amount !== null
                        ? Number(existing.dp_amount)
                        : Math.ceil(finalPrice / 2)

            if (dpAmount <= 0 || dpAmount > finalPrice) {
                return json(
                    {
                        success: false,
                        message: 'DP amount must be greater than zero and cannot exceed the final price.',
                    },
                    400,
                )
            }

            remainingAmount = finalPrice - dpAmount
        }

        // The public token is generated exactly when the admin saves the
        // request as Quoted. D1 stores only the SHA-256 hash.
        let publicToken: string | null = null
        let tokenHash: string | null = null

        if (nextStatus === 'Quoted') {
            if (
                nextPrice === null ||
                nextPrice === undefined ||
                !Number.isFinite(Number(nextPrice)) ||
                Number(nextPrice) <= 0
            ) {
                return json(
                    { success: false, message: 'A final price is required before a quote can be published.' },
                    400,
                )
            }

            if (
                dpAmount === null ||
                !Number.isFinite(Number(dpAmount)) ||
                Number(dpAmount) <= 0
            ) {
                return json(
                    { success: false, message: 'A valid DP amount is required before a quote can be published.' },
                    400,
                )
            }

            publicToken = bytesToBase64Url(
                crypto.getRandomValues(new Uint8Array(32)),
            )
            tokenHash = await sha256(publicToken)
        }

        await env.DB.prepare(`
      UPDATE quotes
      SET
        proposed_price = ?,
        dp_amount = ?,
        remaining_amount = ?,
        status = ?,
        accept_token_hash = CASE
          WHEN ? = 'Quoted' THEN ?
          ELSE accept_token_hash
        END,
        expires_at = CASE
          WHEN ? = 'Quoted' THEN datetime('now', '+7 days')
          ELSE expires_at
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(
                nextPrice,
                dpAmount,
                remainingAmount,
                nextStatus,
                nextStatus,
                tokenHash,
                nextStatus,
                id,
            )
            .run()

        const response = await getQuote(env, id)

        if (publicToken && response.status === 200) {
            const responseBody = await response.json() as { data: Record<string, unknown> }
            return json({
                ...responseBody,
                message: 'Quote published successfully.',
                data: {
                    ...responseBody.data,
                    public_token: publicToken,
                    public_quote_path: `/quote/${encodeURIComponent(publicToken)}`,
                },
            })
        }

        return response
    } catch (error) {
        console.error('Update quote error:', error)
        return json(
            { success: false, message: 'Failed to update quote.' },
            500,
        )
    }
}

async function acceptPublicQuote(
    env: Env,
    token: string,
) {
    try {
        const tokenHash = await sha256(token)
        const quote = await env.DB.prepare(`
      SELECT * FROM quotes
      WHERE accept_token_hash = ?
      LIMIT 1
    `)
            .bind(tokenHash)
            .first<any>()

        if (!quote) {
            return json(
                { success: false, message: 'Quote link is invalid.' },
                404,
            )
        }

        if (quote.status !== 'Quoted') {
            return json(
                {
                    success: false,
                    message:
                        `Quote cannot be accepted while its status is ${quote.status}.`,
                },
                400,
            )
        }

        if (!quote.proposed_price || Number(quote.proposed_price) <= 0) {
            return json(
                {
                    success: false,
                    message: 'This quote does not have a valid proposed price.',
                },
                400,
            )
        }

        if (
            quote.expires_at &&
            new Date(quote.expires_at).getTime() < Date.now()
        ) {
            await env.DB.prepare(`
        UPDATE quotes
        SET status = 'Expired', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
                .bind(quote.id)
                .run()

            return json(
                { success: false, message: 'This quote has expired.' },
                400,
            )
        }

        await env.DB.prepare(`
      UPDATE quotes
      SET status = 'Accepted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'Quoted'
    `)
            .bind(quote.id)
            .run()

        return json({
            success: true,
            message: 'Quote accepted successfully. You can now proceed to DP payment.',
            data: {
                id: quote.id,
                quote_number: quote.quote_number,
                service_id: quote.service_id,
                customer_name: quote.customer_name,
                customer_email: quote.customer_email,
                customer_phone: quote.customer_phone,
                proposed_price: Number(quote.proposed_price),
                dp_amount: Number(quote.dp_amount),
                remaining_amount: Number(quote.remaining_amount),
                status: 'Accepted',
            },
        })
    } catch (error) {
        console.error('Accept quote error:', error)
        return json(
            { success: false, message: 'Failed to accept quote.' },
            500,
        )
    }
}

/* =========================
   PRODUCTS
========================= */

interface ProductPayload {
    name?: unknown
    category?: unknown
    description?: unknown
    price?: unknown
    stock?: unknown
    status?: unknown
    image_url?: unknown
}

const allowedProductStatuses =
    ['Published', 'Draft'] as const

type ProductStatus =
    (typeof allowedProductStatuses)[number]

function getProductId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/products\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

async function parseServiceRequest(request: Request) {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const image = formData.get('image')
        return {
            body: {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: formData.get('price'),
                pricing_type: formData.get('pricing_type'),
                starting_price: formData.get('starting_price'),
                status: formData.get('status'),
            } satisfies ServicePayload,
            image: image instanceof File && image.size > 0 ? image : null,
        }
    }
    return { body: await request.json<ServicePayload>(), image: null }
}

const MAX_PRODUCT_IMAGE_SIZE = 150 * 1024

async function parseProductRequest(request: Request) {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const image = formData.get('image')

        return {
            body: {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: formData.get('price'),
                stock: formData.get('stock'),
                status: formData.get('status'),
            } satisfies ProductPayload,
            image: image instanceof File && image.size > 0 ? image : null,
        }
    }

    return {
        body: await request.json<ProductPayload>(),
        image: null,
    }
}

async function saveProductImage(image: File) {
    if (image.size > MAX_PRODUCT_IMAGE_SIZE) {
        throw new Error('Product image must not exceed 150 KB. Please upload a compressed JPG, PNG, or WEBP image.')
    }

    const normalizedType = image.type.toLowerCase()
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ]

    if (!allowedTypes.includes(normalizedType)) {
        throw new Error('Product image must be JPG, PNG, WEBP, or GIF.')
    }

    const bytes = new Uint8Array(await image.arrayBuffer())

    // Never trust the browser-supplied MIME type alone. Verify file signatures
    // before embedding the upload into a data URL.
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    const isPng = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
    const isWebp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    const isGif = bytes.length >= 6 && (String.fromCharCode(...bytes.slice(0, 6)) === 'GIF87a' || String.fromCharCode(...bytes.slice(0, 6)) === 'GIF89a')

    const signatureMatches =
        (normalizedType === 'image/jpeg' && isJpeg)
        || (normalizedType === 'image/png' && isPng)
        || (normalizedType === 'image/webp' && isWebp)
        || (normalizedType === 'image/gif' && isGif)

    if (!signatureMatches) {
        throw new Error('The uploaded image content does not match its declared file type.')
    }
    let binary = ''
    const chunkSize = 0x8000

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(
            ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)),
        )
    }

    return `data:${normalizedType};base64,${btoa(binary)}`
}

function validateProductPayload(
    body: ProductPayload,
) {
    const name =
        typeof body.name === 'string'
            ? body.name.trim()
            : ''

    const category =
        typeof body.category === 'string'
            ? body.category.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const price =
        typeof body.price === 'number'
            ? body.price
            : Number(body.price)

    const stock =
        typeof body.stock === 'number'
            ? body.stock
            : Number(body.stock)

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Published'

    if (!name) {
        return {
            error: 'Product name is required.',
        }
    }

    if (!category) {
        return {
            error: 'Product category is required.',
        }
    }

    if (!description) {
        return {
            error: 'Product description is required.',
        }
    }

    if (!Number.isFinite(price) || price < 0) {
        return {
            error:
                'Product price must be a valid number.',
        }
    }

    if (
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
    ) {
        return {
            error:
                'Product stock must be a valid integer.',
        }
    }

    if (
        !allowedProductStatuses.includes(
            status as ProductStatus,
        )
    ) {
        return {
            error:
                'Product status must be Published or Draft.',
        }
    }

    return {
        data: {
            name,
            category,
            description,
            price,
            stock,
            status,
            image_url:
                typeof body.image_url === 'string'
                    ? body.image_url
                    : '',
        },
    }
}

async function getProducts(
    env: Env,
) {
    try {
        const result = await env.DB.prepare(
            `
      SELECT
        id,
        name,
        category,
        description,
        price,
        stock,
        status,
        image_url,
        created_at,
        updated_at
      FROM products
      WHERE status = 'Published'
      ORDER BY id DESC
      `,
        ).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get products error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to fetch products.',
            },
            500,
        )
    }
}

async function getProduct(
    env: Env,
    id: number,
) {
    try {
        const result = await env.DB.prepare(
            `
      SELECT
        id,
        name,
        category,
        description,
        price,
        stock,
        status,
        image_url,
        created_at,
        updated_at
      FROM products
      WHERE id = ? AND status = 'Published'
      `,
        )
            .bind(id)
            .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Product not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get product error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to fetch product.',
            },
            500,
        )
    }
}

async function createProduct(
    env: Env,
    body: ProductPayload,
    image: File | null,
) {
    const validation =
        validateProductPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        category,
        description,
        price,
        stock,
        status,
    } = validation.data

    try {
        const result = await env.DB.prepare(
            `
      INSERT INTO products (
        name,
        category,
        description,
        price,
        stock,
        status,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        )
            .bind(
                name,
                category,
                description,
                price,
                stock,
                status,
                '',
            )
            .run()

        const id = result.meta.last_row_id
        let imageUrl = ''

        if (image) {
            try {
                imageUrl = await saveProductImage(image)

                await env.DB.prepare(
                    `UPDATE products SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                )
                    .bind(imageUrl, id)
                    .run()
            } catch (imageError) {
                await env.DB.prepare(
                    `DELETE FROM products WHERE id = ?`,
                )
                    .bind(id)
                    .run()

                throw imageError
            }
        }

        return json(
            {
                success: true,
                message:
                    'Product created successfully.',
                data: {
                    id,
                    name,
                    category,
                    description,
                    price,
                    stock,
                    status,
                    image_url: imageUrl,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create product error:',
            error,
        )

        const message =
            error instanceof Error
                ? error.message
                : 'Unknown server error.'

        return json(
            {
                success: false,
                message: 'Failed to create product.',
            },
            500,
        )
    }
}

async function updateProduct(
    env: Env,
    id: number,
    body: ProductPayload,
    image: File | null,
) {
    const validation =
        validateProductPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        category,
        description,
        price,
        stock,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM products
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Product not found.',
                },
                404,
            )
        }

        let imageUrl = String(existing.image_url || '')
        if (image) {
            imageUrl = await saveProductImage(image)
        }

        try {
            await env.DB.prepare(
                `
        UPDATE products
        SET
          name = ?,
          category = ?,
          description = ?,
          price = ?,
          stock = ?,
          status = ?,
          image_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
            )
                .bind(
                    name,
                    category,
                    description,
                    price,
                    stock,
                    status,
                    imageUrl,
                    id,
                )
                .run()
        } catch (updateError) {
            throw updateError
        }

        return json({
            success: true,
            message:
                'Product updated successfully.',
            data: {
                id,
                name,
                category,
                description,
                price,
                stock,
                status,
                image_url: imageUrl,
            },
        })
    } catch (error) {
        console.error(
            'Update product error:',
            error,
        )

        const message =
            error instanceof Error
                ? error.message
                : 'Unknown server error.'

        return json(
            {
                success: false,
                message: 'Failed to update product.',
            },
            500,
        )
    }
}

async function deleteProduct(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM products
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Product not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM products
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()


        return json({
            success: true,
            message:
                'Product deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete product error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to delete product.',
            },
            500,
        )
    }
}

/* =========================
   PORTFOLIO
========================= */

interface PortfolioPayload {
    title?: unknown
    category?: unknown
    client?: unknown
    description?: unknown
    year?: unknown
    status?: unknown
    image_url?: unknown
}

const allowedPortfolioStatuses =
    ['Published', 'Draft'] as const

type PortfolioStatus =
    (typeof allowedPortfolioStatuses)[number]

function getPortfolioId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/portfolio\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validatePortfolioPayload(
    body: PortfolioPayload,
) {
    const title =
        typeof body.title === 'string'
            ? body.title.trim()
            : ''

    const category =
        typeof body.category === 'string'
            ? body.category.trim()
            : ''

    const client =
        typeof body.client === 'string'
            ? body.client.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const year =
        typeof body.year === 'string'
            ? body.year.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Published'

    const image_url =
        typeof body.image_url === 'string'
            ? body.image_url.trim()
            : ''

    if (!title) {
        return {
            error: 'Portfolio title is required.',
        }
    }

    if (!category) {
        return {
            error:
                'Portfolio category is required.',
        }
    }

    if (!client) {
        return {
            error:
                'Portfolio client is required.',
        }
    }

    if (!description) {
        return {
            error:
                'Portfolio description is required.',
        }
    }

    if (!year) {
        return {
            error:
                'Portfolio year is required.',
        }
    }

    if (
        !allowedPortfolioStatuses.includes(
            status as PortfolioStatus,
        )
    ) {
        return {
            error:
                'Portfolio status must be Published or Draft.',
        }
    }

    return {
        data: {
            title,
            category,
            client,
            description,
            year,
            status,
            image_url,
        },
    }
}

async function getPortfolios(
    env: Env,
) {
    try {
        const result = await env.DB.prepare(
            `
      SELECT
        id,
        title,
        category,
        client,
        description,
        year,
        status,
        image_url,
        created_at,
        updated_at
      FROM portfolio
      WHERE status = 'Published'
      ORDER BY id DESC
      `,
        ).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get portfolios error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch portfolios.',
            },
            500,
        )
    }
}

async function getPortfolio(
    env: Env,
    id: number,
) {
    try {
        const result = await env.DB.prepare(
            `
      SELECT
        id,
        title,
        category,
        client,
        description,
        year,
        status,
        image_url,
        created_at,
        updated_at
      FROM portfolio
      WHERE id = ? AND status = 'Published'
      `,
        )
            .bind(id)
            .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Portfolio not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get portfolio error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch portfolio.',
            },
            500,
        )
    }
}

async function createPortfolio(
    env: Env,
    body: PortfolioPayload,
    image: File | null,
) {
    const validation =
        validatePortfolioPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        category,
        client,
        description,
        year,
        status,
        image_url,
    } = validation.data

    try {
        const result = await env.DB.prepare(
            `
      INSERT INTO portfolio (
        title,
        category,
        client,
        description,
        year,
        status,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        )
            .bind(
                title,
                category,
                client,
                description,
                year,
                status,
                image_url,
            )
            .run()

        const id = result.meta.last_row_id
        let imageUrl = image_url

        if (image) {
            try {
                imageUrl = await saveProductImage(image)
                await env.DB.prepare(
                    `UPDATE portfolio SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                ).bind(imageUrl, id).run()
            } catch (imageError) {
                await env.DB.prepare(`DELETE FROM portfolio WHERE id = ?`).bind(id).run()
                throw imageError
            }
        }

        return json(
            {
                success: true,
                message:
                    'Portfolio created successfully.',
                data: {
                    id,
                    title,
                    category,
                    client,
                    description,
                    year,
                    status,
                    image_url: imageUrl,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create portfolio error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to create portfolio.',
            },
            500,
        )
    }
}

async function updatePortfolio(
    env: Env,
    id: number,
    body: PortfolioPayload,
    image: File | null,
) {
    const validation =
        validatePortfolioPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        category,
        client,
        description,
        year,
        status,
        image_url,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM portfolio
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Portfolio not found.',
                },
                404,
            )
        }

        let imageUrl = String((existing as Record<string, unknown>).image_url || image_url || '')
        if (image) {
            imageUrl = await saveProductImage(image)
        }

        await env.DB.prepare(
            `
      UPDATE portfolio
      SET
        title = ?,
        category = ?,
        client = ?,
        description = ?,
        year = ?,
        status = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                title,
                category,
                client,
                description,
                year,
                status,
                imageUrl,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Portfolio updated successfully.',
            data: {
                id,
                title,
                category,
                client,
                description,
                year,
                status,
                image_url: imageUrl,
            },
        })
    } catch (error) {
        console.error(
            'Update portfolio error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update portfolio.',
            },
            500,
        )
    }
}

async function deletePortfolio(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM portfolio
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Portfolio not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM portfolio
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Portfolio deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete portfolio error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete portfolio.',
            },
            500,
        )
    }
}

/* =========================
   ORDERS
========================= */

interface OrderPayload {
    type?: unknown
    product_id?: unknown
    service_id?: unknown
    customer_name?: unknown
    customer_email?: unknown
    customer_phone?: unknown
    quantity?: unknown
}

const allowedOrderTypes =
    ['Product', 'Service'] as const

type OrderType =
    (typeof allowedOrderTypes)[number]

const allowedOrderStatuses = [
    'Pending',
    'Processing',
    'Completed',
    'WaitingFinalPayment',
    'PaidFull',
    'Cancelled',
] as const

type OrderStatus =
    (typeof allowedOrderStatuses)[number]

function getOrderId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/orders\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateOrderPayload(
    body: OrderPayload,
) {
    const type =
        typeof body.type === 'string'
            ? body.type
            : 'Product'

    const productId =
        body.product_id !== undefined &&
            body.product_id !== null
            ? Number(body.product_id)
            : null

    const serviceId =
        body.service_id !== undefined &&
            body.service_id !== null
            ? Number(body.service_id)
            : null

    const customerName =
        typeof body.customer_name === 'string'
            ? body.customer_name.trim()
            : ''

    const customerEmail =
        typeof body.customer_email === 'string'
            ? body.customer_email.trim()
            : ''

    const customerPhone =
        typeof body.customer_phone === 'string'
            ? body.customer_phone.trim()
            : ''

    const quantity =
        body.quantity !== undefined
            ? Number(body.quantity)
            : 1

    if (
        !allowedOrderTypes.includes(
            type as OrderType,
        )
    ) {
        return {
            error:
                'Order type must be Product or Service.',
        }
    }

    if (!customerName) {
        return {
            error:
                'Customer name is required.',
        }
    }

    if (!customerEmail) {
        return {
            error:
                'Customer email is required.',
        }
    }

    if (!customerPhone) {
        return {
            error:
                'Customer phone is required.',
        }
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        return {
            error:
                'Quantity must be at least 1.',
        }
    }

    if (type === 'Product') {
        if (
            productId === null ||
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return {
                error:
                    'Valid product_id is required.',
            }
        }
    }

    if (type === 'Service') {
        if (
            serviceId === null ||
            !Number.isInteger(serviceId) ||
            serviceId <= 0
        ) {
            return {
                error:
                    'Valid service_id is required.',
            }
        }
    }

    return {
        data: {
            type: type as OrderType,
            productId,
            serviceId,
            customerName,
            customerEmail,
            customerPhone,
            quantity,
        },
    }
}

function generateOrderNumber() {
    const timestamp =
        Date.now().toString(36).toUpperCase()

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()

    return `SKY-${timestamp}-${random}`
}

async function getOrders(
    env: Env,
) {
    try {
        const result = await env.DB.prepare(
            `
      SELECT
        id,
        order_number,
        product_id,
        service_id,
        customer_name,
        customer_email,
        customer_phone,
        product_name,
        quantity,
        unit_price,
        total_price,
        original_total,
        discount_amount,
        final_total,
        dp_amount,
        dp_paid_at,
        remaining_amount,
        paid_amount,
        final_paid_at,
        payment_status,
        business_project_id,
        type,
        status,
        created_at,
        updated_at
      FROM orders
      ORDER BY id DESC
      `,
        ).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get orders error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to fetch orders.',
            },
            500,
        )
    }
}


/* =========================
   DANA QRIS PAYMENTS
========================= */

type PaymentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'PAID'
    | 'FAILED'
    | 'EXPIRED'
    | 'CANCELLED'

interface CreatePaymentPayload {
    type?: unknown
    product_id?: unknown
    service_id?: unknown
    customer_name?: unknown
    customer_email?: unknown
    customer_phone?: unknown
    quantity?: unknown
    quote_id?: unknown
}

interface PaymentTransaction {
    id: number
    payment_reference: string
    partner_reference_no: string
    order_id: number | null
    payment_stage: string
    payment_method: string
    type: 'Product' | 'Service'
    amount: number
    status: PaymentStatus
    customer_name: string
    customer_email: string
    customer_phone: string
    product_id: number | null
    service_id: number | null
    item_name: string
    quantity: number
    unit_price: number
    original_amount: number
    discount_amount: number
    final_amount: number
    promotion_id: number | null
    promotion_code: string | null
    public_access_token_hash: string | null
    dana_reference_no: string | null
    qr_content: string | null
    qr_url: string | null
    qr_image: string | null
    expires_at: string
    paid_at: string | null
    created_at: string
    updated_at: string
}

function danaConfig(env: Env) {
    const baseUrl =
        env.DANA_BASE_URL ||
        (env.DANA_ENV === 'production'
            ? 'https://api.dana.id'
            : 'https://api.sandbox.dana.id')

    return {
        baseUrl: baseUrl.replace(/\/+$/, ''),
        merchantId: env.DANA_MERCHANT_ID?.trim() || '',
        partnerId: env.DANA_PARTNER_ID?.trim() || '',
        privateKey: env.DANA_PRIVATE_KEY?.trim() || '',
        publicKey:
            env.DANA_WEBHOOK_PUBLIC_KEY?.trim() ||
            env.DANA_PUBLIC_KEY?.trim() ||
            '',
        storeId: env.DANA_STORE_ID?.trim() || '',
        origin:
            env.DANA_ORIGIN?.trim() ||
            'https://39production-api.39production.workers.dev',
        channelId:
            env.DANA_CHANNEL_ID?.trim() || '95221',
    }
}

function requireDanaConfig(env: Env) {
    const config = danaConfig(env)
    const missing: string[] = []

    if (!config.merchantId) missing.push('DANA_MERCHANT_ID')
    if (!config.partnerId) missing.push('DANA_PARTNER_ID')
    if (!config.privateKey) missing.push('DANA_PRIVATE_KEY')
    if (!config.storeId) missing.push('DANA_STORE_ID')

    if (missing.length > 0) {
        return {
            error:
                `DANA is not configured. Missing: ${missing.join(', ')}.`,
        }
    }

    return { config }
}

function jakartaTimestamp(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date)

    const value = (type: string) =>
        parts.find((part) => part.type === type)?.value || ''

    return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}+07:00`
}

function jakartaTimestampPlusMinutes(
    minutes: number,
) {
    return jakartaTimestamp(
        new Date(
            Date.now() +
            minutes * 60 * 1000,
        ),
    )
}

function randomReference(prefix: string) {
    const timestamp =
        Date.now().toString(36).toUpperCase()

    const random =
        crypto.randomUUID()
            .replace(/-/g, '')
            .slice(0, 8)
            .toUpperCase()

    return `${prefix}${timestamp}${random}`.slice(0, 25)
}

function pemToArrayBuffer(pem: string) {
    const base64 = pem
        .replace(/-----BEGIN [^-]+-----/g, '')
        .replace(/-----END [^-]+-----/g, '')
        .replace(/\s/g, '')

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i)
    }

    return bytes.buffer
}

async function sha256Hex(value: string) {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(value),
    )

    return Array.from(new Uint8Array(digest))
        .map((byte) =>
            byte.toString(16).padStart(2, '0'),
        )
        .join('')
}

async function signDanaRequest(
    env: Env,
    method: string,
    relativePath: string,
    body: string,
    timestamp: string,
) {
    const config = danaConfig(env)

    if (!config.privateKey) {
        throw new Error(
            'DANA_PRIVATE_KEY is not configured.',
        )
    }

    const bodyHash = await sha256Hex(body)
    const stringToSign =
        `${method.toUpperCase()}:${relativePath}:${bodyHash}:${timestamp}`

    const key = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(config.privateKey),
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    )

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(stringToSign),
    )

    let binary = ''
    for (const byte of new Uint8Array(signature)) {
        binary += String.fromCharCode(byte)
    }

    return btoa(binary)
}

async function verifyDanaWebhook(
    env: Env,
    body: string,
    signature: string,
    timestamp: string,
    relativePath: string,
) {
    const config = danaConfig(env)

    if (!config.publicKey) {
        throw new Error(
            'DANA_PUBLIC_KEY is not configured.',
        )
    }

    const bodyHash = await sha256Hex(body)
    const stringToVerify =
        `POST:${relativePath}:${bodyHash}:${timestamp}`

    const key = await crypto.subtle.importKey(
        'spki',
        pemToArrayBuffer(config.publicKey),
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['verify'],
    )

    const binary = atob(signature)
    const signatureBytes = new Uint8Array(
        binary.length,
    )

    for (let i = 0; i < binary.length; i += 1) {
        signatureBytes[i] = binary.charCodeAt(i)
    }

    return await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signatureBytes,
        new TextEncoder().encode(stringToVerify),
    )
}

async function danaRequest(
    env: Env,
    method: string,
    relativePath: string,
    payload: Record<string, unknown>,
) {
    const configResult = requireDanaConfig(env)

    if ('error' in configResult) {
        throw new Error(configResult.error)
    }

    const config = configResult.config
    const body = JSON.stringify(payload)
    const timestamp = jakartaTimestamp()
    const externalId =
        crypto.randomUUID().replace(/-/g, '')

    const signature =
        await signDanaRequest(
            env,
            method,
            relativePath,
            body,
            timestamp,
        )

    const response = await fetch(
        `${config.baseUrl}${relativePath}`,
        {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-TIMESTAMP': timestamp,
                'X-SIGNATURE': signature,
                'X-PARTNER-ID': config.partnerId,
                'X-EXTERNAL-ID': externalId,
                'CHANNEL-ID': config.channelId,
                'ORIGIN': config.origin,
            },
            body,
        },
    )

    const responseText =
        await response.text()

    let data: any = null

    try {
        data = JSON.parse(responseText)
    } catch {
        data = {
            responseMessage: responseText,
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.responseMessage ||
            `DANA request failed (${response.status}).`,
        )
    }

    return data
}

async function getActivePromotionForProduct(
    env: Env,
    productId: number,
) {
    const today =
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jakarta',
        }).format(new Date())

    return await env.DB.prepare(`
    SELECT
      id,
      title,
      code,
      description,
      discount_type,
      discount_value,
      target_type,
      product_id,
      service_id,
      start_date,
      end_date,
      status
    FROM promotions
    WHERE target_type = 'Product'
      AND product_id = ?
      AND status = 'Active'
      AND start_date <= ?
      AND end_date >= ?
    ORDER BY id DESC
    LIMIT 1
  `)
        .bind(productId, today, today)
        .first<{
            id: number
            title: string
            code: string
            description: string
            discount_type: 'Percentage' | 'Fixed'
            discount_value: number
            target_type: string
            product_id: number | null
            service_id: number | null
            start_date: string
            end_date: string
            status: string
        }>()
}

function calculatePromotionDiscount(
    subtotal: number,
    promotion: {
        discount_type: 'Percentage' | 'Fixed'
        discount_value: number
    } | null,
) {
    if (!promotion) return 0

    if (
        promotion.discount_type ===
        'Percentage'
    ) {
        return Math.min(
            subtotal,
            Math.round(
                subtotal *
                (Number(promotion.discount_value) / 100),
            ),
        )
    }

    return Math.min(
        subtotal,
        Number(promotion.discount_value),
    )
}

function validateCreatePaymentPayload(
    body: CreatePaymentPayload,
) {
    const type =
        typeof body.type === 'string'
            ? body.type
            : ''

    const productId =
        body.product_id === null ||
            body.product_id === undefined
            ? null
            : Number(body.product_id)

    const serviceId =
        body.service_id === null ||
            body.service_id === undefined
            ? null
            : Number(body.service_id)

    const customerName =
        typeof body.customer_name === 'string'
            ? body.customer_name.trim()
            : ''

    const customerEmail =
        typeof body.customer_email === 'string'
            ? body.customer_email.trim()
            : ''

    const customerPhone =
        typeof body.customer_phone === 'string'
            ? body.customer_phone.trim()
            : ''

    const quantity =
        Number(body.quantity)

    const quoteId =
        body.quote_id === null ||
            body.quote_id === undefined ||
            body.quote_id === ''
            ? null
            : Number(body.quote_id)

    if (
        type !== 'Product' &&
        type !== 'Service'
    ) {
        return {
            error: 'Invalid order type.',
        }
    }

    if (
        type === 'Product' &&
        (!Number.isInteger(productId) ||
            productId <= 0)
    ) {
        return {
            error: 'Valid product_id is required.',
        }
    }

    if (
        type === 'Service' &&
        (!Number.isInteger(serviceId) ||
            serviceId <= 0)
    ) {
        return {
            error: 'Valid service_id is required.',
        }
    }

    if (
        quoteId !== null &&
        (!Number.isInteger(quoteId) || quoteId <= 0)
    ) {
        return {
            error: 'Invalid quote_id.',
        }
    }

    if (!customerName) {
        return {
            error: 'Customer name is required.',
        }
    }

    if (!customerEmail) {
        return {
            error: 'Customer email is required.',
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail,
    )) {
        return {
            error: 'Invalid customer email.',
        }
    }

    if (!customerPhone) {
        return {
            error: 'Customer phone is required.',
        }
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        return {
            error: 'Quantity must be at least 1.',
        }
    }

    return {
        data: {
            type: type as 'Product' | 'Service',
            productId,
            serviceId,
            customerName,
            customerEmail,
            customerPhone,
            quantity,
            quoteId,
        },
    }
}

async function createPayment(
    env: Env,
    body: CreatePaymentPayload,
) {
    const validation =
        validateCreatePaymentPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const configResult =
        requireDanaConfig(env)

    if ('error' in configResult) {
        return json(
            {
                success: false,
                message: configResult.error,
            },
            503,
        )
    }

    const {
        type,
        productId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        quantity,
        quoteId,
    } = validation.data

    let paymentTransactionId: number | null = null

    try {
        let itemName = ''
        let unitPrice = 0
        let stock = 0
        let subtotal = 0
        let discountAmount = 0
        let finalAmount = 0
        let dpAmount = 0
        let remainingAmount = 0
        let promotion: Awaited<ReturnType<typeof getActivePromotionForProduct>> = null
        let quote: {
            id: number
            service_id: number
            customer_name: string
            customer_email: string
            customer_phone: string
            proposed_price: number | null
            dp_amount: number | null
            remaining_amount: number | null
            status: QuoteStatus
            expires_at: string | null
        } | null = null

        if (type === 'Product') {
            const product =
                await env.DB.prepare(`
          SELECT
            id,
            name,
            price,
            stock,
            status
          FROM products
          WHERE id = ?
        `)
                    .bind(productId)
                    .first<{
                        id: number
                        name: string
                        price: number
                        stock: number
                        status: string
                    }>()

            if (!product) {
                return json(
                    {
                        success: false,
                        message: 'Product not found.',
                    },
                    404,
                )
            }

            if (product.status !== 'Published') {
                return json(
                    {
                        success: false,
                        message: 'This product is not available.',
                    },
                    400,
                )
            }

            if (product.stock < quantity) {
                return json(
                    {
                        success: false,
                        message: 'Insufficient product stock.',
                    },
                    400,
                )
            }

            itemName = product.name
            unitPrice = Number(product.price)
            stock = Number(product.stock)

            subtotal = unitPrice * quantity
            promotion =
                productId !== null
                    ? await getActivePromotionForProduct(
                        env,
                        productId,
                    )
                    : null
            discountAmount = calculatePromotionDiscount(
                subtotal,
                promotion,
            )
            finalAmount = subtotal - discountAmount
            dpAmount = Math.ceil(finalAmount / 2)
            remainingAmount = finalAmount - dpAmount
        }

        if (type === 'Service') {
            const service =
                await env.DB.prepare(`
          SELECT
            id,
            name,
            price,
            pricing_type,
            status
          FROM services
          WHERE id = ?
        `)
                    .bind(serviceId)
                    .first<{
                        id: number
                        name: string
                        price: number | null
                        pricing_type: ServicePricingType
                        status: string
                    }>()

            if (!service) {
                return json(
                    {
                        success: false,
                        message: 'Service not found.',
                    },
                    404,
                )
            }

            if (service.status !== 'Active') {
                return json(
                    {
                        success: false,
                        message: 'This service is not available.',
                    },
                    400,
                )
            }

            if (service.pricing_type !== 'fixed') {
                if (quoteId === null) {
                    return json(
                        {
                            success: false,
                            message:
                                'This service requires an accepted quotation before payment.',
                        },
                        400,
                    )
                }

                quote = await env.DB.prepare(`
          SELECT
            id,
            service_id,
            customer_name,
            customer_email,
            customer_phone,
            proposed_price,
            dp_amount,
            remaining_amount,
            status,
            expires_at
          FROM quotes
          WHERE id = ?
          LIMIT 1
        `)
                    .bind(quoteId)
                    .first<{
                        id: number
                        service_id: number
                        customer_name: string
                        customer_email: string
                        customer_phone: string
                        proposed_price: number | null
                        dp_amount: number | null
                        remaining_amount: number | null
                        status: QuoteStatus
                        expires_at: string | null
                    }>()

                if (!quote) {
                    return json(
                        { success: false, message: 'Quote not found.' },
                        404,
                    )
                }

                if (quote.service_id !== service.id) {
                    return json(
                        {
                            success: false,
                            message: 'The quotation does not belong to this service.',
                        },
                        400,
                    )
                }

                if (quote.status !== 'Accepted') {
                    return json(
                        {
                            success: false,
                            message: 'The quotation must be accepted before payment.',
                        },
                        400,
                    )
                }

                if (
                    quote.expires_at &&
                    new Date(quote.expires_at).getTime() < Date.now()
                ) {
                    return json(
                        { success: false, message: 'This quotation has expired.' },
                        400,
                    )
                }

                if (
                    quote.proposed_price === null ||
                    !Number.isFinite(Number(quote.proposed_price)) ||
                    Number(quote.proposed_price) <= 0
                ) {
                    return json(
                        {
                            success: false,
                            message: 'Quotation price is invalid.',
                        },
                        400,
                    )
                }

                if (
                    quote.dp_amount === null ||
                    !Number.isFinite(Number(quote.dp_amount)) ||
                    Number(quote.dp_amount) <= 0
                ) {
                    return json(
                        {
                            success: false,
                            message: 'Quotation DP amount is invalid.',
                        },
                        400,
                    )
                }

                const quotedFinalAmount = Number(quote.proposed_price)
                const quotedDpAmount = Number(quote.dp_amount)
                const quotedRemainingAmount = quotedFinalAmount - quotedDpAmount

                if (quotedDpAmount > quotedFinalAmount) {
                    return json(
                        {
                            success: false,
                            message: 'Quotation DP cannot exceed the final price.',
                        },
                        400,
                    )
                }

                if (quotedRemainingAmount < 0) {
                    return json(
                        {
                            success: false,
                            message: 'Quotation remaining amount is invalid.',
                        },
                        400,
                    )
                }

                if (
                    quote.remaining_amount !== null &&
                    Math.abs(Number(quote.remaining_amount) - quotedRemainingAmount) > 0.01
                ) {
                    return json(
                        {
                            success: false,
                            message: 'Quotation payment amounts are inconsistent. Please ask admin to update the quotation.',
                        },
                        409,
                    )
                }

                itemName = service.name
                unitPrice = quotedFinalAmount
                subtotal = quotedFinalAmount
                discountAmount = 0
                finalAmount = quotedFinalAmount
                dpAmount = quotedDpAmount
                remainingAmount = quotedRemainingAmount

                // The quotation is the agreed commercial price.
                // Do not apply product promotions or recalculate the DP here.
            } else {
                itemName = service.name
                unitPrice = Number(service.price)
                subtotal = unitPrice * quantity
                discountAmount = 0
                finalAmount = subtotal
                dpAmount = Math.ceil(finalAmount / 2)
                remainingAmount = finalAmount - dpAmount
            }
        }

        if (finalAmount <= 0 || dpAmount <= 0) {
            return json(
                {
                    success: false,
                    message: 'Payment amount must be greater than zero.',
                },
                400,
            )
        }

        const paymentReference =
            randomReference('SKYPAY')
        const publicAccessToken = await createPublicPaymentToken()
        const publicAccessTokenHash = await sha256(publicAccessToken)
        const partnerReferenceNo =
            paymentReference
        const expiresAt =
            new Date(
                Date.now() + 15 * 60 * 1000,
            ).toISOString()

        // For quote payments, always use the customer data stored in the
        // accepted quotation so the client cannot change the payer details.
        const paymentCustomerName = quote?.customer_name ?? customerName
        const paymentCustomerEmail = quote?.customer_email ?? customerEmail
        const paymentCustomerPhone = quote?.customer_phone ?? customerPhone

        const insertResult =
            await env.DB.prepare(`
        INSERT INTO payment_transactions (
          payment_reference,
          partner_reference_no,
          order_id,
          payment_stage,
          payment_method,
          type,
          amount,
          status,
          customer_name,
          customer_email,
          customer_phone,
          product_id,
          service_id,
          item_name,
          quantity,
          unit_price,
          original_amount,
          discount_amount,
          final_amount,
          promotion_id,
          promotion_code,
          public_access_token_hash,
          expires_at,
          created_at,
          updated_at
        )
        VALUES (
          ?, ?, NULL, 'DP', 'DANA_QRIS', ?, ?,
          'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
                .bind(
                    paymentReference,
                    partnerReferenceNo,
                    type,
                    dpAmount,
                    paymentCustomerName,
                    paymentCustomerEmail,
                    paymentCustomerPhone,
                    productId,
                    serviceId,
                    itemName,
                    quantity,
                    unitPrice,
                    subtotal,
                    discountAmount,
                    finalAmount,
                    promotion?.id ?? null,
                    promotion?.code ?? null,
                    publicAccessTokenHash,
                    expiresAt,
                )
                .run()

        paymentTransactionId = insertResult.meta.last_row_id

        try {
            const qrResponse =
                await danaRequest(
                    env,
                    'POST',
                    '/v1.0/qr/qr-mpm-generate.htm',
                    {
                        merchantId:
                            danaConfig(env).merchantId,
                        storeId:
                            danaConfig(env).storeId,
                        terminalId: '',
                        partnerReferenceNo,
                        amount: {
                            value: dpAmount.toFixed(2),
                            currency: 'IDR',
                        },
                        validityPeriod:
                            jakartaTimestampPlusMinutes(15),
                    },
                )

            if (
                !qrResponse ||
                !qrResponse.partnerReferenceNo ||
                !qrResponse.qrContent
            ) {
                throw new Error(
                    qrResponse?.responseMessage ||
                    'DANA did not return a valid QRIS payload.',
                )
            }

            await env.DB.prepare(`
      UPDATE payment_transactions
      SET
        dana_reference_no = ?,
        qr_content = ?,
        qr_url = ?,
        qr_image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
                .bind(
                    qrResponse.referenceNo ?? null,
                    qrResponse.qrContent,
                    qrResponse.qrUrl ?? null,
                    qrResponse.qrImage ?? null,
                    paymentTransactionId,
                )
                .run()

            return json(
                {
                    success: true,
                    message:
                        'DP payment created. Complete the QRIS payment before the order is created.',
                    data: {
                        payment_reference:
                            paymentReference,
                        access_token: publicAccessToken,
                        partner_reference_no:
                            partnerReferenceNo,
                        payment_method:
                            'DANA_QRIS',
                        payment_stage: 'DP',
                        status: 'PENDING',
                        subtotal,
                        discount_amount:
                            discountAmount,
                        final_amount:
                            finalAmount,
                        dp_amount:
                            dpAmount,
                        remaining_amount:
                            remainingAmount,
                        qr_content:
                            qrResponse.qrContent,
                        qr_url:
                            qrResponse.qrUrl ?? null,
                        qr_image:
                            qrResponse.qrImage ?? null,
                        expires_at:
                            expiresAt,
                        stock,
                        quote_id: quote?.id ?? null,
                    },
                },
                201,
            )
        } catch (qrError) {
            if (paymentTransactionId !== null) {
                try {
                    await env.DB.prepare(`
            DELETE FROM payment_transactions
            WHERE id = ?
              AND status = 'PENDING'
          `)
                        .bind(paymentTransactionId)
                        .run()
                } catch (cleanupError) {
                    console.error(
                        'Failed to cleanup payment transaction after QRIS error:',
                        cleanupError,
                    )
                }
            }

            throw qrError
        }
    } catch (error) {
        console.error(
            'Create payment error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to create payment.',
            },
            500,
        )
    }
}

async function getPaymentTransaction(
    env: Env,
    paymentReference: string,
) {
    return await env.DB.prepare(`
    SELECT *
    FROM payment_transactions
    WHERE payment_reference = ?
    LIMIT 1
  `)
        .bind(paymentReference)
        .first<PaymentTransaction>()
}

async function createPublicPaymentToken() {
    return bytesToBase64Url(
        crypto.getRandomValues(new Uint8Array(32)),
    )
}

async function createAutomaticFinanceRevenue(
    env: Env,
    projectId: number,
    amount: number,
    paymentReference: string,
    stage: string,
) {
    if (amount <= 0) return

    const existing = await env.DB.prepare(`
    SELECT id
    FROM finance_transactions
    WHERE payment_reference = ?
      AND description LIKE ?
    LIMIT 1
  `)
        .bind(
            paymentReference,
            `%${stage}%`,
        )
        .first()

    if (existing) return

    const year = new Date().getFullYear()
    const count = await env.DB.prepare(`
    SELECT COUNT(*) AS c
    FROM finance_transactions
    WHERE code LIKE ?
  `)
        .bind(`AUTO-${year}-%`)
        .first<{ c: number }>()

    const code = `AUTO-${year}-${String(
        Number(count?.c || 0) + 1,
    ).padStart(4, '0')}`

    await env.DB.prepare(`
    INSERT INTO finance_transactions (
      code,
      date,
      description,
      category,
      type,
      amount,
      status,
      project_id,
      payment_reference
    )
    VALUES (?, ?, ?, ?, 'Revenue', ?, 'Completed', ?, ?)
  `)
        .bind(
            code,
            new Date().toISOString().slice(0, 10),
            `${stage} payment - ${paymentReference}`,
            'Customer Payment',
            amount,
            projectId,
            paymentReference,
        )
        .run()
}

async function createBusinessProjectFromOrder(
    env: Env,
    order: any,
) {
    if (!order) return null

    if (order.business_project_id) {
        return await env.DB.prepare(`
      SELECT *
      FROM business_projects
      WHERE id = ?
      LIMIT 1
    `)
            .bind(order.business_project_id)
            .first<any>()
    }

    const existing = await env.DB.prepare(`
    SELECT *
    FROM business_projects
    WHERE order_id = ?
    LIMIT 1
  `)
        .bind(order.id)
        .first<any>()

    if (existing) {
        await env.DB.prepare(`
      UPDATE orders
      SET business_project_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(existing.id, order.id)
            .run()

        return existing
    }

    const year = new Date().getFullYear()
    const count = await env.DB.prepare(`
    SELECT COUNT(*) AS c
    FROM business_projects
    WHERE code LIKE ?
  `)
        .bind(`PRJ-${year}-%`)
        .first<{ c: number }>()

    const code = `PRJ-${year}-${String(
        Number(count?.c || 0) + 1,
    ).padStart(3, '0')}`

    const result = await env.DB.prepare(`
    INSERT INTO business_projects (
      code,
      name,
      customer,
      value,
      status,
      deadline,
      type,
      order_id,
      revenue,
      project_cost,
      net_profit
    )
    VALUES (?, ?, ?, ?, 'Planning', ?, ?, ?, 0, 0, 0)
  `)
        .bind(
            code,
            order.product_name || `Order ${order.order_number}`,
            order.customer_name,
            Number(order.final_total || order.total_price || 0),
            new Date(Date.now() + 30 * 86400000)
                .toISOString()
                .slice(0, 10),
            order.type || 'Custom',
            order.id,
        )
        .run()

    const projectId = Number(result.meta.last_row_id)

    await env.DB.prepare(`
    UPDATE orders
    SET business_project_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
        .bind(projectId, order.id)
        .run()

    return await env.DB.prepare(`
    SELECT *
    FROM business_projects
    WHERE id = ?
    LIMIT 1
  `)
        .bind(projectId)
        .first<any>()
}

async function createAutomaticBusinessDocument(
    env: Env,
    type: 'Invoice' | 'Receipt' | 'Order Confirmation',
    title: string,
    projectId: number | null,
    relatedTo: string,
    content: string,
) {
    const year = new Date().getFullYear()
    const existing = await env.DB.prepare(`
    SELECT id
    FROM business_documents
    WHERE document_type = ?
      AND title = ?
      AND project_id IS ?
    LIMIT 1
  `)
        .bind(type, title, projectId)
        .first()

    if (existing) return existing

    const result = await env.DB.prepare(`
    INSERT INTO business_documents (
      project_id,
      document_type,
      title,
      description,
      file_url,
      status
    )
    VALUES (?, ?, ?, ?, '', 'Active')
  `)
        .bind(
            projectId,
            type,
            title,
            `${relatedTo}\n\n${content}`,
        )
        .run()

    return await env.DB.prepare(`
    SELECT *
    FROM business_documents
    WHERE id = ?
    LIMIT 1
  `)
        .bind(result.meta.last_row_id)
        .first()
}

async function updateProjectFinancials(
    env: Env,
    projectId: number,
) {
    const revenue = await env.DB.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM finance_transactions
    WHERE project_id = ?
      AND type = 'Revenue'
      AND status = 'Completed'
  `)
        .bind(projectId)
        .first<{ total: number }>()

    const cost = await env.DB.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM finance_transactions
    WHERE project_id = ?
      AND type = 'Expense'
      AND status = 'Completed'
  `)
        .bind(projectId)
        .first<{ total: number }>()

    const revenueAmount = Number(revenue?.total || 0)
    const costAmount = Number(cost?.total || 0)
    const profit = Math.max(0, revenueAmount - costAmount)

    await env.DB.prepare(`
    UPDATE business_projects
    SET
      revenue = ?,
      project_cost = ?,
      net_profit = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
        .bind(
            revenueAmount,
            costAmount,
            profit,
            projectId,
        )
        .run()

    return {
        revenue: revenueAmount,
        cost: costAmount,
        net_profit: profit,
    }
}

async function finalizePaidPayment(
    env: Env,
    transaction: PaymentTransaction,
) {
    if (transaction.payment_stage === 'FINAL') {
        return await finalizeFinalPayment(env, transaction)
    }

    if (
        transaction.status === 'PAID' &&
        transaction.order_id
    ) {
        const order = await env.DB.prepare(`
      SELECT * FROM orders WHERE id = ? LIMIT 1
    `)
            .bind(transaction.order_id)
            .first<any>()

        return { order, transaction }
    }

    const current = await getPaymentTransaction(
        env,
        transaction.payment_reference,
    )

    if (!current) {
        throw new Error('Payment transaction not found.')
    }

    if (current.status === 'PAID' && current.order_id) {
        const order = await env.DB.prepare(`
      SELECT * FROM orders WHERE id = ? LIMIT 1
    `)
            .bind(current.order_id)
            .first<any>()
        return { order, transaction: current }
    }

    if (current.status === 'PROCESSING') {
        const order = current.order_id
            ? await env.DB.prepare(`
          SELECT * FROM orders WHERE id = ? LIMIT 1
        `)
                .bind(current.order_id)
                .first<any>()
            : null
        return { order, transaction: current }
    }

    if (current.status === 'EXPIRED') {
        return { order: null, transaction: current }
    }

    if (current.status !== 'PENDING') {
        return { order: null, transaction: current }
    }

    if (
        current.expires_at &&
        new Date(current.expires_at).getTime() < Date.now()
    ) {
        await env.DB.prepare(`
      UPDATE payment_transactions
      SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'PENDING'
    `)
            .bind(current.id)
            .run()

        return {
            order: null,
            transaction: { ...current, status: 'EXPIRED' as PaymentStatus },
        }
    }

    const claim = await env.DB.prepare(`
    UPDATE payment_transactions
    SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'PENDING'
  `)
        .bind(current.id)
        .run()

    if (claim.meta.changes !== 1) {
        const latest = await getPaymentTransaction(
            env,
            current.payment_reference,
        )
        if (!latest) throw new Error('Payment transaction disappeared while finalizing.')
        const order = latest.order_id
            ? await env.DB.prepare(`SELECT * FROM orders WHERE id=? LIMIT 1`).bind(latest.order_id).first<any>()
            : null
        return { order, transaction: latest }
    }

    if (current.product_id !== null) {
        const stockResult = await env.DB.prepare(`
      UPDATE products
      SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND stock >= ? AND status = 'Published'
    `)
            .bind(
                current.quantity,
                current.product_id,
                current.quantity,
            )
            .run()

        if (stockResult.meta.changes !== 1) {
            await env.DB.prepare(`
        UPDATE payment_transactions
        SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'PROCESSING'
      `)
                .bind(current.id)
                .run()
            throw new Error('Payment was successful but the product is no longer available. Contact the administrator for refund handling.')
        }
    }

    const orderNumber = generateOrderNumber()
    const publicTokenHash = current.public_access_token_hash || await sha256(await createPublicPaymentToken())
    const dpAmount = Number(current.amount)
    const finalAmount = Number(current.final_amount)
    const remainingAmount = Math.max(0, finalAmount - dpAmount)

    const insertResult = await env.DB.prepare(`
    INSERT INTO orders (
      order_number,
      product_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      product_name,
      quantity,
      unit_price,
      total_price,
      original_total,
      discount_amount,
      final_total,
      promotion_id,
      promotion_code,
      dp_amount,
      dp_paid_at,
      remaining_amount,
      paid_amount,
      payment_status,
      type,
      status,
      public_payment_token,
      public_payment_token_hash
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?,
      'DP_PAID', ?, 'DP Paid', ?
    )
  `)
        .bind(
            orderNumber,
            current.product_id,
            current.service_id,
            current.customer_name,
            current.customer_email,
            current.customer_phone,
            current.item_name,
            current.quantity,
            current.unit_price,
            finalAmount,
            current.original_amount,
            current.discount_amount,
            finalAmount,
            current.promotion_id,
            current.promotion_code,
            dpAmount,
            remainingAmount,
            dpAmount,
            current.type,
            null,
            publicTokenHash,
        )
        .run()

    const orderId = Number(insertResult.meta.last_row_id)

    await env.DB.prepare(`
    UPDATE payment_transactions
    SET
      status = 'PAID',
      order_id = ?,
      paid_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'PROCESSING'
  `)
        .bind(orderId, current.id)
        .run()

    const order = await env.DB.prepare(`
    SELECT * FROM orders WHERE id = ? LIMIT 1
  `)
        .bind(orderId)
        .first<any>()

    const project = await createBusinessProjectFromOrder(
        env,
        order,
    )

    if (project) {
        await createAutomaticFinanceRevenue(
            env,
            Number(project.id),
            dpAmount,
            current.payment_reference,
            'DP',
        )

        const dpPaidAt = new Date().toISOString()
        await createAutomaticBusinessDocument(
            env,
            'Order Confirmation',
            `Order Confirmation - ${orderNumber}`,
            Number(project.id),
            orderNumber,
            [
                `Customer: ${current.customer_name}`,
                `Email: ${current.customer_email}`,
                `WhatsApp: ${current.customer_phone}`,
                `Item / Service: ${current.item_name}`,
                `Quantity: ${current.quantity}`,
                `Order Total: Rp${finalAmount.toLocaleString('id-ID')}`,
                `DP Required: Rp${dpAmount.toLocaleString('id-ID')} (50%)`,
                `Remaining: Rp${remainingAmount.toLocaleString('id-ID')}`,
                `DP Paid At: ${dpPaidAt}`,
                `Payment Method: DANA QRIS`,
                `Payment Reference: ${current.payment_reference}`,
            ].join('\n'),
        )

        await updateProjectFinancials(env, Number(project.id))

        await createAutomaticBusinessDocument(
            env,
            'Invoice',
            `DP Invoice - ${orderNumber}`,
            Number(project.id),
            orderNumber,
            [
                `Customer: ${current.customer_name}`,
                `Item / Service: ${current.item_name}`,
                `Invoice Stage: DP 50%`,
                `Order Total: Rp${finalAmount.toLocaleString('id-ID')}`,
                `DP Amount: Rp${dpAmount.toLocaleString('id-ID')}`,
                `Remaining Balance: Rp${remainingAmount.toLocaleString('id-ID')}`,
                `Issued / Paid At: ${dpPaidAt}`,
                `Payment Method: DANA QRIS`,
                `Payment Reference: ${current.payment_reference}`,
            ].join('\n'),
        )

        await createAutomaticBusinessDocument(
            env,
            'Receipt',
            `DP Receipt - ${orderNumber}`,
            Number(project.id),
            orderNumber,
            [
                `Customer: ${current.customer_name}`,
                `Item / Service: ${current.item_name}`,
                `Order Total: Rp${finalAmount.toLocaleString('id-ID')}`,
                `Payment Stage: DP 50%`,
                `Amount Paid: Rp${dpAmount.toLocaleString('id-ID')}`,
                `Remaining Balance: Rp${remainingAmount.toLocaleString('id-ID')}`,
                `Paid At: ${dpPaidAt}`,
                `Payment Method: DANA QRIS`,
                `Payment Reference: ${current.payment_reference}`,
                `Status: PAID`,
            ].join('\n'),
        )

        await audit(
            env,
            0,
            'PAYMENT_RECEIVED',
            'Payments',
            'payment',
            current.id,
            null,
            { order_id: orderId, project_id: project.id, stage: 'DP', amount: dpAmount },
            'Info',
            'Customer DP payment received.',
        )
    }

    return {
        order,
        transaction: {
            ...current,
            status: 'PAID' as PaymentStatus,
            order_id: orderId,
        },
    }
}

async function finalizeFinalPayment(
    env: Env,
    transaction: PaymentTransaction,
) {
    if (!transaction.order_id) {
        throw new Error('Final payment is not linked to an order.')
    }

    const order = await env.DB.prepare(`
    SELECT * FROM orders WHERE id = ? LIMIT 1
  `)
        .bind(transaction.order_id)
        .first<any>()

    if (!order) {
        throw new Error('Order linked to final payment was not found.')
    }

    if (transaction.status === 'PAID') {
        return { order, transaction }
    }

    if (transaction.status !== 'PENDING') {
        return { order, transaction }
    }

    const claim = await env.DB.prepare(`
    UPDATE payment_transactions
    SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'PENDING'
  `)
        .bind(transaction.id)
        .run()

    if (claim.meta.changes !== 1) {
        const latest = await getPaymentTransaction(env, transaction.payment_reference)
        if (!latest) throw new Error('Final payment transaction disappeared while finalizing.')
        const latestOrder = latest.order_id
            ? await env.DB.prepare(`SELECT * FROM orders WHERE id=? LIMIT 1`).bind(latest.order_id).first<any>()
            : order
        return { order: latestOrder, transaction: latest }
    }

    const amount = Number(transaction.amount)
    const remaining = Number(order.remaining_amount || 0)

    if (amount !== remaining) {
        await env.DB.prepare(`
      UPDATE payment_transactions
      SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'PROCESSING'
    `)
            .bind(transaction.id)
            .run()
        throw new Error('Final payment amount does not match the order remaining balance.')
    }

    const paidAmount = Number(order.paid_amount || 0) + amount

    await env.DB.prepare(`
    UPDATE payment_transactions
    SET
      status = 'PAID',
      paid_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'PROCESSING'
  `)
        .bind(transaction.id)
        .run()

    await env.DB.prepare(`
    UPDATE orders
    SET
      paid_amount = ?,
      remaining_amount = 0,
      payment_status = 'PAID_FULL',
      final_paid_at = CURRENT_TIMESTAMP,
      status = 'Paid Full',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
        .bind(paidAmount, order.id)
        .run()

    if (order.business_project_id) {
        const projectId = Number(order.business_project_id)

        await createAutomaticFinanceRevenue(
            env,
            projectId,
            amount,
            transaction.payment_reference,
            'FINAL',
        )

        const financials = await updateProjectFinancials(
            env,
            projectId,
        )

        await createAutomaticBusinessDocument(
            env,
            'Invoice',
            `Final Invoice - ${order.order_number}`,
            projectId,
            order.order_number,
            [
                `Customer: ${order.customer_name}`,
                `Email: ${order.customer_email}`,
                `WhatsApp: ${order.customer_phone}`,
                `Item / Service: ${order.product_name}`,
                `Invoice Stage: Final / Pelunasan 50%`,
                `Order Total: Rp${Number(order.final_total || paidAmount).toLocaleString('id-ID')}`,
                `DP Paid: Rp${Number(order.dp_amount || 0).toLocaleString('id-ID')} — ${order.dp_paid_at || '-'}`,
                `Final Payment: Rp${amount.toLocaleString('id-ID')} — ${new Date().toISOString()}`,
                `Total Paid: Rp${paidAmount.toLocaleString('id-ID')}`,
                `Remaining: Rp0`,
                `Payment Method: DANA QRIS`,
                `Payment Reference: ${transaction.payment_reference}`,
                `Net Profit Currently: Rp${Number(financials.net_profit || 0).toLocaleString('id-ID')}`,
            ].join('\n'),
        )

        await createAutomaticBusinessDocument(
            env,
            'Receipt',
            `Final Receipt - ${order.order_number}`,
            projectId,
            order.order_number,
            [
                `Customer: ${order.customer_name}`,
                `Item / Service: ${order.product_name}`,
                `Order Total: Rp${Number(order.final_total || paidAmount).toLocaleString('id-ID')}`,
                `DP Paid: Rp${Number(order.dp_amount || 0).toLocaleString('id-ID')} — ${order.dp_paid_at || '-'}`,
                `Final Payment: Rp${amount.toLocaleString('id-ID')} — ${new Date().toISOString()}`,
                `Total Paid: Rp${paidAmount.toLocaleString('id-ID')}`,
                `Remaining: Rp0`,
                `Payment Method: DANA QRIS`,
                `Payment Reference: ${transaction.payment_reference}`,
                `Status: PAID IN FULL`,
            ].join('\n'),
        )

        await audit(
            env,
            0,
            'FINAL_PAYMENT_RECEIVED',
            'Payments',
            'payment',
            transaction.id,
            null,
            { order_id: order.id, project_id: projectId, stage: 'FINAL', amount },
            'Info',
            'Customer final payment received.',
        )
    }

    const updatedOrder = await env.DB.prepare(`
    SELECT * FROM orders WHERE id = ? LIMIT 1
  `)
        .bind(order.id)
        .first<any>()

    return {
        order: updatedOrder,
        transaction: {
            ...transaction,
            status: 'PAID' as PaymentStatus,
        },
    }
}

async function createFinalPayment(
    env: Env,
    body: { order_number?: unknown; payment_token?: unknown },
) {
    const orderNumber = typeof body.order_number === 'string' ? body.order_number.trim() : ''
    const paymentToken = typeof body.payment_token === 'string' ? body.payment_token.trim() : ''

    if (!orderNumber || !paymentToken || paymentToken.length < 32 || paymentToken.length > 256) {
        return json({ success: false, message: 'Invalid order credentials.' }, 400)
    }

    const paymentTokenHash = await sha256(paymentToken)

    const configResult = requireDanaConfig(env)
    if ('error' in configResult) {
        return json({ success: false, message: configResult.error }, 503)
    }

    const order = await env.DB.prepare(`
    SELECT * FROM orders
    WHERE order_number = ?
      AND (public_payment_token = ? OR public_payment_token_hash = ?)
    LIMIT 1
  `)
        .bind(orderNumber, paymentToken, paymentTokenHash)
        .first<any>()

    if (!order) return json({ success: false, message: 'Order not found.' }, 404)

    if (order.status !== 'Ready for Final Payment') {
        return json({ success: false, message: 'This order is not ready for final payment.' }, 400)
    }

    const amount = Number(order.remaining_amount || 0)
    if (amount <= 0) return json({ success: false, message: 'This order has no remaining payment.' }, 400)

    const existing = await env.DB.prepare(`
    SELECT * FROM payment_transactions
    WHERE order_id = ?
      AND payment_stage = 'FINAL'
      AND status IN ('PENDING', 'PROCESSING')
    ORDER BY id DESC
    LIMIT 1
  `)
        .bind(order.id)
        .first<any>()

    if (existing) {
        return json({
            success: true,
            message: 'Final payment already initialized.',
            data: {
                payment_reference: existing.payment_reference,
                partner_reference_no: existing.partner_reference_no,
                payment_method: existing.payment_method,
                payment_stage: 'FINAL',
                status: existing.status,
                amount: Number(existing.amount),
                remaining_amount: amount,
                qr_content: existing.qr_content,
                qr_url: existing.qr_url,
                qr_image: existing.qr_image,
                expires_at: existing.expires_at,
            },
        })
    }

    const paymentReference = randomReference('SKYFINAL')
    const partnerReferenceNo = paymentReference
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const insert = await env.DB.prepare(`
    INSERT INTO payment_transactions (
      payment_reference,
      partner_reference_no,
      order_id,
      payment_stage,
      payment_method,
      type,
      amount,
      status,
      customer_name,
      customer_email,
      customer_phone,
      product_id,
      service_id,
      item_name,
      quantity,
      unit_price,
      original_amount,
      discount_amount,
      final_amount,
      promotion_id,
      promotion_code,
      expires_at,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, 'FINAL', 'DANA_QRIS', ?, ?, 'PENDING',
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `)
        .bind(
            paymentReference,
            partnerReferenceNo,
            order.id,
            order.type,
            amount,
            order.customer_name,
            order.customer_email,
            order.customer_phone,
            order.product_id,
            order.service_id,
            order.product_name,
            order.quantity,
            order.unit_price,
            order.original_total,
            order.discount_amount,
            order.final_total,
            order.promotion_id,
            order.promotion_code,
            expiresAt,
        )
        .run()

    try {
        const qrResponse = await danaRequest(
            env,
            'POST',
            '/v1.0/qr/qr-mpm-generate.htm',
            {
                merchantId: danaConfig(env).merchantId,
                storeId: danaConfig(env).storeId,
                terminalId: '',
                partnerReferenceNo,
                amount: { value: amount.toFixed(2), currency: 'IDR' },
                validityPeriod: jakartaTimestampPlusMinutes(15),
            },
        )

        if (!qrResponse?.partnerReferenceNo || !qrResponse?.qrContent) {
            throw new Error(qrResponse?.responseMessage || 'DANA did not return a valid QRIS payload.')
        }

        await env.DB.prepare(`
      UPDATE payment_transactions
      SET
        dana_reference_no = ?,
        qr_content = ?,
        qr_url = ?,
        qr_image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(
                qrResponse.referenceNo ?? null,
                qrResponse.qrContent,
                qrResponse.qrUrl ?? null,
                qrResponse.qrImage ?? null,
                insert.meta.last_row_id,
            )
            .run()

        return json({
            success: true,
            message: 'Final payment created successfully.',
            data: {
                payment_reference: paymentReference,
                partner_reference_no: partnerReferenceNo,
                payment_method: 'DANA_QRIS',
                payment_stage: 'FINAL',
                status: 'PENDING',
                order_number: order.order_number,
                amount,
                remaining_amount: amount,
                qr_content: qrResponse.qrContent,
                qr_url: qrResponse.qrUrl ?? null,
                qr_image: qrResponse.qrImage ?? null,
                expires_at: expiresAt,
            },
        }, 201)
    } catch (error) {
        await env.DB.prepare(`DELETE FROM payment_transactions WHERE id = ?`).bind(insert.meta.last_row_id).run()
        throw error
    }
}

async function markPaymentPaid(
    env: Env,
    paymentReference: string,
    danaReferenceNo: string | null,
) {
    const transaction =
        await getPaymentTransaction(
            env,
            paymentReference,
        )

    if (!transaction) {
        throw new Error(
            'Payment transaction not found.',
        )
    }

    if (
        transaction.status === 'PAID' &&
        transaction.order_id
    ) {
        return await finalizePaidPayment(
            env,
            transaction,
        )
    }

    await env.DB.prepare(`
    UPDATE payment_transactions
    SET
      status = 'PENDING',
      dana_reference_no =
        COALESCE(?, dana_reference_no),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND status = 'PENDING'
  `)
        .bind(
            danaReferenceNo,
            transaction.id,
        )
        .run()

    return await finalizePaidPayment(
        env,
        {
            ...transaction,
            status: 'PENDING',
            dana_reference_no:
                danaReferenceNo ||
                transaction.dana_reference_no,
        },
    )
}

async function queryDanaPayment(
    env: Env,
    transaction: PaymentTransaction,
) {
    const response =
        await danaRequest(
            env,
            'POST',
            '/rest/v1.1/debit/status',
            {
                originalPartnerReferenceNo:
                    transaction.partner_reference_no,
                merchantId:
                    danaConfig(env).merchantId,
                externalStoreId:
                    danaConfig(env).storeId,
                serviceCode: '47',
            },
        )

    return response
}

async function syncPaymentStatus(
    env: Env,
    paymentReference: string,
) {
    const transaction =
        await getPaymentTransaction(
            env,
            paymentReference,
        )

    if (!transaction) {
        return {
            error: 'Payment not found.',
        }
    }

    if (
        transaction.status === 'PAID' &&
        transaction.order_id
    ) {
        const finalized =
            await finalizePaidPayment(
                env,
                transaction,
            )

        return {
            transaction:
                finalized.transaction,
            order:
                finalized.order,
            dana_status: '00',
        }
    }

    if (
        transaction.status !== 'PENDING'
    ) {
        return {
            transaction,
            order: null,
            dana_status: null,
        }
    }

    try {
        const danaResponse =
            await queryDanaPayment(
                env,
                transaction,
            )

        const latestStatus =
            danaResponse?.latestTransactionStatus

        const danaAmount =
            Number(
                danaResponse?.transAmount?.value ??
                danaResponse?.amount?.value ??
                0,
            )

        if (
            latestStatus === '00' ||
            latestStatus === '02'
        ) {
            if (
                danaAmount > 0 &&
                Math.round(danaAmount) !==
                Math.round(transaction.amount)
            ) {
                throw new Error(
                    'DANA payment amount does not match the expected DP amount.',
                )
            }

            const finalized =
                await markPaymentPaid(
                    env,
                    paymentReference,
                    danaResponse?.originalReferenceNo ??
                    transaction.dana_reference_no,
                )

            return {
                transaction:
                    finalized.transaction,
                order:
                    finalized.order,
                dana_status:
                    latestStatus,
            }
        }

        if (
            latestStatus === '05' ||
            latestStatus === '07'
        ) {
            await env.DB.prepare(`
        UPDATE payment_transactions
        SET
          status = 'FAILED',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND status = 'PENDING'
      `)
                .bind(transaction.id)
                .run()

            return {
                transaction: {
                    ...transaction,
                    status: 'FAILED' as PaymentStatus,
                },
                order: null,
                dana_status:
                    latestStatus,
            }
        }

        return {
            transaction,
            order: null,
            dana_status:
                latestStatus ?? null,
        }
    } catch (error) {
        console.error(
            'Sync DANA payment error:',
            error,
        )

        return {
            transaction,
            order: null,
            dana_status: null,
            warning: 'Unable to query DANA payment status.',
        }
    }
}

async function handleDanaWebhook(
    request: Request,
    env: Env,
) {
    const body =
        await request.text()

    const signature =
        request.headers.get('X-SIGNATURE') || ''

    const timestamp =
        request.headers.get('X-TIMESTAMP') || ''

    if (!signature || !timestamp) {
        return json(
            {
                responseCode: '4005601',
                responseMessage:
                    'Missing DANA signature headers.',
            },
            400,
        )
    }

    // Signature verification alone does not prevent replay of an old, valid
    // webhook. Reject timestamps outside a short tolerance window.
    const webhookTime = Date.parse(timestamp)
    if (!Number.isFinite(webhookTime) || Math.abs(Date.now() - webhookTime) > 5 * 60 * 1000) {
        return json(
            {
                responseCode: '4015600',
                responseMessage: 'Expired or invalid DANA webhook timestamp.',
            },
            401,
        )
    }

    try {
        const verified =
            await verifyDanaWebhook(
                env,
                body,
                signature,
                timestamp,
                new URL(request.url).pathname,
            )

        if (!verified) {
            return json(
                {
                    responseCode: '4015600',
                    responseMessage:
                        'Invalid DANA webhook signature.',
                },
                401,
            )
        }

        const payload =
            JSON.parse(body)

        const paymentReference =
            payload?.originalPartnerReferenceNo

        if (
            typeof paymentReference !==
            'string'
        ) {
            return json(
                {
                    responseCode: '4005601',
                    responseMessage:
                        'Missing originalPartnerReferenceNo.',
                },
                400,
            )
        }

        const transaction =
            await getPaymentTransaction(
                env,
                paymentReference,
            )

        if (!transaction) {
            return json(
                {
                    responseCode: '4045600',
                    responseMessage:
                        'Payment transaction not found.',
                },
                404,
            )
        }

        const amount =
            Number(
                payload?.amount?.value ?? 0,
            )

        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            Math.round(amount) !==
            Math.round(transaction.amount)
        ) {
            return json(
                {
                    responseCode: '4005601',
                    responseMessage:
                        'Payment amount mismatch.',
                },
                400,
            )
        }

        const status =
            payload?.latestTransactionStatus
        const callbackReference = payload?.originalReferenceNo
        if (callbackReference && transaction.dana_reference_no && callbackReference !== transaction.dana_reference_no) {
            return json({ responseCode: '4005601', responseMessage: 'Payment reference mismatch.' }, 400)
        }

        if (transaction.status === 'PAID' && (status === '00' || status === '02')) {
            return json({ responseCode: '2005600', responseMessage: 'Successful' })
        }

        if (
            status === '00' ||
            status === '02'
        ) {
            const finalized =
                await markPaymentPaid(
                    env,
                    paymentReference,
                    payload?.originalReferenceNo ??
                    null,
                )

            if (!finalized.order) {
                throw new Error(
                    'Payment was verified but order creation failed.',
                )
            }
        } else if (
            status === '05' ||
            status === '07'
        ) {
            await env.DB.prepare(`
        UPDATE payment_transactions
        SET
          status = 'FAILED',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND status = 'PENDING'
      `)
                .bind(transaction.id)
                .run()
        }

        return json({
            responseCode: '2005600',
            responseMessage: 'Successful',
        })
    } catch (error) {
        console.error(
            'DANA webhook error:',
            error,
        )

        return json(
            {
                responseCode: '5005601',
                responseMessage:
                    'Internal server error.',
            },
            500,
        )
    }
}

async function getPaymentStatus(
    env: Env,
    paymentReference: string,
    paymentToken = '',
) {
    const transaction = await getPaymentTransaction(env, paymentReference)

    if (!transaction) {
        return json({ success: false, message: 'Payment not found.' }, 404)
    }

    if (!paymentToken || paymentToken.length < 32 || paymentToken.length > 256) {
        return json({ success: false, message: 'Payment credentials are required.' }, 401)
    }

    const suppliedTokenHash = await sha256(paymentToken)
    let tokenAuthorized = transaction.public_access_token_hash === suppliedTokenHash

    if (!tokenAuthorized && transaction.order_id) {
        const orderCredential = await env.DB.prepare(`
            SELECT public_payment_token_hash, public_payment_token
            FROM orders
            WHERE id = ?
            LIMIT 1
        `).bind(transaction.order_id).first<{ public_payment_token_hash: string | null; public_payment_token: string | null }>()

        tokenAuthorized = !!orderCredential && (
            (orderCredential.public_payment_token_hash && orderCredential.public_payment_token_hash === suppliedTokenHash) ||
            (orderCredential.public_payment_token && orderCredential.public_payment_token === paymentToken)
        )
    }

    if (!tokenAuthorized) {
        return json({ success: false, message: 'Payment credentials are invalid.' }, 401)
    }

    const result =
        await syncPaymentStatus(
            env,
            paymentReference,
        )

    if ('error' in result) {
        return json(
            {
                success: false,
                message: result.error,
            },
            404,
        )
    }

    const authorizedOrder = result.order && paymentToken
        ? (result.order.public_payment_token_hash
            ? result.order.public_payment_token_hash === await sha256(paymentToken)
            : result.order.public_payment_token === paymentToken)
        : false

    const publicOrder =
        result.order && authorizedOrder
            ? {
                id: result.order.id,
                order_number:
                    result.order.order_number,
                product_id:
                    result.order.product_id,
                service_id:
                    result.order.service_id,
                customer_name:
                    result.order.customer_name,
                product_name:
                    result.order.product_name,
                quantity:
                    result.order.quantity,
                unit_price:
                    result.order.unit_price,
                total_price:
                    result.order.total_price,
                original_total:
                    result.order.original_total,
                discount_amount:
                    result.order.discount_amount,
                final_total:
                    result.order.final_total,
                promotion_id:
                    result.order.promotion_id,
                promotion_code:
                    result.order.promotion_code,
                paid_amount:
                    result.order.paid_amount,
                final_paid_at:
                    result.order.final_paid_at,
                payment_stage:
                    result.transaction.payment_stage,
                business_project_id:
                    result.order.business_project_id,
                dp_amount:
                    result.order.dp_amount,
                dp_paid_at:
                    result.order.dp_paid_at,
                remaining_amount:
                    result.order.remaining_amount,
                payment_status:
                    result.order.payment_status,
                type:
                    result.order.type,
                status:
                    result.order.status,
                created_at:
                    result.order.created_at,
                updated_at:
                    result.order.updated_at,
            }
            : null

    return json({
        success: true,
        data: {
            payment_reference:
                paymentReference,
            status:
                result.transaction.status,
            payment_stage:
                result.transaction.payment_stage,
            amount:
                result.transaction.amount,
            dp_amount:
                result.transaction.payment_stage === 'DP'
                    ? result.transaction.amount
                    : result.order?.dp_amount ?? null,
            subtotal:
                result.transaction.original_amount,
            discount_amount:
                result.transaction.discount_amount,
            final_amount:
                result.transaction.final_amount,
            remaining_amount:
                result.order?.remaining_amount ??
                Math.max(0, Number(result.transaction.final_amount) - Number(result.transaction.amount)),
            paid_amount:
                result.order?.paid_amount ??
                (result.transaction.status === 'PAID' ? result.transaction.amount : 0),
            order:
                publicOrder,
            dana_status:
                result.dana_status,
            expires_at:
                result.transaction.expires_at,
            paid_at:
                result.transaction.paid_at,
            qr_content:
                result.transaction.qr_content,
            qr_url:
                result.transaction.qr_url,
            qr_image:
                result.transaction.qr_image,
            warning: null,
        },
    })
}

async function createOrder(
    env: Env,
    body: OrderPayload,
) {
    const validation =
        validateOrderPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        type,
        productId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        quantity,
    } = validation.data

    try {
        let itemName = ''
        let unitPrice = 0

        if (type === 'Product') {
            const product =
                await env.DB.prepare(
                    `
          SELECT
            id,
            name,
            price,
            stock,
            status
          FROM products
          WHERE id = ?
          `,
                )
                    .bind(productId)
                    .first<{
                        id: number
                        name: string
                        price: number
                        stock: number
                        status: string
                    }>()

            if (!product) {
                return json(
                    {
                        success: false,
                        message: 'Product not found.',
                    },
                    404,
                )
            }

            if (product.status !== 'Published') {
                return json(
                    {
                        success: false,
                        message:
                            'This product is not available.',
                    },
                    400,
                )
            }

            if (product.stock < quantity) {
                return json(
                    {
                        success: false,
                        message:
                            'Insufficient product stock.',
                    },
                    400,
                )
            }

            itemName = product.name
            unitPrice = Number(product.price)
        }

        if (type === 'Service') {
            const service =
                await env.DB.prepare(
                    `
          SELECT
            id,
            name,
            price,
            pricing_type,
            status
          FROM services
          WHERE id = ?
          `,
                )
                    .bind(serviceId)
                    .first<{
                        id: number
                        name: string
                        price: number
                        pricing_type: ServicePricingType
                        status: string
                    }>()

            if (!service) {
                return json(
                    {
                        success: false,
                        message: 'Service not found.',
                    },
                    404,
                )
            }

            if (service.status !== 'Active') {
                return json(
                    {
                        success: false,
                        message:
                            'This service is not available.',
                    },
                    400,
                )
            }

            if (service.pricing_type !== 'fixed') {
                return json(
                    {
                        success: false,
                        message:
                            'This service must go through Request Quote and cannot be created directly as an order.',
                    },
                    400,
                )
            }

            itemName = service.name
            unitPrice = Number(service.price)
        }

        const totalPrice =
            unitPrice * quantity

        const orderNumber =
            generateOrderNumber()

        const insertResult =
            await env.DB.prepare(
                `
        INSERT INTO orders (
          order_number,
          product_id,
          service_id,
          customer_name,
          customer_email,
          customer_phone,
          product_name,
          quantity,
          unit_price,
          total_price,
          type,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            )
                .bind(
                    orderNumber,
                    productId,
                    serviceId,
                    customerName,
                    customerEmail,
                    customerPhone,
                    itemName,
                    quantity,
                    unitPrice,
                    totalPrice,
                    type,
                    'Pending',
                )
                .run()

        const orderId = Number(insertResult.meta.last_row_id)

        await createAdminNotification(env, {
            type: 'order',
            title: 'New Order',
            message: `${itemName} — ${customerName}`,
            referenceType: 'order',
            referenceId: orderId,
            referenceNumber: orderNumber,
        })

        await sendAdminEmailNotification(env, {
            title: 'New Order',
            message: `A new ${type.toLowerCase()} order has been created.`,
            referenceType: 'order', referenceNumber: orderNumber,
            customerName, customerEmail, customerPhone, itemName, amount: totalPrice,
        })

        if (type === 'Product') {
            await env.DB.prepare(
                `
        UPDATE products
        SET
          stock = stock - ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
            )
                .bind(quantity, productId)
                .run()
        }

        return json(
            {
                success: true,
                message:
                    'Order created successfully.',
                data: {
                    id: insertResult.meta.last_row_id,
                    order_number: orderNumber,
                    product_id: productId,
                    service_id: serviceId,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    product_name: itemName,
                    quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    type,
                    status: 'Pending',
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create order error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to create order.',
            },
            500,
        )
    }
}

async function updateOrder(
    env: Env,
    id: number,
    body: {
        status?: unknown
    },
) {
    const status =
        typeof body.status === 'string'
            ? body.status
            : ''

    if (
        !allowedOrderStatuses.includes(
            status as OrderStatus,
        )
    ) {
        return json(
            {
                success: false,
                message:
                    'Order status must be Pending, Processing, Completed, WaitingFinalPayment, PaidFull, or Cancelled.',
            },
            400,
        )
    }

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT
          id,
          status
        FROM orders
        WHERE id = ?
        `,
            )
                .bind(id)
                .first<{
                    id: number
                    status: string
                }>()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Order not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      UPDATE orders
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(status, id)
            .run()

        return json({
            success: true,
            message:
                'Order status updated successfully.',
            data: {
                id,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update order error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update order.',
            },
            500,
        )
    }
}

async function deleteOrder(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM orders
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Order not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM orders
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Order deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete order error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete order.',
            },
            500,
        )
    }
}

/* =========================
   PUBLIC ORDER TRACKING
========================= */

async function trackOrder(
    env: Env,
    orderNumber: string,
    paymentToken: string,
) {
    try {
        const order = await env.DB.prepare(`
      SELECT
        id,
        order_number,
        product_id,
        service_id,
        customer_name,
        product_name,
        quantity,
        unit_price,
        total_price,
        original_total,
        discount_amount,
        final_total,
        dp_amount,
        dp_paid_at,
        remaining_amount,
        paid_amount,
        final_paid_at,
        payment_status,
        type,
        status,
        business_project_id,
        public_payment_token,
        public_payment_token_hash,
        created_at,
        updated_at
      FROM orders
      WHERE order_number = ?
        AND (public_payment_token = ? OR public_payment_token_hash = ?)
      LIMIT 1
    `)
            .bind(orderNumber, paymentToken, await sha256(paymentToken))
            .first<any>()

        if (!order) return json({ success: false, message: 'Order not found.' }, 404)

        const payments = await env.DB.prepare(`
      SELECT
        payment_reference,
        payment_stage,
        payment_method,
        amount,
        status,
        paid_at,
        created_at
      FROM payment_transactions
      WHERE order_id = ?
      ORDER BY id ASC
    `)
            .bind(order.id)
            .all()

        const project = order.business_project_id
            ? await env.DB.prepare(`
          SELECT id, code, name, customer, value, status, deadline, type,
                 revenue, project_cost, net_profit, completed_at,
                 created_at, updated_at
          FROM business_projects
          WHERE id = ?
          LIMIT 1
        `)
                .bind(order.business_project_id)
                .first<any>()
            : null

        return json({
            success: true,
            data: {
                ...order,
                payments: payments.results,
                project,
                payment_summary: {
                    total: Number(order.final_total || order.total_price || 0),
                    dp_amount: Number(order.dp_amount || 0),
                    paid_amount: Number(order.paid_amount || 0),
                    remaining_amount: Number(order.remaining_amount || 0),
                    dp_paid: Number(order.dp_amount || 0) > 0 && !!order.dp_paid_at,
                    final_paid: Number(order.remaining_amount || 0) === 0 && !!order.final_paid_at,
                },
            },
        })
    } catch (error) {
        console.error('Track order error:', error)
        return json({
            success: false,
            message: 'Failed to track order.',
        }, 500)
    }
}

/* =========================================================
   IDOL PRODUCTION
========================================================= */

/* =========================
   IDOL GROUPS
========================= */

interface IdolGroupPayload {
    name?: unknown
    description?: unknown
    image_url?: unknown
    status?: unknown
}

const allowedIdolGroupStatuses =
    ['Active', 'Hiatus'] as const

type IdolGroupStatus =
    (typeof allowedIdolGroupStatuses)[number]

function getIdolGroupId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/idol\/groups\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateIdolGroupPayload(
    body: IdolGroupPayload,
) {
    const name =
        typeof body.name === 'string'
            ? body.name.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const image_url =
        typeof body.image_url === 'string'
            ? body.image_url.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Active'

    if (!name) {
        return {
            error: 'Idol group name is required.',
        }
    }

    if (
        !allowedIdolGroupStatuses.includes(
            status as IdolGroupStatus,
        )
    ) {
        return {
            error:
                'Idol group status must be Active or Hiatus.',
        }
    }

    return {
        data: {
            name,
            description,
            image_url,
            status,
        },
    }
}

async function getIdolGroups(
    env: Env,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          g.id,
          g.name,
          g.description,
          g.image_url,
          g.status,
          g.created_at,
          g.updated_at,
          (
            SELECT COUNT(*)
            FROM idol_members m
            WHERE m.group_id = g.id
              AND m.status = 'Active'
          ) AS member_count,
          (
            SELECT COUNT(*)
            FROM idol_releases r
            WHERE r.group_id = g.id
          ) AS release_count,
          (
            SELECT COUNT(*)
            FROM idol_activities a
            WHERE a.group_id = g.id
              AND a.status = 'Upcoming'
          ) AS upcoming_event_count,
          (
            SELECT COUNT(*)
            FROM idol_music_videos v
            WHERE v.group_id = g.id
          ) AS music_video_count
        FROM idol_groups g
        WHERE g.status IN ('Active', 'Hiatus')
        ORDER BY g.id DESC
        `,
            )
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol groups error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol groups.',
            },
            500,
        )
    }
}

async function getIdolGroup(
    env: Env,
    id: number,
) {
    try {
        const group =
            await env.DB.prepare(
                `
        SELECT
          id,
          name,
          description,
          image_url,
          status,
          created_at,
          updated_at
        FROM idol_groups
        WHERE id = ? AND status IN ('Active', 'Hiatus')
        `,
            )
                .bind(id)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const members =
            await env.DB.prepare(
                `
        SELECT
          id,
          group_id,
          name,
          stage_name,
          position,
          birth_date,
          bio,
          image_url,
          status,
          created_at,
          updated_at
        FROM idol_members
        WHERE group_id = ? AND status = 'Active'
        ORDER BY id ASC
        `,
            )
                .bind(id)
                .all()

        const releases =
            await env.DB.prepare(
                `
        SELECT
          id,
          group_id,
          title,
          type,
          release_date,
          description,
          cover_url,
          audio_url,
          spotify_url,
          youtube_url,
          status,
          created_at,
          updated_at
        FROM idol_releases
        WHERE group_id = ? AND status IN ('Released', 'Upcoming')
        ORDER BY release_date DESC, id DESC
        `,
            )
                .bind(id)
                .all()

        const musicVideos =
            await env.DB.prepare(
                `
        SELECT
          id,
          group_id,
          release_id,
          title,
          description,
          thumbnail_url,
          video_url,
          youtube_url,
          release_date,
          status,
          created_at,
          updated_at
        FROM idol_music_videos
        WHERE group_id = ? AND status IN ('Published', 'Upcoming')
        ORDER BY release_date DESC, id DESC
        `,
            )
                .bind(id)
                .all()

        const activities =
            await env.DB.prepare(
                `
        SELECT
          id,
          group_id,
          title,
          type,
          date,
          location,
          description,
          image_url,
          status,
          created_at,
          updated_at
        FROM idol_activities
        WHERE group_id = ? AND status IN ('Upcoming', 'Completed')
        ORDER BY date ASC, id ASC
        `,
            )
                .bind(id)
                .all()

        return json({
            success: true,
            data: {
                ...group,
                members: members.results,
                releases: releases.results,
                music_videos: musicVideos.results,
                activities: activities.results,
            },
        })
    } catch (error) {
        console.error(
            'Get idol group detail error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol group detail.',
            },
            500,
        )
    }
}

async function parseIdolRequest(request: Request) {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const body: Record<string, unknown> = {}

        for (const [key, value] of formData.entries()) {
            if (key === 'image') continue
            body[key] = typeof value === 'string' ? value : value.name
        }

        const imageValue = formData.get('image')
        const image =
            imageValue instanceof File && imageValue.size > 0
                ? imageValue
                : null

        return { body, image }
    }

    return {
        body: await request.json(),
        image: null,
    }
}

async function createIdolGroup(
    env: Env,
    body: IdolGroupPayload,
    image: File | null,
) {
    const validation =
        validateIdolGroupPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        description,
        image_url,
        status,
    } = validation.data

    let imageUrl = image_url
    if (image) imageUrl = await saveProductImage(image)

    try {
        const result =
            await env.DB.prepare(
                `
        INSERT INTO idol_groups (
          name,
          description,
          image_url,
          status
        )
        VALUES (?, ?, ?, ?)
        `,
            )
                .bind(
                    name,
                    description,
                    imageUrl,
                    status,
                )
                .run()

        return json(
            {
                success: true,
                message:
                    'Idol group created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    name,
                    description,
                    image_url: imageUrl,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create idol group error:',
            error,
        )

        const message =
            error instanceof Error
                ? error.message
                : ''

        if (
            message
                .toLowerCase()
                .includes('unique')
        ) {
            return json(
                {
                    success: false,
                    message:
                        'An idol group with this name already exists.',
                },
                409,
            )
        }

        return json(
            {
                success: false,
                message:
                    'Failed to create idol group.',
            },
            500,
        )
    }
}

async function updateIdolGroup(
    env: Env,
    id: number,
    body: IdolGroupPayload,
    image: File | null,
) {
    const validation =
        validateIdolGroupPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        description,
        image_url,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const imageUrl = image
            ? await saveProductImage(image)
            : String(existing.image_url || '')

        await env.DB.prepare(
            `
      UPDATE idol_groups
      SET
        name = ?,
        description = ?,
        image_url = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                name,
                description,
                imageUrl,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Idol group updated successfully.',
            data: {
                id,
                name,
                description,
                imageUrl,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update idol group error:',
            error,
        )

        const message =
            error instanceof Error
                ? error.message
                : ''

        if (
            message
                .toLowerCase()
                .includes('unique')
        ) {
            return json(
                {
                    success: false,
                    message:
                        'An idol group with this name already exists.',
                },
                409,
            )
        }

        return json(
            {
                success: false,
                message:
                    'Failed to update idol group.',
            },
            500,
        )
    }
}

async function deleteIdolGroup(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM idol_groups
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Idol group deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete idol group error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete idol group.',
            },
            500,
        )
    }
}

/* =========================
   IDOL MEMBERS
========================= */

interface IdolMemberPayload {
    name?: unknown
    stage_name?: unknown
    position?: unknown
    birth_date?: unknown
    email?: unknown
    bio?: unknown
    image_url?: unknown
    status?: unknown
}

const allowedIdolMemberStatuses =
    ['Active', 'Inactive'] as const

type IdolMemberStatus =
    (typeof allowedIdolMemberStatuses)[number]

function getIdolMemberId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/idol\/members\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateIdolMemberPayload(
    body: IdolMemberPayload,
) {
    const name =
        typeof body.name === 'string'
            ? body.name.trim()
            : ''

    const stage_name =
        typeof body.stage_name === 'string'
            ? body.stage_name.trim()
            : ''

    const position =
        typeof body.position === 'string'
            ? body.position.trim()
            : ''

    const birth_date =
        typeof body.birth_date === 'string'
            ? body.birth_date.trim()
            : ''

    const email =
        typeof body.email === 'string'
            ? body.email.trim()
            : ''

    const bio =
        typeof body.bio === 'string'
            ? body.bio.trim()
            : ''

    const image_url =
        typeof body.image_url === 'string'
            ? body.image_url.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Active'

    if (!name) {
        return {
            error: 'Member name is required.',
        }
    }

    if (!stage_name) {
        return {
            error: 'Member stage name is required.',
        }
    }

    if (!position) {
        return {
            error: 'Member position is required.',
        }
    }

    if (
        !allowedIdolMemberStatuses.includes(
            status as IdolMemberStatus,
        )
    ) {
        return {
            error:
                'Member status must be Active or Inactive.',
        }
    }

    return {
        data: {
            name,
            stage_name,
            position,
            birth_date,
            bio,
            image_url,
            status,
        },
    }
}

async function getIdolMembers(
    env: Env,
    groupId: number,
) {
    try {
        const group =
            await env.DB.prepare(
                `
        SELECT id, name
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(groupId)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const result =
            await env.DB.prepare(
                `
        SELECT
          id,
          group_id,
          name,
          stage_name,
          position,
          birth_date,
          bio,
          image_url,
          status,
          created_at,
          updated_at
        FROM idol_members
        WHERE group_id = ?
        ORDER BY id ASC
        `,
            )
                .bind(groupId)
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol members error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol members.',
            },
            500,
        )
    }
}

async function getIdolMember(
    env: Env,
    id: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          m.id,
          m.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          m.name,
          m.stage_name,
          m.position,
          m.birth_date,
          m.bio,
          m.image_url,
          m.status,
          m.created_at,
          m.updated_at
        FROM idol_members m
        INNER JOIN idol_groups g
          ON g.id = m.group_id
        WHERE m.id = ? AND m.status = 'Active'
        `,
            )
                .bind(id)
                .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Idol member not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get idol member error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol member.',
            },
            500,
        )
    }
}

async function createIdolMember(
    env: Env,
    groupId: number,
    body: IdolMemberPayload,
    image: File | null,
) {
    const validation =
        validateIdolMemberPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        stage_name,
        position,
        birth_date,
        email,
        bio,
        image_url,
        status,
    } = validation.data

    let imageUrl = image_url
    if (image) imageUrl = await saveProductImage(image)

    try {
        const group =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(groupId)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const result =
            await env.DB.prepare(
                `
        INSERT INTO idol_members (
          group_id,
          name,
          stage_name,
          position,
          birth_date,
          bio,
          image_url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            )
                .bind(
                    groupId,
                    name,
                    stage_name,
                    position,
                    birth_date,
                    email,
                    bio,
                    imageUrl,
                    status,
                )
                .run()

        return json(
            {
                success: true,
                message:
                    'Idol member created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    group_id: groupId,
                    name,
                    stage_name,
                    position,
                    birth_date,
                    email,
                    bio,
                    image_url: imageUrl,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create idol member error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to create idol member.',
            },
            500,
        )
    }
}

async function updateIdolMember(
    env: Env,
    id: number,
    body: IdolMemberPayload,
    image: File | null,
) {
    const validation =
        validateIdolMemberPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        name,
        stage_name,
        position,
        birth_date,
        email,
        bio,
        image_url,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM idol_members
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol member not found.',
                },
                404,
            )
        }

        const imageUrl = image
            ? await saveProductImage(image)
            : String(existing.image_url || '')

        await env.DB.prepare(
            `
      UPDATE idol_members
      SET
        name = ?,
        stage_name = ?,
        position = ?,
        birth_date = ?,
        email = ?,
        bio = ?,
        image_url = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                name,
                stage_name,
                position,
                birth_date,
                email,
                bio,
                imageUrl,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Idol member updated successfully.',
            data: {
                id,
                name,
                stage_name,
                position,
                birth_date,
                email,
                bio,
                imageUrl,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update idol member error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update idol member.',
            },
            500,
        )
    }
}

async function deleteIdolMember(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_members
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol member not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM idol_members
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Idol member deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete idol member error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete idol member.',
            },
            500,
        )
    }
}

/* =========================
   IDOL RELEASES
========================= */

interface IdolReleasePayload {
    title?: unknown
    type?: unknown
    release_date?: unknown
    description?: unknown
    cover_url?: unknown
    audio_url?: unknown
    spotify_url?: unknown
    youtube_url?: unknown
    status?: unknown
}

const allowedIdolReleaseTypes =
    ['Single', 'EP', 'Album'] as const

type IdolReleaseType =
    (typeof allowedIdolReleaseTypes)[number]

const allowedIdolReleaseStatuses =
    ['Released', 'Upcoming'] as const

type IdolReleaseStatus =
    (typeof allowedIdolReleaseStatuses)[number]

function getIdolReleaseId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/idol\/releases\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateIdolReleasePayload(
    body: IdolReleasePayload,
) {
    const title =
        typeof body.title === 'string'
            ? body.title.trim()
            : ''

    const type =
        typeof body.type === 'string'
            ? body.type
            : 'Single'

    const release_date =
        typeof body.release_date === 'string'
            ? body.release_date.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const cover_url =
        typeof body.cover_url === 'string'
            ? body.cover_url.trim()
            : ''

    const audio_url =
        typeof body.audio_url === 'string'
            ? body.audio_url.trim()
            : ''

    const spotify_url =
        typeof body.spotify_url === 'string'
            ? body.spotify_url.trim()
            : ''

    const youtube_url =
        typeof body.youtube_url === 'string'
            ? body.youtube_url.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Upcoming'

    if (!title) {
        return {
            error: 'Release title is required.',
        }
    }

    if (!release_date) {
        return {
            error: 'Release date is required.',
        }
    }

    if (
        !allowedIdolReleaseTypes.includes(
            type as IdolReleaseType,
        )
    ) {
        return {
            error:
                'Release type must be Single, EP, or Album.',
        }
    }

    if (
        !allowedIdolReleaseStatuses.includes(
            status as IdolReleaseStatus,
        )
    ) {
        return {
            error:
                'Release status must be Released or Upcoming.',
        }
    }

    return {
        data: {
            title,
            type: type as IdolReleaseType,
            release_date,
            description,
            cover_url,
            audio_url,
            spotify_url,
            youtube_url,
            status: status as IdolReleaseStatus,
        },
    }
}

async function getIdolReleases(
    env: Env,
    groupId: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          r.id,
          r.group_id,
          g.name AS group_name,
          r.title,
          r.type,
          r.release_date,
          r.description,
          r.cover_url,
          r.audio_url,
          r.spotify_url,
          r.youtube_url,
          r.status,
          r.created_at,
          r.updated_at
        FROM idol_releases r
        INNER JOIN idol_groups g
          ON g.id = r.group_id
        WHERE r.group_id = ? AND r.status IN ('Released', 'Upcoming')
        ORDER BY r.release_date DESC, r.id DESC
        `,
            )
                .bind(groupId)
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol releases error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol releases.',
            },
            500,
        )
    }
}

async function getAllIdolReleases(
    env: Env,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          r.id,
          r.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          r.title,
          r.type,
          r.release_date,
          r.description,
          r.cover_url,
          r.audio_url,
          r.spotify_url,
          r.youtube_url,
          r.status,
          r.created_at,
          r.updated_at
        FROM idol_releases r
        INNER JOIN idol_groups g
          ON g.id = r.group_id
        WHERE r.status IN ('Released', 'Upcoming')
        ORDER BY r.release_date DESC, r.id DESC
        `,
            )
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get all idol releases error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol releases.',
            },
            500,
        )
    }
}

async function getIdolRelease(
    env: Env,
    id: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          r.id,
          r.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          r.title,
          r.type,
          r.release_date,
          r.description,
          r.cover_url,
          r.audio_url,
          r.spotify_url,
          r.youtube_url,
          r.status,
          r.created_at,
          r.updated_at
        FROM idol_releases r
        INNER JOIN idol_groups g
          ON g.id = r.group_id
        WHERE r.id = ?
        `,
            )
                .bind(id)
                .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Idol release not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get idol release error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol release.',
            },
            500,
        )
    }
}

async function createIdolRelease(
    env: Env,
    groupId: number,
    body: IdolReleasePayload,
    image: File | null,
) {
    const validation =
        validateIdolReleasePayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        type,
        release_date,
        description,
        cover_url,
        audio_url,
        spotify_url,
        youtube_url,
        status,
    } = validation.data

    let imageUrl = cover_url
    if (image) imageUrl = await saveProductImage(image)

    try {
        const group =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(groupId)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const result =
            await env.DB.prepare(
                `
        INSERT INTO idol_releases (
          group_id,
          title,
          type,
          release_date,
          description,
          cover_url,
          audio_url,
          spotify_url,
          youtube_url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            )
                .bind(
                    groupId,
                    title,
                    type,
                    release_date,
                    description,
                    imageUrl,
                    audio_url,
                    spotify_url,
                    youtube_url,
                    status,
                )
                .run()

        return json(
            {
                success: true,
                message:
                    'Idol release created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    group_id: groupId,
                    title,
                    type,
                    release_date,
                    description,
                    cover_url: imageUrl,
                    audio_url,
                    spotify_url,
                    youtube_url,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create idol release error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to create idol release.',
            },
            500,
        )
    }
}

async function updateIdolRelease(
    env: Env,
    id: number,
    body: IdolReleasePayload,
    image: File | null,
) {
    const validation =
        validateIdolReleasePayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        type,
        release_date,
        description,
        cover_url,
        audio_url,
        spotify_url,
        youtube_url,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, cover_url
        FROM idol_releases
        WHERE id = ? AND status IN ('Released', 'Upcoming')
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol release not found.',
                },
                404,
            )
        }

        const imageUrl = image
            ? await saveProductImage(image)
            : String(existing.cover_url || '')

        await env.DB.prepare(
            `
      UPDATE idol_releases
      SET
        title = ?,
        type = ?,
        release_date = ?,
        description = ?,
        cover_url = ?,
        audio_url = ?,
        spotify_url = ?,
        youtube_url = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                title,
                type,
                release_date,
                description,
                cover_url,
                audio_url,
                spotify_url,
                youtube_url,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Idol release updated successfully.',
            data: {
                id,
                title,
                type,
                release_date,
                description,
                cover_url,
                audio_url,
                spotify_url,
                youtube_url,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update idol release error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update idol release.',
            },
            500,
        )
    }
}

async function deleteIdolRelease(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_releases
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Idol release not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM idol_releases
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Idol release deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete idol release error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete idol release.',
            },
            500,
        )
    }
}

/* =========================
   IDOL MUSIC VIDEOS
========================= */

interface IdolMusicVideoPayload {
    group_id?: unknown
    release_id?: unknown
    title?: unknown
    description?: unknown
    thumbnail_url?: unknown
    video_url?: unknown
    youtube_url?: unknown
    release_date?: unknown
    status?: unknown
}

const allowedIdolMusicVideoStatuses =
    ['Published', 'Upcoming'] as const

type IdolMusicVideoStatus =
    (typeof allowedIdolMusicVideoStatuses)[number]

function getIdolMusicVideoId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/idol\/music-videos\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateIdolMusicVideoPayload(
    body: IdolMusicVideoPayload,
) {
    const group_id =
        body.group_id !== undefined &&
            body.group_id !== null
            ? Number(body.group_id)
            : NaN

    const release_id =
        body.release_id !== undefined &&
            body.release_id !== null &&
            body.release_id !== ''
            ? Number(body.release_id)
            : null

    const title =
        typeof body.title === 'string'
            ? body.title.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const thumbnail_url =
        typeof body.thumbnail_url === 'string'
            ? body.thumbnail_url.trim()
            : ''

    const video_url =
        typeof body.video_url === 'string'
            ? body.video_url.trim()
            : ''

    const youtube_url =
        typeof body.youtube_url === 'string'
            ? body.youtube_url.trim()
            : ''

    const release_date =
        typeof body.release_date === 'string'
            ? body.release_date.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Upcoming'

    if (
        !Number.isInteger(group_id) ||
        group_id <= 0
    ) {
        return {
            error:
                'Valid group_id is required.',
        }
    }

    if (
        release_id !== null &&
        (!Number.isInteger(release_id) ||
            release_id <= 0)
    ) {
        return {
            error:
                'release_id must be a valid ID.',
        }
    }

    if (!title) {
        return {
            error:
                'Music video title is required.',
        }
    }

    if (
        !allowedIdolMusicVideoStatuses.includes(
            status as IdolMusicVideoStatus,
        )
    ) {
        return {
            error:
                'Music video status must be Published or Upcoming.',
        }
    }

    return {
        data: {
            group_id,
            release_id,
            title,
            description,
            thumbnail_url,
            video_url,
            youtube_url,
            release_date,
            status:
                status as IdolMusicVideoStatus,
        },
    }
}

async function getIdolMusicVideos(
    env: Env,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          v.id,
          v.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          v.release_id,
          r.title AS release_title,
          v.title,
          v.description,
          v.thumbnail_url,
          v.video_url,
          v.youtube_url,
          v.release_date,
          v.status,
          v.created_at,
          v.updated_at
        FROM idol_music_videos v
        INNER JOIN idol_groups g
          ON g.id = v.group_id
        LEFT JOIN idol_releases r
          ON r.id = v.release_id
        WHERE v.status IN ('Published', 'Upcoming')
        ORDER BY v.release_date DESC, v.id DESC
        `,
            )
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol music videos error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol music videos.',
            },
            500,
        )
    }
}

async function getIdolMusicVideo(
    env: Env,
    id: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          v.id,
          v.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          v.release_id,
          r.title AS release_title,
          v.title,
          v.description,
          v.thumbnail_url,
          v.video_url,
          v.youtube_url,
          v.release_date,
          v.status,
          v.created_at,
          v.updated_at
        FROM idol_music_videos v
        INNER JOIN idol_groups g
          ON g.id = v.group_id
        LEFT JOIN idol_releases r
          ON r.id = v.release_id
        WHERE v.id = ? AND v.status IN ('Published', 'Upcoming')
        `,
            )
                .bind(id)
                .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message:
                        'Idol music video not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get idol music video error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol music video.',
            },
            500,
        )
    }
}

async function getIdolMusicVideosByGroup(
    env: Env,
    groupId: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          v.id,
          v.group_id,
          g.name AS group_name,
          v.release_id,
          r.title AS release_title,
          v.title,
          v.description,
          v.thumbnail_url,
          v.video_url,
          v.youtube_url,
          v.release_date,
          v.status,
          v.created_at,
          v.updated_at
        FROM idol_music_videos v
        INNER JOIN idol_groups g
          ON g.id = v.group_id
        LEFT JOIN idol_releases r
          ON r.id = v.release_id
        WHERE v.group_id = ?
        ORDER BY v.release_date DESC, v.id DESC
        `,
            )
                .bind(groupId)
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol group music videos error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch group music videos.',
            },
            500,
        )
    }
}

async function createIdolMusicVideo(
    env: Env,
    body: IdolMusicVideoPayload,
    image: File | null,
) {
    const validation =
        validateIdolMusicVideoPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        group_id,
        release_id,
        title,
        description,
        thumbnail_url,
        video_url,
        youtube_url,
        release_date,
        status,
    } = validation.data

    let imageUrl = thumbnail_url
    if (image) imageUrl = await saveProductImage(image)

    try {
        const group =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(group_id)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        if (release_id !== null) {
            const release =
                await env.DB.prepare(
                    `
          SELECT id, group_id
          FROM idol_releases
          WHERE id = ?
          `,
                )
                    .bind(release_id)
                    .first<{
                        id: number
                        group_id: number
                    }>()

            if (!release) {
                return json(
                    {
                        success: false,
                        message: 'Idol release not found.',
                    },
                    404,
                )
            }

            if (
                Number(release.group_id) !==
                Number(group_id)
            ) {
                return json(
                    {
                        success: false,
                        message:
                            'Release does not belong to the selected idol group.',
                    },
                    400,
                )
            }
        }

        const result =
            await env.DB.prepare(
                `
        INSERT INTO idol_music_videos (
          group_id,
          release_id,
          title,
          description,
          thumbnail_url,
          video_url,
          youtube_url,
          release_date,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            )
                .bind(
                    group_id,
                    release_id,
                    title,
                    description,
                    imageUrl,
                    video_url,
                    youtube_url,
                    release_date,
                    status,
                )
                .run()

        return json(
            {
                success: true,
                message:
                    'Idol music video created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    group_id,
                    release_id,
                    title,
                    description,
                    thumbnail_url: imageUrl,
                    video_url,
                    youtube_url,
                    release_date,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create idol music video error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to create idol music video.',
            },
            500,
        )
    }
}

async function updateIdolMusicVideo(
    env: Env,
    id: number,
    body: IdolMusicVideoPayload,
    image: File | null,
) {
    const validation =
        validateIdolMusicVideoPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        group_id,
        release_id,
        title,
        description,
        thumbnail_url,
        video_url,
        youtube_url,
        release_date,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, thumbnail_url
        FROM idol_music_videos
        WHERE id = ? AND status IN ('Published', 'Upcoming')
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message:
                        'Idol music video not found.',
                },
                404,
            )
        }

        const group =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(group_id)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        if (release_id !== null) {
            const release =
                await env.DB.prepare(
                    `
          SELECT id, group_id
          FROM idol_releases
          WHERE id = ?
          `,
                )
                    .bind(release_id)
                    .first<{
                        id: number
                        group_id: number
                    }>()

            if (!release) {
                return json(
                    {
                        success: false,
                        message: 'Idol release not found.',
                    },
                    404,
                )
            }

            if (
                Number(release.group_id) !==
                Number(group_id)
            ) {
                return json(
                    {
                        success: false,
                        message:
                            'Release does not belong to the selected idol group.',
                    },
                    400,
                )
            }
        }

        const imageUrl = image
            ? await saveProductImage(image)
            : String(existing.thumbnail_url || '')

        await env.DB.prepare(
            `
      UPDATE idol_music_videos
      SET
        group_id = ?,
        release_id = ?,
        title = ?,
        description = ?,
        thumbnail_url = ?,
        video_url = ?,
        youtube_url = ?,
        release_date = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                group_id,
                release_id,
                title,
                description,
                thumbnail_url,
                video_url,
                youtube_url,
                release_date,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Idol music video updated successfully.',
            data: {
                id,
                group_id,
                release_id,
                title,
                description,
                thumbnail_url,
                video_url,
                youtube_url,
                release_date,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update idol music video error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update idol music video.',
            },
            500,
        )
    }
}

async function deleteIdolMusicVideo(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_music_videos
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message:
                        'Idol music video not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM idol_music_videos
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Idol music video deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete idol music video error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete idol music video.',
            },
            500,
        )
    }
}

/* =========================
   IDOL ACTIVITIES / EVENTS
========================= */

interface IdolActivityPayload {
    title?: unknown
    type?: unknown
    date?: unknown
    location?: unknown
    description?: unknown
    image_url?: unknown
    status?: unknown
}

const allowedIdolActivityTypes = [
    'Concert',
    'Fan Meeting',
    'Event',
    'Schedule',
] as const

type IdolActivityType =
    (typeof allowedIdolActivityTypes)[number]

const allowedIdolActivityStatuses = [
    'Upcoming',
    'Completed',
    'Cancelled',
] as const

type IdolActivityStatus =
    (typeof allowedIdolActivityStatuses)[number]

function getIdolActivityId(
    pathname: string,
) {
    const match = pathname.match(
        /^\/api\/idol\/activities\/(\d+)$/,
    )

    return match
        ? Number(match[1])
        : null
}

function validateIdolActivityPayload(
    body: IdolActivityPayload,
) {
    const title =
        typeof body.title === 'string'
            ? body.title.trim()
            : ''

    const type =
        typeof body.type === 'string'
            ? body.type
            : 'Event'

    const date =
        typeof body.date === 'string'
            ? body.date.trim()
            : ''

    const location =
        typeof body.location === 'string'
            ? body.location.trim()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const image_url =
        typeof body.image_url === 'string'
            ? body.image_url.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Upcoming'

    if (!title) {
        return {
            error: 'Activity title is required.',
        }
    }

    if (!date) {
        return {
            error: 'Activity date is required.',
        }
    }

    if (
        !allowedIdolActivityTypes.includes(
            type as IdolActivityType,
        )
    ) {
        return {
            error:
                'Activity type must be Concert, Fan Meeting, Event, or Schedule.',
        }
    }

    if (
        !allowedIdolActivityStatuses.includes(
            status as IdolActivityStatus,
        )
    ) {
        return {
            error:
                'Activity status must be Upcoming, Completed, or Cancelled.',
        }
    }

    return {
        data: {
            title,
            type: type as IdolActivityType,
            date,
            location,
            description,
            image_url,
            status: status as IdolActivityStatus,
        },
    }
}

async function getIdolActivities(
    env: Env,
    groupId: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          a.id,
          a.group_id,
          g.name AS group_name,
          a.title,
          a.type,
          a.date,
          a.location,
          a.description,
          a.image_url,
          a.status,
          a.created_at,
          a.updated_at
        FROM idol_activities a
        INNER JOIN idol_groups g
          ON g.id = a.group_id
        WHERE a.group_id = ? AND a.status IN ('Upcoming', 'Completed')
        ORDER BY a.date ASC, a.id ASC
        `,
            )
                .bind(groupId)
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get idol activities error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol activities.',
            },
            500,
        )
    }
}

async function getAllIdolActivities(
    env: Env,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          a.id,
          a.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          a.title,
          a.type,
          a.date,
          a.location,
          a.description,
          a.image_url,
          a.status,
          a.created_at,
          a.updated_at
        FROM idol_activities a
        INNER JOIN idol_groups g
          ON g.id = a.group_id
        WHERE a.status IN ('Upcoming', 'Completed')
        ORDER BY a.date ASC, a.id ASC
        `,
            )
                .all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error(
            'Get all idol activities error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol activities.',
            },
            500,
        )
    }
}

async function getIdolActivity(
    env: Env,
    id: number,
) {
    try {
        const result =
            await env.DB.prepare(
                `
        SELECT
          a.id,
          a.group_id,
          g.name AS group_name,
          g.image_url AS group_image_url,
          a.title,
          a.type,
          a.date,
          a.location,
          a.description,
          a.image_url,
          a.status,
          a.created_at,
          a.updated_at
        FROM idol_activities a
        INNER JOIN idol_groups g
          ON g.id = a.group_id
        WHERE a.id = ? AND a.status IN ('Upcoming', 'Completed')
        `,
            )
                .bind(id)
                .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message:
                        'Idol activity not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(
            'Get idol activity error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to fetch idol activity.',
            },
            500,
        )
    }
}

async function createIdolActivity(
    env: Env,
    groupId: number,
    body: IdolActivityPayload,
    image: File | null,
) {
    const validation =
        validateIdolActivityPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        type,
        date,
        location,
        description,
        image_url,
        status,
    } = validation.data

    let imageUrl = image_url
    if (image) imageUrl = await saveProductImage(image)

    try {
        const group =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_groups
        WHERE id = ?
        `,
            )
                .bind(groupId)
                .first()

        if (!group) {
            return json(
                {
                    success: false,
                    message: 'Idol group not found.',
                },
                404,
            )
        }

        const result =
            await env.DB.prepare(
                `
        INSERT INTO idol_activities (
          group_id,
          title,
          type,
          date,
          location,
          description,
          image_url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
            )
                .bind(
                    groupId,
                    title,
                    type,
                    date,
                    location,
                    description,
                    imageUrl,
                    status,
                )
                .run()

        return json(
            {
                success: true,
                message:
                    'Idol activity created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    group_id: groupId,
                    title,
                    type,
                    date,
                    location,
                    description,
                    image_url: imageUrl,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error(
            'Create idol activity error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to create idol activity.',
            },
            500,
        )
    }
}

async function updateIdolActivity(
    env: Env,
    id: number,
    body: IdolActivityPayload,
    image: File | null,
) {
    const validation =
        validateIdolActivityPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        type,
        date,
        location,
        description,
        image_url,
        status,
    } = validation.data

    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id, image_url
        FROM idol_activities
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message:
                        'Idol activity not found.',
                },
                404,
            )
        }

        const imageUrl = image
            ? await saveProductImage(image)
            : String(existing.image_url || '')

        await env.DB.prepare(
            `
      UPDATE idol_activities
      SET
        title = ?,
        type = ?,
        date = ?,
        location = ?,
        description = ?,
        image_url = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
        )
            .bind(
                title,
                type,
                date,
                location,
                description,
                imageUrl,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Idol activity updated successfully.',
            data: {
                id,
                title,
                type,
                date,
                location,
                description,
                imageUrl,
                status,
            },
        })
    } catch (error) {
        console.error(
            'Update idol activity error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to update idol activity.',
            },
            500,
        )
    }
}

async function deleteIdolActivity(
    env: Env,
    id: number,
) {
    try {
        const existing =
            await env.DB.prepare(
                `
        SELECT id
        FROM idol_activities
        WHERE id = ?
        `,
            )
                .bind(id)
                .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message:
                        'Idol activity not found.',
                },
                404,
            )
        }

        await env.DB.prepare(
            `
      DELETE FROM idol_activities
      WHERE id = ?
      `,
        )
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Idol activity deleted successfully.',
        })
    } catch (error) {
        console.error(
            'Delete idol activity error:',
            error,
        )

        return json(
            {
                success: false,
                message:
                    'Failed to delete idol activity.',
            },
            500,
        )
    }
}



/* =========================
   PROMOTIONS
========================= */

interface PromotionPayload {
    title?: unknown
    code?: unknown
    description?: unknown
    discount_type?: unknown
    discount_value?: unknown
    target_type?: unknown
    product_id?: unknown
    service_id?: unknown
    start_date?: unknown
    end_date?: unknown
    status?: unknown
}

const allowedPromotionDiscountTypes =
    ['Percentage', 'Fixed'] as const

const allowedPromotionTargetTypes =
    ['Product', 'Service'] as const

const allowedPromotionStatuses =
    ['Active', 'Scheduled', 'Expired', 'Draft'] as const

type PromotionDiscountType =
    (typeof allowedPromotionDiscountTypes)[number]

type PromotionTargetType =
    (typeof allowedPromotionTargetTypes)[number]

type PromotionStatus =
    (typeof allowedPromotionStatuses)[number]

function getPromotionId(pathname: string) {
    const match = pathname.match(
        /^\/api\/promotions\/(\d+)$/,
    )

    if (!match) return null

    const id = Number(match[1])

    return Number.isInteger(id) && id > 0
        ? id
        : null
}

function validatePromotionPayload(
    body: PromotionPayload,
) {
    const title =
        typeof body.title === 'string'
            ? body.title.trim()
            : ''

    const code =
        typeof body.code === 'string'
            ? body.code.trim().toUpperCase()
            : ''

    const description =
        typeof body.description === 'string'
            ? body.description.trim()
            : ''

    const discount_type =
        typeof body.discount_type === 'string'
            ? body.discount_type
            : 'Percentage'

    const discount_value =
        typeof body.discount_value === 'number'
            ? body.discount_value
            : Number(body.discount_value)

    const target_type =
        typeof body.target_type === 'string'
            ? body.target_type
            : ''

    const product_id =
        body.product_id === null ||
            body.product_id === undefined ||
            body.product_id === ''
            ? null
            : Number(body.product_id)

    const service_id =
        body.service_id === null ||
            body.service_id === undefined ||
            body.service_id === ''
            ? null
            : Number(body.service_id)

    const start_date =
        typeof body.start_date === 'string'
            ? body.start_date.trim()
            : ''

    const end_date =
        typeof body.end_date === 'string'
            ? body.end_date.trim()
            : ''

    const status =
        typeof body.status === 'string'
            ? body.status
            : 'Draft'

    if (!title) {
        return { error: 'Promotion title is required.' }
    }

    if (!code) {
        return { error: 'Promotion code is required.' }
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
        return {
            error:
                'Promotion code may only contain A-Z, 0-9, underscore, and hyphen.',
        }
    }

    if (!description) {
        return {
            error: 'Promotion description is required.',
        }
    }

    if (
        !Number.isFinite(discount_value) ||
        discount_value <= 0 ||
        !Number.isInteger(discount_value)
    ) {
        return {
            error:
                'Discount value must be a valid positive integer.',
        }
    }

    if (
        !allowedPromotionDiscountTypes.includes(
            discount_type as PromotionDiscountType,
        )
    ) {
        return {
            error:
                'Discount type must be Percentage or Fixed.',
        }
    }

    if (
        discount_type === 'Percentage' &&
        discount_value > 100
    ) {
        return {
            error:
                'Percentage discount cannot exceed 100.',
        }
    }

    if (
        !allowedPromotionTargetTypes.includes(
            target_type as PromotionTargetType,
        )
    ) {
        return {
            error:
                'Promotion target must be Product or Service.',
        }
    }

    if (!start_date) {
        return { error: 'Promotion start date is required.' }
    }

    if (!end_date) {
        return { error: 'Promotion end date is required.' }
    }

    if (end_date < start_date) {
        return {
            error:
                'Promotion end date cannot be before start date.',
        }
    }

    if (
        !allowedPromotionStatuses.includes(
            status as PromotionStatus,
        )
    ) {
        return { error: 'Invalid promotion status.' }
    }

    if (target_type === 'Product') {
        if (
            product_id === null ||
            !Number.isInteger(product_id) ||
            product_id <= 0
        ) {
            return {
                error: 'A valid product must be selected.',
            }
        }

        if (service_id !== null) {
            return {
                error:
                    'Product promotion cannot contain service_id.',
            }
        }
    }

    if (target_type === 'Service') {
        if (
            service_id === null ||
            !Number.isInteger(service_id) ||
            service_id <= 0
        ) {
            return {
                error: 'A valid service must be selected.',
            }
        }

        if (product_id !== null) {
            return {
                error:
                    'Service promotion cannot contain product_id.',
            }
        }
    }

    return {
        data: {
            title,
            code,
            description,
            discount_type,
            discount_value,
            target_type,
            product_id,
            service_id,
            start_date,
            end_date,
            status,
        },
    }
}

async function getPromotions(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        p.id,
        p.title,
        p.code,
        p.description,
        p.discount_type,
        p.discount_value,
        p.target_type,
        p.product_id,
        p.service_id,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at,
        p.updated_at,
        products.name AS product_name,
        services.name AS service_name
      FROM promotions p
      LEFT JOIN products
        ON products.id = p.product_id
      LEFT JOIN services
        ON services.id = p.service_id
      WHERE p.status <> 'Draft'
      ORDER BY p.id DESC
    `).all()

        return json({
            success: true,
            data: result.results,
        })
    } catch (error) {
        console.error('Get promotions error:', error)

        return json(
            {
                success: false,
                message: 'Failed to fetch promotions.',
            },
            500,
        )
    }
}

async function getPromotion(
    env: Env,
    id: number,
) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        p.id,
        p.title,
        p.code,
        p.description,
        p.discount_type,
        p.discount_value,
        p.target_type,
        p.product_id,
        p.service_id,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at,
        p.updated_at,
        products.name AS product_name,
        services.name AS service_name
      FROM promotions p
      LEFT JOIN products
        ON products.id = p.product_id
      LEFT JOIN services
        ON services.id = p.service_id
      WHERE p.id = ? AND p.status <> 'Draft'
    `)
            .bind(id)
            .first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Promotion not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Get promotion error:', error)

        return json(
            {
                success: false,
                message: 'Failed to fetch promotion.',
            },
            500,
        )
    }
}

async function validatePromotionTarget(
    env: Env,
    target_type: string,
    product_id: number | null,
    service_id: number | null,
) {
    if (target_type === 'Product') {
        const product = await env.DB.prepare(`
      SELECT id, name, status
      FROM products
      WHERE id = ?
    `)
            .bind(product_id)
            .first<{
                id: number
                name: string
                status: string
            }>()

        if (!product) {
            return {
                error: 'Selected product not found.',
                status: 404,
            }
        }

        if (product.status !== 'Published') {
            return {
                error:
                    'Only published products can receive promotions.',
                status: 400,
            }
        }
    }

    if (target_type === 'Service') {
        const service = await env.DB.prepare(`
      SELECT id, name, status
      FROM services
      WHERE id = ?
    `)
            .bind(service_id)
            .first<{
                id: number
                name: string
                status: string
            }>()

        if (!service) {
            return {
                error: 'Selected service not found.',
                status: 404,
            }
        }

        if (service.status !== 'Active') {
            return {
                error:
                    'Only active services can receive promotions.',
                status: 400,
            }
        }
    }

    return null
}

async function createPromotion(
    env: Env,
    body: PromotionPayload,
) {
    const validation =
        validatePromotionPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        code,
        description,
        discount_type,
        discount_value,
        target_type,
        product_id,
        service_id,
        start_date,
        end_date,
        status,
    } = validation.data

    try {
        const existing = await env.DB.prepare(`
      SELECT id
      FROM promotions
      WHERE code = ?
    `)
            .bind(code)
            .first()

        if (existing) {
            return json(
                {
                    success: false,
                    message: 'Promotion code already exists.',
                },
                409,
            )
        }

        const targetError =
            await validatePromotionTarget(
                env,
                target_type,
                product_id,
                service_id,
            )

        if (targetError) {
            return json(
                {
                    success: false,
                    message: targetError.error,
                },
                targetError.status,
            )
        }

        const result = await env.DB.prepare(`
      INSERT INTO promotions (
        title,
        code,
        description,
        discount_type,
        discount_value,
        target_type,
        product_id,
        service_id,
        start_date,
        end_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
            .bind(
                title,
                code,
                description,
                discount_type,
                discount_value,
                target_type,
                product_id,
                service_id,
                start_date,
                end_date,
                status,
            )
            .run()

        return json(
            {
                success: true,
                message:
                    'Promotion created successfully.',
                data: {
                    id: result.meta.last_row_id,
                    title,
                    code,
                    description,
                    discount_type,
                    discount_value,
                    target_type,
                    product_id,
                    service_id,
                    start_date,
                    end_date,
                    status,
                },
            },
            201,
        )
    } catch (error) {
        console.error('Create promotion error:', error)

        return json(
            {
                success: false,
                message: 'Failed to create promotion.',
            },
            500,
        )
    }
}

async function updatePromotion(
    env: Env,
    id: number,
    body: PromotionPayload,
) {
    const validation =
        validatePromotionPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        title,
        code,
        description,
        discount_type,
        discount_value,
        target_type,
        product_id,
        service_id,
        start_date,
        end_date,
        status,
    } = validation.data

    try {
        const existing = await env.DB.prepare(`
      SELECT id
      FROM promotions
      WHERE id = ?
    `)
            .bind(id)
            .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Promotion not found.',
                },
                404,
            )
        }

        const duplicate = await env.DB.prepare(`
      SELECT id
      FROM promotions
      WHERE code = ?
        AND id != ?
    `)
            .bind(code, id)
            .first()

        if (duplicate) {
            return json(
                {
                    success: false,
                    message: 'Promotion code already exists.',
                },
                409,
            )
        }

        const targetError =
            await validatePromotionTarget(
                env,
                target_type,
                product_id,
                service_id,
            )

        if (targetError) {
            return json(
                {
                    success: false,
                    message: targetError.error,
                },
                targetError.status,
            )
        }

        await env.DB.prepare(`
      UPDATE promotions
      SET
        title = ?,
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        target_type = ?,
        product_id = ?,
        service_id = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
            .bind(
                title,
                code,
                description,
                discount_type,
                discount_value,
                target_type,
                product_id,
                service_id,
                start_date,
                end_date,
                status,
                id,
            )
            .run()

        return json({
            success: true,
            message:
                'Promotion updated successfully.',
            data: {
                id,
                title,
                code,
                description,
                discount_type,
                discount_value,
                target_type,
                product_id,
                service_id,
                start_date,
                end_date,
                status,
            },
        })
    } catch (error) {
        console.error('Update promotion error:', error)

        return json(
            {
                success: false,
                message: 'Failed to update promotion.',
            },
            500,
        )
    }
}

async function deletePromotion(
    env: Env,
    id: number,
) {
    try {
        const existing = await env.DB.prepare(`
      SELECT id
      FROM promotions
      WHERE id = ?
    `)
            .bind(id)
            .first()

        if (!existing) {
            return json(
                {
                    success: false,
                    message: 'Promotion not found.',
                },
                404,
            )
        }

        await env.DB.prepare(`
      DELETE FROM promotions
      WHERE id = ?
    `)
            .bind(id)
            .run()

        return json({
            success: true,
            message:
                'Promotion deleted successfully.',
        })
    } catch (error) {
        console.error('Delete promotion error:', error)

        return json(
            {
                success: false,
                message: 'Failed to delete promotion.',
            },
            500,
        )
    }
}

/* =========================
   NEWS
========================= */

interface NewsPayload {
    title?: unknown
    category?: unknown
    author?: unknown
    excerpt?: unknown
    content?: unknown
    date?: unknown
    status?: unknown
    image_url?: unknown
}

const allowedNewsStatuses = ['Published', 'Draft'] as const
type NewsStatus = (typeof allowedNewsStatuses)[number]

function getNewsId(pathname: string): number | null {
    const match = pathname.match(/^\/api\/news\/(\d+)$/)
    if (!match) return null

    const id = Number(match[1])
    return Number.isInteger(id) && id > 0 ? id : null
}

function validateNewsPayload(body: NewsPayload) {
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const category = typeof body.category === 'string' && body.category.trim()
        ? body.category.trim()
        : 'Company'
    const author = typeof body.author === 'string' && body.author.trim()
        ? body.author.trim()
        : 'Admin'
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const date = typeof body.date === 'string' ? body.date.trim() : ''
    const status = typeof body.status === 'string' && allowedNewsStatuses.includes(body.status as NewsStatus)
        ? body.status as NewsStatus
        : 'Published'
    const image_url = typeof body.image_url === 'string' ? body.image_url.trim() : ''

    if (!title) return { error: 'News title is required.' }
    if (!excerpt) return { error: 'Excerpt is required.' }
    if (!content) return { error: 'Content is required.' }
    if (!date) return { error: 'Publication date is required.' }

    return {
        data: {
            title,
            category,
            author,
            excerpt,
            content,
            date,
            status,
            image_url,
        },
    }
}

async function getNews(env: Env, includeDraft = false) {
    const result = await env.DB.prepare(`
    SELECT
      id,
      title,
      category,
      author,
      excerpt,
      content,
      date,
      status,
      image_url,
      created_at,
      updated_at
    FROM news
    WHERE status = 'Published'
    ORDER BY date DESC, id DESC
  `).all()

    return result.results
}

async function getNewsItem(env: Env, id: number) {
    return await env.DB.prepare(`
    SELECT
      id,
      title,
      category,
      author,
      excerpt,
      content,
      date,
      status,
      image_url,
      created_at,
      updated_at
    FROM news
    WHERE id = ? AND status = 'Published'
    LIMIT 1
  `).bind(id).first()
}

async function createNews(env: Env, body: NewsPayload, image: File | null) {
    const validation = validateNewsPayload(body)

    if ('error' in validation) {
        return json({ success: false, message: validation.error }, 400)
    }

    const data = validation.data

    try {
        const result = await env.DB.prepare(`
      INSERT INTO news (
        title,
        category,
        author,
        excerpt,
        content,
        date,
        status,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            data.title,
            data.category,
            data.author,
            data.excerpt,
            data.content,
            data.date,
            data.status,
            data.image_url,
        ).run()

        const createdId = Number(result.meta.last_row_id)
        if (image) {
            try {
                const imageUrl = await saveProductImage(image)
                await env.DB.prepare(`UPDATE news SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(imageUrl, createdId).run()
            } catch (imageError) {
                await env.DB.prepare(`DELETE FROM news WHERE id = ?`).bind(createdId).run()
                throw imageError
            }
        }

        const createdNews = await getNewsItem(env, Number(result.meta.last_row_id))

        return json({
            success: true,
            message: 'News created successfully.',
            data: createdNews,
        }, 201)
    } catch (error) {
        console.error('Create news error:', error)
        return json({
            success: false,
            message: 'Failed to create news.',
        }, 500)
    }
}

async function updateNews(env: Env, id: number, body: NewsPayload, image: File | null) {
    const existingNews = await getNewsItem(env, id)

    if (!existingNews) {
        return json({ success: false, message: 'News not found.' }, 404)
    }

    const validation = validateNewsPayload(body)

    if ('error' in validation) {
        return json({ success: false, message: validation.error }, 400)
    }

    const data = validation.data

    try {
        const current = await getNewsItem(env, id) as Record<string, unknown> | null
        let imageUrl = String(current?.image_url || data.image_url || '')
        if (image) {
            imageUrl = await saveProductImage(image)
        }

        await env.DB.prepare(`
      UPDATE news
      SET
        title = ?,
        category = ?,
        author = ?,
        excerpt = ?,
        content = ?,
        date = ?,
        status = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
            data.title,
            data.category,
            data.author,
            data.excerpt,
            data.content,
            data.date,
            data.status,
            imageUrl,
            id,
        ).run()

        const updatedNews = await getNewsItem(env, id)

        return json({
            success: true,
            message: 'News updated successfully.',
            data: updatedNews,
        })
    } catch (error) {
        console.error('Update news error:', error)
        return json({
            success: false,
            message: 'Failed to update news.',
        }, 500)
    }
}

async function deleteNews(env: Env, id: number) {
    const existingNews = await getNewsItem(env, id)

    if (!existingNews) {
        return json({ success: false, message: 'News not found.' }, 404)
    }

    try {
        await env.DB.prepare(`
      DELETE FROM news
      WHERE id = ?
    `).bind(id).run()

        return json({
            success: true,
            message: 'News deleted successfully.',
        })
    } catch (error) {
        console.error('Delete news error:', error)
        return json({
            success: false,
            message: 'Failed to delete news.',
        }, 500)
    }
}

async function parsePortfolioRequest(request: Request) {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const image = formData.get('image')
        return {
            body: {
                title: formData.get('title'),
                category: formData.get('category'),
                client: formData.get('client'),
                description: formData.get('description'),
                year: formData.get('year'),
                status: formData.get('status'),
                image_url: formData.get('image_url'),
            } satisfies PortfolioPayload,
            image: image instanceof File && image.size > 0 ? image : null,
        }
    }
    return { body: await request.json<PortfolioPayload>(), image: null }
}

async function parseNewsRequest(request: Request) {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const image = formData.get('image')
        return {
            body: {
                title: formData.get('title'),
                category: formData.get('category'),
                author: formData.get('author'),
                excerpt: formData.get('excerpt'),
                content: formData.get('content'),
                date: formData.get('date'),
                status: formData.get('status'),
                image_url: formData.get('image_url'),
            } satisfies NewsPayload,
            image: image instanceof File && image.size > 0 ? image : null,
        }
    }
    return { body: await request.json<NewsPayload>(), image: null }
}

/* =========================
   SETTINGS
========================= */

interface SiteSettingsPayload {
    site_name?: unknown
    admin_name?: unknown
    admin_email?: unknown
    notifications_enabled?: unknown
}

function validateSiteSettingsPayload(
    body: SiteSettingsPayload,
) {
    const site_name =
        typeof body.site_name === 'string'
            ? body.site_name.trim()
            : ''

    const admin_name =
        typeof body.admin_name === 'string'
            ? body.admin_name.trim()
            : ''

    const admin_email =
        typeof body.admin_email === 'string'
            ? body.admin_email.trim()
            : ''

    const notifications_enabled =
        body.notifications_enabled === true ||
        body.notifications_enabled === 1 ||
        body.notifications_enabled === 'true' ||
        body.notifications_enabled === '1'

    if (!site_name) {
        return { error: 'Website name is required.' }
    }

    if (!admin_name) {
        return { error: 'Admin name is required.' }
    }

    if (!admin_email) {
        return { error: 'Admin email is required.' }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin_email)) {
        return {
            error: 'Please enter a valid admin email address.',
        }
    }

    return {
        data: {
            site_name,
            admin_name,
            admin_email,
            notifications_enabled,
        },
    }
}

async function getSiteSettings(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        id,
        site_name,
        admin_name,
        admin_email,
        notifications_enabled,
        updated_at
      FROM site_settings
      WHERE id = 1
      LIMIT 1
    `).first()

        if (!result) {
            return json(
                {
                    success: false,
                    message: 'Site settings not found.',
                },
                404,
            )
        }

        return json({
            success: true,
            data: {
                ...result,
                notifications_enabled: Boolean(
                    Number(result.notifications_enabled),
                ),
            },
        })
    } catch (error) {
        console.error('Get site settings error:', error)

        return json(
            {
                success: false,
                message: 'Failed to fetch site settings.',
            },
            500,
        )
    }
}

async function updateSiteSettings(
    env: Env,
    body: SiteSettingsPayload,
    adminUserId?: number,
) {
    const validation = validateSiteSettingsPayload(body)

    if ('error' in validation) {
        return json(
            {
                success: false,
                message: validation.error,
            },
            400,
        )
    }

    const {
        site_name,
        admin_name,
        admin_email,
        notifications_enabled,
    } = validation.data

    try {
        const existing = await env.DB.prepare(`
      SELECT id
      FROM site_settings
      WHERE id = 1
      LIMIT 1
    `).first()

        if (!existing) {
            await env.DB.prepare(`
        INSERT INTO site_settings (
          id,
          site_name,
          admin_name,
          admin_email,
          notifications_enabled
        )
        VALUES (1, ?, ?, ?, ?)
      `)
                .bind(
                    site_name,
                    admin_name,
                    admin_email,
                    notifications_enabled ? 1 : 0,
                )
                .run()
        } else {
            await env.DB.prepare(`
        UPDATE site_settings
        SET
          site_name = ?,
          admin_name = ?,
          admin_email = ?,
          notifications_enabled = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `)
                .bind(
                    site_name,
                    admin_name,
                    admin_email,
                    notifications_enabled ? 1 : 0,
                )
                .run()
        }

        if (adminUserId) {
            await env.DB.prepare(`
        UPDATE admin_users
        SET
          name = ?,
          email = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
                .bind(
                    admin_name,
                    admin_email.toLowerCase(),
                    adminUserId,
                )
                .run()
        }

        const updated = await env.DB.prepare(`
      SELECT
        id,
        site_name,
        admin_name,
        admin_email,
        notifications_enabled,
        updated_at
      FROM site_settings
      WHERE id = 1
      LIMIT 1
    `).first()

        return json({
            success: true,
            message: 'Site settings updated successfully.',
            data: {
                ...updated,
                notifications_enabled: Boolean(
                    Number(updated?.notifications_enabled),
                ),
            },
        })
    } catch (error) {
        console.error('Update site settings error:', error)

        return json(
            {
                success: false,
                message: 'Failed to update site settings.',
            },
            500,
        )
    }
}


/* =====================================================
   39PRODUCTION BUSINESS SYSTEM
   Members / Projects / Finance / Revenue Sharing /
   Documents / Audit Logs
===================================================== */

type BusinessMemberRole = 'Founder' | 'Co-Founder' | 'Team' | 'Talent'
type BusinessMemberStatus = 'Active' | 'Inactive'
type BusinessProjectStatus = 'Planning' | 'In Progress' | 'Revision' | 'Ready for Final Payment' | 'Completed' | 'Cancelled'
type BusinessTransactionType = 'Revenue' | 'Expense'
type BusinessTransactionStatus = 'Completed' | 'Pending' | 'Cancelled'
type BusinessDistributionStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Paid'
type BusinessDocumentType = 'Invoice' | 'Receipt' | 'Order Confirmation' | 'Project Proposal' | 'Quotation' | 'Project Brief' | 'Scope of Work' | 'Agreement' | 'Contract' | 'NDA' | 'Berita Acara' | 'Project Completion' | 'Handover' | 'Maintenance Agreement' | 'Project Statement'
type BusinessDocumentStatus = 'Draft' | 'Final'

/**
 * Ensures the business-system tables exist in the SAME D1 database
 * bound to env.DB. This is intentionally idempotent.
 */
async function ensureBusinessSchema(env: Env) {
    await env.DB.batch([
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS business_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Team',
        position TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Active',
        joined_at TEXT NOT NULL DEFAULT CURRENT_DATE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS business_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        customer TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Planning',
        deadline TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Custom',
        order_id INTEGER,
        revenue INTEGER NOT NULL DEFAULT 0,
        project_cost INTEGER NOT NULL DEFAULT 0,
        net_profit INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        contribution_percentage REAL NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, member_id),
        FOREIGN KEY (project_id) REFERENCES business_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES business_members(id) ON DELETE CASCADE
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS revenue_sharings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        reserve_percentage REAL NOT NULL DEFAULT 20,
        status TEXT NOT NULL DEFAULT 'Draft',
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES business_projects(id) ON DELETE CASCADE
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS revenue_sharing_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distribution_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        percentage REAL NOT NULL DEFAULT 0,
        amount INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(distribution_id, member_id),
        FOREIGN KEY (distribution_id) REFERENCES revenue_sharings(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES business_members(id) ON DELETE CASCADE
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS project_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Operational',
        amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Completed',
        finance_transaction_id INTEGER,
        created_by INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES business_projects(id) ON DELETE CASCADE
      )
    `),
        env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS business_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        document_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        file_url TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES business_projects(id) ON DELETE SET NULL
      )
    `),
    ])
}

interface BusinessMemberPayload { name?: unknown; role?: unknown; position?: unknown; email?: unknown; status?: unknown }
interface BusinessProjectPayload { name?: unknown; customer?: unknown; value?: unknown; deadline?: unknown; status?: unknown; type?: unknown; member_ids?: unknown; contributions?: unknown }
interface BusinessTransactionPayload { description?: unknown; category?: unknown; type?: unknown; amount?: unknown; date?: unknown; status?: unknown; project_id?: unknown; payment_reference?: unknown }
interface BusinessDistributionPayload { project_id?: unknown; reserve_percentage?: unknown; members?: unknown }
interface BusinessDocumentPayload { type?: unknown; title?: unknown; project_id?: unknown; related_to?: unknown; status?: unknown; content?: unknown }

function businessId(pathname: string, pattern: RegExp) {
    const match = pathname.match(pattern)
    return match ? Number(match[1]) : null
}

function businessText(value: unknown, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback
}

function businessNumber(value: unknown, fallback = 0) {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

async function audit(env: Env, actorId: number, action: string, module: string, entityType: string, entityId: string | number | null, before: unknown, after: unknown, level = 'Info', description = '') {
    try {
        await env.DB.prepare(`
      INSERT INTO audit_logs (actor_id, action, module, entity_type, entity_id, level, description, before_json, after_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            actorId,
            action,
            module,
            entityType,
            entityId === null ? null : String(entityId),
            level,
            description || action,
            before == null ? null : JSON.stringify(before),
            after == null ? null : JSON.stringify(after),
        ).run()
    } catch (error) {
        console.error('Audit write error:', error)
    }
}

async function getBusinessMembers(env: Env) {
    const result = await env.DB.prepare(`SELECT id,name,role,position,email,status,joined_at AS joinedAt,created_at,updated_at FROM business_members ORDER BY id DESC`).all()
    return json({ success: true, data: result.results })
}

async function createBusinessMember(env: Env, body: BusinessMemberPayload, actorId: number) {
    const name = businessText(body.name)
    const role = businessText(body.role, 'Team') as BusinessMemberRole
    const position = businessText(body.position)
    const email = businessText(body.email).toLowerCase()
    const status = businessText(body.status, 'Active') as BusinessMemberStatus
    if (!name || !position || !email) return json({ success: false, message: 'Name, position, and email are required.' }, 400)
    if (!['Founder', 'Co-Founder', 'Team', 'Talent'].includes(role)) return json({ success: false, message: 'Invalid member role.' }, 400)
    if (!['Active', 'Inactive'].includes(status)) return json({ success: false, message: 'Invalid member status.' }, 400)
    const duplicate = await env.DB.prepare(`SELECT id FROM business_members WHERE lower(email)=? LIMIT 1`).bind(email).first()
    if (duplicate) return json({ success: false, message: 'Member email already exists.' }, 409)
    const result = await env.DB.prepare(`INSERT INTO business_members(name,role,position,email,status,joined_at) VALUES(?,?,?,?,?,CURRENT_DATE)`).bind(name, role, position, email, status).run()
    const id = result.meta.last_row_id
    const created = await env.DB.prepare(`SELECT id,name,role,position,email,status,joined_at AS joinedAt FROM business_members WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'CREATE_MEMBER', 'Members', 'member', id, null, created, 'Info', 'Created business member.')
    return json({ success: true, message: 'Member created successfully.', data: created }, 201)
}

async function updateBusinessMember(env: Env, id: number, body: BusinessMemberPayload, actorId: number) {
    const before = await env.DB.prepare(`SELECT id,name,role,position,email,status,joined_at AS joinedAt FROM business_members WHERE id=?`).bind(id).first()
    if (!before) return json({ success: false, message: 'Member not found.' }, 404)
    const name = businessText(body.name, String((before as any).name))
    const role = businessText(body.role, String((before as any).role)) as BusinessMemberRole
    const position = businessText(body.position, String((before as any).position))
    const email = businessText(body.email, String((before as any).email)).toLowerCase()
    const status = businessText(body.status, String((before as any).status)) as BusinessMemberStatus
    if (!['Founder', 'Co-Founder', 'Team', 'Talent'].includes(role) || !['Active', 'Inactive'].includes(status)) return json({ success: false, message: 'Invalid member data.' }, 400)
    const duplicate = await env.DB.prepare(`SELECT id FROM business_members WHERE lower(email)=? AND id<>? LIMIT 1`).bind(email, id).first()
    if (duplicate) return json({ success: false, message: 'Member email already exists.' }, 409)
    await env.DB.prepare(`UPDATE business_members SET name=?,role=?,position=?,email=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(name, role, position, email, status, id).run()
    const after = await env.DB.prepare(`SELECT id,name,role,position,email,status,joined_at AS joinedAt FROM business_members WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'UPDATE_MEMBER', 'Members', 'member', id, before, after, 'Info', 'Updated business member.')
    return json({ success: true, message: 'Member updated successfully.', data: after })
}

async function deleteBusinessMember(env: Env, id: number, actorId: number) {
    const before = await env.DB.prepare(`SELECT id,name,role,position,email,status FROM business_members WHERE id=?`).bind(id).first()
    if (!before) return json({ success: false, message: 'Member not found.' }, 404)
    const used = await env.DB.prepare(`SELECT id FROM project_members WHERE member_id=? LIMIT 1`).bind(id).first()
    if (used) return json({ success: false, message: 'Member is assigned to a project. Deactivate instead of deleting.' }, 409)
    await env.DB.prepare(`DELETE FROM business_members WHERE id=?`).bind(id).run()
    await audit(env, actorId, 'DELETE_MEMBER', 'Members', 'member', id, before, null, 'Warning', 'Deleted business member.')
    return json({ success: true, message: 'Member deleted successfully.' })
}

async function getBusinessProjects(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        p.id,
        p.code,
        p.name,
        p.customer,
        p.value,
        p.status,
        p.deadline,
        p.type,
        p.created_at,
        p.updated_at
      FROM business_projects p
      ORDER BY p.id DESC
    `).all()

        const data = []

        for (const row of result.results as any[]) {
            const members = await env.DB.prepare(`
        SELECT
          m.id,
          m.name,
          m.role,
          m.position,
          m.email,
          pm.contribution_percentage
        FROM project_members pm
        INNER JOIN business_members m
          ON m.id = pm.member_id
        WHERE pm.project_id = ?
        ORDER BY m.id
      `).bind(row.id).all()

            data.push({
                ...row,
                value: Number(row.value || 0),
                team: members.results,
            })
        }

        return json({
            success: true,
            data,
        })
    } catch (error) {
        console.error('Get business projects error:', error)

        return json({
            success: false,
            message: 'Failed to fetch projects.',
        }, 500)
    }
}

async function createBusinessProject(env: Env, body: BusinessProjectPayload, actorId: number) {
    const name = businessText(body.name), customer = businessText(body.customer), deadline = businessText(body.deadline)
    const value = businessNumber(body.value), status = businessText(body.status, 'Planning') as BusinessProjectStatus
    const type = businessText(body.type, 'Custom')
    if (!name || !customer || !deadline || value <= 0) return json({ success: false, message: 'Name, customer, deadline, and positive value are required.' }, 400)
    if (!['Planning', 'In Progress', 'Revision', 'Ready for Final Payment', 'Completed', 'Cancelled'].includes(status)) return json({ success: false, message: 'Invalid project status.' }, 400)
    const year = new Date().getFullYear()
    const countRow = await env.DB.prepare(`SELECT COUNT(*) AS c FROM business_projects WHERE code LIKE ?`).bind(`PRJ-${year}-%`).first<{ c: number }>()
    const code = `PRJ-${year}-${String(Number(countRow?.c || 0) + 1).padStart(3, '0')}`
    const result = await env.DB.prepare(`INSERT INTO business_projects(code,name,customer,value,status,deadline,type) VALUES(?,?,?,?,?,?,?)`).bind(code, name, customer, value, status, deadline, type).run()
    const id = result.meta.last_row_id
    await saveProjectMembers(env, id, body.member_ids, body.contributions)
    const created = await getBusinessProjectById(env, id)
    await audit(env, actorId, 'CREATE_PROJECT', 'Projects', 'project', id, null, created, 'Info', 'Created production project.')
    return json({ success: true, message: 'Project created successfully.', data: created }, 201)
}

async function getBusinessProjectById(env: Env, id: number) {
    const row = await env.DB.prepare(`SELECT id,code,name,customer,value,status,deadline,type,order_id,revenue,project_cost,net_profit,completed_at,created_at,updated_at FROM business_projects WHERE id=?`).bind(id).first<any>()
    if (!row) return null
    const members = await env.DB.prepare(`SELECT m.id,m.name,m.role,m.position,m.email,pm.contribution_percentage FROM project_members pm JOIN business_members m ON m.id=pm.member_id WHERE pm.project_id=? ORDER BY m.id`).bind(id).all()
    return { ...row, value: Number(row.value), team: members.results }
}

async function saveProjectMembers(env: Env, projectId: number, memberIds: unknown, contributions: unknown) {
    const ids = Array.isArray(memberIds)
        ? memberIds.map(Number)
        : []
    const contrib = Array.isArray(contributions)
        ? contributions.map(Number)
        : []

    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error('Invalid project ID.')
    }

    if (ids.length === 0 || ids.length !== contrib.length) {
        throw new Error('Assigned members and contribution values must match.')
    }

    if (new Set(ids).size !== ids.length) {
        throw new Error('A project member cannot be assigned more than once.')
    }

    if (contrib.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
        throw new Error('Contribution percentages must be between 0 and 100.')
    }

    const total = contrib.reduce((sum, value) => sum + value, 0)
    if (total <= 0 || Math.abs(total - 100) > 0.001) {
        throw new Error('Project contribution percentages must total exactly 100%.')
    }

    // Validate every referenced member before deleting the current assignment.
    // This prevents a bad request from leaving the project with no members.
    const memberRows = await Promise.all(
        ids.map((id) => env.DB.prepare(`SELECT id,status FROM business_members WHERE id=?`).bind(id).first<any>()),
    )

    if (memberRows.some((member) => !member || member.status !== 'Active')) {
        throw new Error('All assigned members must exist and be active.')
    }

    const statements = [
        env.DB.prepare(`DELETE FROM project_members WHERE project_id=?`).bind(projectId),
        ...ids.map((memberId, index) =>
            env.DB.prepare(`
                INSERT INTO project_members(project_id,member_id,contribution_percentage)
                VALUES(?,?,?)
            `).bind(projectId, memberId, contrib[index]),
        ),
    ]

    // D1 batch execution keeps the delete + replacement set together instead
    // of exposing an intermediate half-assigned project to another request.
    await env.DB.batch(statements)
}

async function updateBusinessProject(env: Env, id: number, body: BusinessProjectPayload, actorId: number) {
    const before = await getBusinessProjectById(env, id)
    if (!before) return json({ success: false, message: 'Project not found.' }, 404)
    const name = businessText(body.name, String(before.name)), customer = businessText(body.customer, String(before.customer)), deadline = businessText(body.deadline, String(before.deadline))
    const value = businessNumber(body.value, Number(before.value)), status = businessText(body.status, String(before.status)) as BusinessProjectStatus, type = businessText(body.type, String(before.type || 'Custom'))
    if (!name || !customer || !deadline || value <= 0) return json({ success: false, message: 'Invalid project data.' }, 400)
    await env.DB.prepare(`UPDATE business_projects SET name=?,customer=?,value=?,status=?,deadline=?,type=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(name, customer, value, status, deadline, type, id).run()
    if (status === 'Ready for Final Payment') {
        await env.DB.prepare(`UPDATE orders SET status='Ready for Final Payment', final_payment_due_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE business_project_id=?`).bind(id).run()
    }
    if (status === 'Completed') {
        const linkedOrder = await env.DB.prepare(`SELECT id,payment_status FROM orders WHERE business_project_id=? LIMIT 1`).bind(id).first<any>()
        if (linkedOrder && linkedOrder.payment_status !== 'PAID_FULL') return json({ success: false, message: 'Project cannot be completed before the linked order is fully paid.' }, 400)
        await env.DB.prepare(`UPDATE business_projects SET completed_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run()
        await env.DB.prepare(`UPDATE orders SET status='Completed', updated_at=CURRENT_TIMESTAMP WHERE business_project_id=? AND payment_status='PAID_FULL'`).bind(id).run()
    }
    if (body.member_ids !== undefined || body.contributions !== undefined) await saveProjectMembers(env, id, body.member_ids, body.contributions)
    const after = await getBusinessProjectById(env, id)
    await audit(env, actorId, 'UPDATE_PROJECT', 'Projects', 'project', id, before, after, 'Info', 'Updated production project.')
    return json({ success: true, message: 'Project updated successfully.', data: after })
}

async function assignBusinessProjectMembers(env, id: number, body: BusinessProjectPayload, actorId: number) {
    const before = await getBusinessProjectById(env, id); if (!before) return json({ success: false, message: 'Project not found.' }, 404)
    try { await saveProjectMembers(env, id, body.member_ids, body.contributions) } catch (e) { return json({ success: false, message: e instanceof Error ? e.message : 'Invalid project members.' }, 400) }
    const after = await getBusinessProjectById(env, id)
    await audit(env, actorId, 'ASSIGN_PROJECT_MEMBERS', 'Projects', 'project', id, before, after, 'Info', 'Updated project member assignments.')
    return json({ success: true, message: 'Project members updated.', data: after })
}


interface ProjectCostPayload { description?: unknown; category?: unknown; amount?: unknown; status?: unknown }

async function getProjectCosts(env: Env, projectId: number) {
    const project = await env.DB.prepare(`SELECT id FROM business_projects WHERE id=?`).bind(projectId).first()
    if (!project) return json({ success: false, message: 'Project not found.' }, 404)
    const r = await env.DB.prepare(`
    SELECT pc.id,pc.project_id,pc.description,pc.category,pc.amount,pc.status,pc.finance_transaction_id,pc.created_at,pc.updated_at
    FROM project_costs pc WHERE pc.project_id=? ORDER BY pc.id DESC
  `).bind(projectId).all()
    return json({ success: true, data: (r.results as any[]).map(x => ({ ...x, amount: Number(x.amount || 0) })) })
}

async function createProjectCost(env: Env, projectId: number, body: ProjectCostPayload, actorId: number) {
    const project = await env.DB.prepare(`SELECT id,name FROM business_projects WHERE id=?`).bind(projectId).first<any>()
    if (!project) return json({ success: false, message: 'Project not found.' }, 404)
    const description = businessText(body.description), category = businessText(body.category, 'Operational'), amount = businessNumber(body.amount), status = businessText(body.status, 'Completed')
    if (!description || amount <= 0 || !['Completed', 'Pending', 'Cancelled'].includes(status)) return json({ success: false, message: 'Invalid project cost.' }, 400)
    const costResult = await env.DB.prepare(`INSERT INTO project_costs(project_id,description,category,amount,status,created_by) VALUES(?,?,?,?,?,?)`).bind(projectId, description, category, amount, status, actorId).run()
    const costId = Number(costResult.meta.last_row_id)
    let financeId: number | null = null
    if (status === 'Completed') {
        const year = new Date().getFullYear()
        const count = await env.DB.prepare(`SELECT COUNT(*) c FROM finance_transactions WHERE code LIKE ?`).bind(`TRX-${year}-%`).first<{ c: number }>()
        const code = `TRX-${year}-${String(Number(count?.c || 0) + 1).padStart(3, '0')}`
        const fr = await env.DB.prepare(`INSERT INTO finance_transactions(code,date,description,category,type,amount,status,project_id) VALUES(?,?,?,?,?,?,?,?)`).bind(code, new Date().toISOString().slice(0, 10), `Project cost - ${description}`, category, 'Expense', amount, 'Completed', projectId).run()
        financeId = Number(fr.meta.last_row_id)
        await env.DB.prepare(`UPDATE project_costs SET finance_transaction_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(financeId, costId).run()
        await updateProjectFinancials(env, projectId)
        await createAutomaticBusinessDocument(
            env,
            'Receipt',
            `Maintenance Receipt - ${project.name} - ${costId}`,
            projectId,
            project.name,
            [
                `Project: ${project.name}`,
                `Maintenance / Repair Description: ${description}`,
                `Category: ${category}`,
                `Amount Paid: Rp${amount.toLocaleString('id-ID')}`,
                `Transaction Date: ${new Date().toISOString()}`,
                `Finance Transaction ID: ${financeId}`,
                `Cost Status: ${status}`,
                `Recorded By Admin ID: ${actorId}`,
            ].join('\n'),
        )
    }
    const created = await env.DB.prepare(`SELECT * FROM project_costs WHERE id=?`).bind(costId).first<any>()
    await audit(env, actorId, 'CREATE_PROJECT_COST', 'Projects', 'project_cost', costId, null, created, 'Warning', `Added project cost to ${project.name}.`)
    return json({ success: true, message: 'Project cost added.', data: created }, 201)
}

async function deleteProjectCost(env: Env, projectId: number, costId: number, actorId: number) {
    const before = await env.DB.prepare(`SELECT * FROM project_costs WHERE id=? AND project_id=?`).bind(costId, projectId).first<any>()
    if (!before) return json({ success: false, message: 'Project cost not found.' }, 404)
    if (before.finance_transaction_id) {
        const tx = await env.DB.prepare(`SELECT * FROM finance_transactions WHERE id=?`).bind(before.finance_transaction_id).first<any>()
        if (tx) await env.DB.prepare(`DELETE FROM finance_transactions WHERE id=?`).bind(before.finance_transaction_id).run()
    }
    await env.DB.prepare(`DELETE FROM project_costs WHERE id=?`).bind(costId).run()
    await updateProjectFinancials(env, projectId)
    await audit(env, actorId, 'DELETE_PROJECT_COST', 'Projects', 'project_cost', costId, before, null, 'Warning', 'Deleted project cost and linked finance expense.')
    return json({ success: true, message: 'Project cost deleted.' })
}

async function getFinanceTransactions(env: Env) {
    const result = await env.DB.prepare(`SELECT t.id,t.code,t.date,t.description,t.category,t.type,t.amount,t.status,t.project_id,t.payment_reference,p.name AS project FROM finance_transactions t LEFT JOIN business_projects p ON p.id=t.project_id ORDER BY t.id DESC`).all()
    return json({ success: true, data: (result.results as any[]).map(x => ({ ...x, amount: Number(x.amount) })) })
}

async function getFinanceSummary(env: Env) {
    const row = await env.DB.prepare(`SELECT COALESCE(SUM(CASE WHEN type='Revenue' AND status='Completed' THEN amount ELSE 0 END),0) revenue,COALESCE(SUM(CASE WHEN type='Expense' AND status='Completed' THEN amount ELSE 0 END),0) expense,COUNT(*) transactions FROM finance_transactions`).first<any>()
    const revenue = Number(row?.revenue || 0), expense = Number(row?.expense || 0)
    return json({ success: true, data: { revenue, expense, balance: revenue - expense, transactions: Number(row?.transactions || 0) } })
}

async function createFinanceTransaction(env: Env, body: BusinessTransactionPayload, actorId: number) {
    const description = businessText(body.description), category = businessText(body.category, 'Operational'), type = businessText(body.type) as BusinessTransactionType, amount = businessNumber(body.amount), date = businessText(body.date, new Date().toISOString().slice(0, 10)), status = businessText(body.status, 'Completed') as BusinessTransactionStatus, projectId = body.project_id === null || body.project_id === undefined || body.project_id === '' ? null : Number(body.project_id), paymentReference = businessText(body.payment_reference) || null
    if (!description || !['Revenue', 'Expense'].includes(type) || amount <= 0 || !['Completed', 'Pending', 'Cancelled'].includes(status)) return json({ success: false, message: 'Invalid transaction data.' }, 400)
    if (projectId !== null) { const p = await env.DB.prepare(`SELECT id FROM business_projects WHERE id=?`).bind(projectId).first(); if (!p) return json({ success: false, message: 'Project not found.' }, 404) }
    const year = new Date().getFullYear(), count = await env.DB.prepare(`SELECT COUNT(*) c FROM finance_transactions WHERE code LIKE ?`).bind(`TRX-${year}-%`).first<{ c: number }>(), code = `TRX-${year}-${String(Number(count?.c || 0) + 1).padStart(3, '0')}`
    const result = await env.DB.prepare(`INSERT INTO finance_transactions(code,date,description,category,type,amount,status,project_id,payment_reference) VALUES(?,?,?,?,?,?,?,?,?)`).bind(code, date, description, category, type, amount, status, projectId, paymentReference).run()
    const created = await env.DB.prepare(`SELECT * FROM finance_transactions WHERE id=?`).bind(result.meta.last_row_id).first()
    await audit(env, actorId, 'CREATE_TRANSACTION', 'Finance', 'transaction', result.meta.last_row_id, null, created, 'Info', 'Created financial transaction.')
    return json({ success: true, message: 'Transaction created.', data: created }, 201)
}

async function updateFinanceTransaction(env, id: number, body: BusinessTransactionPayload, actorId: number) {
    const before = await env.DB.prepare(`SELECT * FROM finance_transactions WHERE id=?`).bind(id).first<any>(); if (!before) return json({ success: false, message: 'Transaction not found.' }, 404)
    const description = businessText(body.description, String(before.description)), category = businessText(body.category, String(before.category)), type = businessText(body.type, String(before.type)) as BusinessTransactionType, amount = businessNumber(body.amount, Number(before.amount)), date = businessText(body.date, String(before.date)), status = businessText(body.status, String(before.status)) as BusinessTransactionStatus, projectId = body.project_id === null || body.project_id === undefined || body.project_id === '' ? before.project_id : Number(body.project_id)
    if (amount <= 0 || !['Revenue', 'Expense'].includes(type) || !['Completed', 'Pending', 'Cancelled'].includes(status)) return json({ success: false, message: 'Invalid transaction data.' }, 400)
    await env.DB.prepare(`UPDATE finance_transactions SET description=?,category=?,type=?,amount=?,date=?,status=?,project_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(description, category, type, amount, date, status, projectId, id).run()
    const after = await env.DB.prepare(`SELECT * FROM finance_transactions WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'UPDATE_TRANSACTION', 'Finance', 'transaction', id, before, after, 'Warning', 'Updated financial transaction.')
    return json({ success: true, message: 'Transaction updated.', data: after })
}

async function deleteFinanceTransaction(env, id: number, actorId: number) {
    const before = await env.DB.prepare(`SELECT * FROM finance_transactions WHERE id=?`).bind(id).first(); if (!before) return json({ success: false, message: 'Transaction not found.' }, 404)
    await env.DB.prepare(`DELETE FROM finance_transactions WHERE id=?`).bind(id).run(); await audit(env, actorId, 'DELETE_TRANSACTION', 'Finance', 'transaction', id, before, null, 'Warning', 'Deleted financial transaction.')
    return json({ success: true, message: 'Transaction deleted.' })
}

async function getRevenueSharings(env: Env) {
    try {
        const result = await env.DB.prepare(`
      SELECT
        r.id,
        r.project_id,
        r.reserve_percentage,
        r.status,
        r.notes,
        r.created_at,
        r.updated_at,

        p.code AS project_code,
        p.name AS project_name,
        p.value AS project_value,

        COALESCE(
          (
            SELECT SUM(ft.amount)
            FROM finance_transactions ft
            WHERE ft.project_id = r.project_id
              AND ft.type = 'Revenue'
              AND ft.status = 'Completed'
          ),
          0
        ) AS revenue,

        COALESCE(
          (
            SELECT SUM(ft.amount)
            FROM finance_transactions ft
            WHERE ft.project_id = r.project_id
              AND ft.type = 'Expense'
              AND ft.status = 'Completed'
          ),
          0
        ) AS costs

      FROM revenue_sharings r
      LEFT JOIN business_projects p
        ON p.id = r.project_id

      ORDER BY r.id DESC
    `).all()

        const data = []

        for (const row of result.results as any[]) {
            const membersResult = await env.DB.prepare(`
        SELECT
          rsm.id,
          rsm.distribution_id,
          rsm.member_id,
          rsm.percentage,
          rsm.amount,
          rsm.created_at,

          m.name AS member_name,
          m.role AS member_role,
          m.position AS member_position,
          m.email AS member_email

        FROM revenue_sharing_members rsm

        LEFT JOIN business_members m
          ON m.id = rsm.member_id

        WHERE rsm.distribution_id = ?

        ORDER BY rsm.id ASC
      `)
                .bind(row.id)
                .all()

            const revenue = Number(row.revenue || 0)
            const costs = Number(row.costs || 0)

            const profit = Math.max(
                0,
                revenue - costs,
            )

            const reservePercentage = Number(
                row.reserve_percentage || 0,
            )

            const reserve =
                profit *
                reservePercentage /
                100

            const distributable =
                Math.max(
                    0,
                    profit - reserve,
                )

            data.push({
                id: Number(row.id),
                project_id: row.project_id
                    ? Number(row.project_id)
                    : null,

                project_code:
                    row.project_code || '',

                project_name:
                    row.project_name || '',

                project_value:
                    Number(row.project_value || 0),

                reserve_percentage:
                    reservePercentage,

                status:
                    row.status || 'Draft',

                notes:
                    row.notes || '',

                revenue,
                costs,
                profit,
                reserve,
                distributable,

                members:
                    (membersResult.results as any[]).map(
                        (member) => ({
                            id: Number(member.id),
                            distribution_id:
                                Number(member.distribution_id),

                            member_id:
                                Number(member.member_id),

                            member_name:
                                member.member_name || '',

                            member_role:
                                member.member_role || '',

                            member_position:
                                member.member_position || '',

                            member_email:
                                member.member_email || '',

                            percentage:
                                Number(member.percentage || 0),

                            amount:
                                Number(member.amount || 0),

                            created_at:
                                member.created_at,
                        }),
                    ),

                created_at:
                    row.created_at,

                updated_at:
                    row.updated_at,
            })
        }

        return json({
            success: true,
            data,
        })
    } catch (error) {
        console.error(
            'Get revenue sharing error:',
            error,
        )

        return json(
            {
                success: false,
                message: 'Failed to fetch revenue sharing.',
            },
            500,
        )
    }
}

async function createRevenueSharing(env: Env, body: BusinessDistributionPayload, actorId: number) {
    const projectId = Number(body.project_id), reserve = businessNumber(body.reserve_percentage, 20)
    if (!Number.isInteger(projectId) || projectId <= 0 || reserve < 0 || reserve > 100) return json({ success: false, message: 'Valid project and reserve percentage are required.' }, 400)
    const project = await getBusinessProjectById(env, projectId); if (!project) return json({ success: false, message: 'Project not found.' }, 404)
    if (project.status !== 'Completed') return json({ success: false, message: 'Revenue sharing can only be prepared after the project is completed and final payment is paid.' }, 400)
    if (project.order_id) { const linkedOrder = await env.DB.prepare(`SELECT payment_status FROM orders WHERE id=?`).bind(project.order_id).first<any>(); if (linkedOrder && linkedOrder.payment_status !== 'PAID_FULL') return json({ success: false, message: 'The linked order must have full payment before revenue sharing.' }, 400) }
    const revenueRow = await env.DB.prepare(`SELECT COALESCE(SUM(amount),0) total FROM finance_transactions WHERE project_id=? AND type='Revenue' AND status='Completed'`).bind(projectId).first<any>()
    const costRow = await env.DB.prepare(`SELECT COALESCE(SUM(amount),0) total FROM finance_transactions WHERE project_id=? AND type='Expense' AND status='Completed'`).bind(projectId).first<any>()
    const revenue = Number(revenueRow?.total || 0), costs = Number(costRow?.total || 0)
    if (revenue <= 0) return json({ success: false, message: 'Project has no completed revenue yet. Add a completed revenue transaction first.' }, 400)
    const members = project.team || []; if (!members.length) return json({ success: false, message: 'Assign project members before creating revenue sharing.' }, 400)
    const total = members.reduce((s: any, m: any) => s + Number(m.contribution_percentage || 0), 0); if (Math.abs(total - 100) > 0.001) return json({ success: false, message: 'Project contribution percentages must total 100%.' }, 400)
    const existing = await env.DB.prepare(`SELECT id FROM revenue_sharings WHERE project_id=? AND status IN ('Draft','Pending Approval','Approved') LIMIT 1`).bind(projectId).first(); if (existing) return json({ success: false, message: 'An active revenue sharing record already exists for this project.' }, 409)
    const result = await env.DB.prepare(`INSERT INTO revenue_sharings(project_id,reserve_percentage,status,notes) VALUES(?,?,?,?)`).bind(projectId, reserve, 'Pending Approval', `DIST-${new Date().getFullYear()}-${Date.now()}`).run(); const id = result.meta.last_row_id
    const profit = Math.max(0, revenue - costs), dist = profit * (1 - reserve / 100)
    for (const m of members) { const pct = Number(m.contribution_percentage || 0); await env.DB.prepare(`INSERT INTO revenue_sharing_members(distribution_id,member_id,percentage,amount) VALUES(?,?,?,?)`).bind(id, m.id, pct, dist * pct / 100).run() }
    const created = await env.DB.prepare(`SELECT * FROM revenue_sharings WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'CREATE_DISTRIBUTION', 'Revenue Sharing', 'distribution', id, null, created, 'Warning', 'Created revenue sharing for project.')
    return json({ success: true, message: 'Revenue sharing created and submitted for approval.', data: { id } }, 201)
}

async function approveRevenueSharing(env, id: number, actorId: number) {
    const before = await env.DB.prepare(`SELECT * FROM revenue_sharings WHERE id=?`).bind(id).first<any>(); if (!before) return json({ success: false, message: 'Distribution not found.' }, 404)
    if (before.status !== 'Pending Approval') return json({ success: false, message: 'Only pending distributions can be approved.' }, 400)
    await env.DB.prepare(`UPDATE revenue_sharings SET status='Approved',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run()
    const after = await env.DB.prepare(`SELECT * FROM revenue_sharings WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'APPROVE_DISTRIBUTION', 'Revenue Sharing', 'distribution', id, before, after, 'Info', 'Approved revenue distribution.')
    return json({ success: true, message: 'Distribution approved.', data: after })
}

async function payRevenueSharing(env, id: number, actorId: number) {
    const before = await env.DB.prepare(`SELECT * FROM revenue_sharings WHERE id=?`).bind(id).first<any>(); if (!before) return json({ success: false, message: 'Distribution not found.' }, 404)
    if (before.status !== 'Approved') return json({ success: false, message: 'Only approved distributions can be marked paid.' }, 400)
    const members = await env.DB.prepare(`SELECT * FROM revenue_sharing_members WHERE distribution_id=?`).bind(id).all()
    for (const m of members.results as any[]) {
        const code = `DIST-${id}-${m.member_id}`
        const exists = await env.DB.prepare(`SELECT id FROM finance_transactions WHERE code=? LIMIT 1`).bind(code).first()
        if (!exists) {
            await env.DB.prepare(`INSERT INTO finance_transactions(code,date,description,category,type,amount,status,project_id) VALUES(?,?,?,?,?,?,?,?)`).bind(code, new Date().toISOString().slice(0, 10), `Revenue sharing payment - ${m.member_id}`, 'Member Distribution', 'Expense', Number(m.amount), 'Completed', before.project_id).run()
        }
    }
    const project = await env.DB.prepare(`SELECT name,customer FROM business_projects WHERE id=?`).bind(before.project_id).first<any>()
    const paymentDate = new Date().toISOString()
    for (const m of members.results as any[]) {
        const member = await env.DB.prepare(`SELECT id,name,role,position,email FROM business_members WHERE id=?`).bind(m.member_id).first<any>()
        await createAutomaticBusinessDocument(
            env,
            'Receipt',
            `Member Payment Receipt - DIST-${id}-${m.member_id}`,
            Number(before.project_id),
            project?.name || `Distribution ${id}`,
            [
                `Distribution: DIST-${id}`,
                `Project: ${project?.name || '-'}`,
                `Customer / Client: ${project?.customer || '-'}`,
                `Member Name: ${member?.name || `Member ${m.member_id}`}`,
                `Role: ${member?.role || '-'}`,
                `Position: ${member?.position || '-'}`,
                `Email: ${member?.email || '-'}`,
                `Contribution: ${Number(m.percentage || 0)}%`,
                `Payment Amount: Rp${Number(m.amount || 0).toLocaleString('id-ID')}`,
                `Payment Date: ${paymentDate}`,
                `Payment Status: PAID`,
                `Finance Code: DIST-${id}-${m.member_id}`,
            ].join('\n'),
        )
    }

    await env.DB.prepare(`UPDATE revenue_sharings SET status='Paid',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run()
    const after = await env.DB.prepare(`SELECT * FROM revenue_sharings WHERE id=?`).bind(id).first()
    await audit(env, actorId, 'PAY_DISTRIBUTION', 'Revenue Sharing', 'distribution', id, before, after, 'Info', 'Marked revenue distribution as paid and created finance expenses.')
    return json({ success: true, message: 'Distribution paid and finance transactions created.', data: after })
}

function documentHtml(doc: any) {
    const safe = (v: any) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
    const rows = String(doc.content || '39Production business document.')
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => {
            const i = line.indexOf(':')
            return i > 0 ? `<tr><td>${safe(line.slice(0, i))}</td><td>${safe(line.slice(i + 1).trim())}</td></tr>` : `<tr><td colspan="2">${safe(line)}</td></tr>`
        })
        .join('')
    return `<!doctype html><html><head><meta charset="utf-8"><title>${safe(doc.number)}</title><style>
  @page{size:A4;margin:0}body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f4f4f5;color:#18181b}.page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;box-sizing:border-box;padding:18mm 16mm}.top{background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;padding:22px 24px;border-radius:16px}.brand{font-size:25px;font-weight:800}.sub{font-size:11px;opacity:.9;margin-top:5px}.meta{margin-top:24px;display:flex;justify-content:space-between;gap:20px}.label{font-size:10px;color:#71717a;text-transform:uppercase;font-weight:700;letter-spacing:.08em}.value{font-size:13px;font-weight:600;margin-top:5px}.title{font-size:24px;font-weight:800;margin:25px 0 4px}.type{font-size:11px;color:#8b5cf6;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.box{margin-top:20px;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden}.boxhead{padding:12px 16px;background:#fafafa;border-bottom:1px solid #e4e4e7;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.box table{width:100%;border-collapse:collapse}.box td{padding:12px 16px;border-bottom:1px solid #f0f0f2;font-size:12px;vertical-align:top}.box tr:last-child td{border-bottom:0}.box td:first-child{width:31%;font-weight:700;color:#52525b}.footer{margin-top:35px;padding-top:14px;border-top:1px solid #e4e4e7;font-size:10px;color:#71717a;display:flex;justify-content:space-between}.badge{display:inline-block;margin-top:8px;padding:5px 9px;border-radius:999px;background:#fff;color:#7c3aed;font-size:10px;font-weight:800}
  </style></head><body><div class="page"><div class="top"><div class="brand">39Production</div><div class="sub">Creative Production & Digital Services</div><div class="meta"><div><div style="font-size:10px;opacity:.8">DOCUMENT</div><div style="font-weight:800;margin-top:3px">${safe(doc.number)}</div></div><div style="text-align:right"><div style="font-size:10px;opacity:.8">DATE</div><div style="font-weight:800;margin-top:3px">${safe(doc.date)}</div></div></div></div><div class="type">${safe(doc.type)}</div><div class="title">${safe(doc.title)}</div><div style="font-size:12px;color:#71717a">${safe(doc.related_to || '-')}</div><span class="badge">${safe(doc.status === 'Active' ? 'FINAL' : String(doc.status || 'FINAL').toUpperCase())}</span><div class="box"><div class="boxhead">Transaction / Document Details</div><table>${rows}</table></div><div class="footer"><span>Dokumen ini diterbitkan oleh sistem 39Production.</span><span>${safe(doc.number)}</span></div></div></body></html>`
}

function normalizeBusinessDocument(d: any) {
    const description = String(d.description || '')
    const parts = description.split(/\n\s*\n/)
    const related = parts.shift() || ''
    const content = parts.join('\n\n') || related
    const year = new Date(d.created_at || Date.now()).getFullYear()
    const prefix = d.document_type === 'Invoice' ? 'INV' : d.document_type === 'Receipt' ? 'REC' : d.document_type === 'Order Confirmation' ? 'ORD' : 'DOC'
    return {
        ...d,
        number: `${prefix}-${year}-${String(d.id).padStart(4, '0')}`,
        type: d.document_type,
        related_to: related,
        date: String(d.created_at || '').slice(0, 19),
        content,
    }
}

async function getBusinessDocuments(env: Env) {
    try {
        const r = await env.DB.prepare(`
      SELECT
        id,
        project_id,
        document_type AS type,
        title,
        description AS related_to,
        file_url,
        status,
        created_at,
        updated_at
      FROM business_documents
      ORDER BY id DESC
    `).all()

        const data = (r.results as any[]).map((doc) => normalizeBusinessDocument({ ...doc, document_type: doc.type, description: doc.related_to }))

        return json({ success: true, data })
    } catch (error) {
        console.error('Get business documents error:', error)
        return json({
            success: false,
            message: 'Failed to fetch documents.',
        }, 500)
    }
}

async function createBusinessDocument(env: Env, body: BusinessDocumentPayload, actorId: number) {
    const type = businessText(body.type, 'Project Statement') as BusinessDocumentType
    const title = businessText(body.title, '39Production Document')
    const projectId = body.project_id === undefined || body.project_id === null || body.project_id === '' ? null : Number(body.project_id)
    const related = businessText(body.related_to)
    const status = businessText(body.status, 'Draft')
    const content = businessText(body.content)

    if (!['Invoice', 'Receipt', 'Order Confirmation', 'Project Proposal', 'Quotation', 'Project Brief', 'Scope of Work', 'Agreement', 'Contract', 'NDA', 'Berita Acara', 'Project Completion', 'Handover', 'Maintenance Agreement', 'Project Statement'].includes(type)) return json({ success: false, message: 'Invalid document type.' }, 400)

    if (projectId !== null) {
        const project = await env.DB.prepare(`SELECT id FROM business_projects WHERE id=?`).bind(projectId).first()
        if (!project) return json({ success: false, message: 'Project not found.' }, 404)
    }

    const result = await env.DB.prepare(`
    INSERT INTO business_documents (
      project_id,
      document_type,
      title,
      description,
      file_url,
      status
    )
    VALUES (?, ?, ?, ?, '', ?)
  `)
        .bind(
            projectId,
            type,
            title,
            [related, content].filter(Boolean).join('\n\n'),
            status === 'Final' ? 'Active' : 'Active',
        )
        .run()

    const created = await env.DB.prepare(`SELECT * FROM business_documents WHERE id=?`).bind(result.meta.last_row_id).first<any>()
    await audit(env, actorId, 'CREATE_DOCUMENT', 'Documents', 'document', result.meta.last_row_id, null, created, 'Info', 'Generated business document.')

    return json({
        success: true,
        message: 'Document generated.',
        data: normalizeBusinessDocument(created),
    }, 201)
}

async function getBusinessDocument(env: Env, id: number) {
    const d = await env.DB.prepare(`SELECT * FROM business_documents WHERE id=?`).bind(id).first<any>()
    if (!d) return json({ success: false, message: 'Document not found.' }, 404)

    const normalized = normalizeBusinessDocument(d)

    return json({ success: true, data: { ...normalized, html: documentHtml(normalized) } })
}

async function getAuditLogs(env) { const r = await env.DB.prepare(`SELECT a.id,a.actor_id,u.name actor,a.action,a.module,a.entity_type,a.entity_id target,a.level,a.description,a.before_json,a.after_json,a.created_at timestamp FROM audit_logs a LEFT JOIN admin_users u ON u.id=a.actor_id ORDER BY a.id DESC`).all(); return json({ success: true, data: r.results }) }


/* =========================
   MAIN WORKER
========================= */

export default {
    async fetch(
        request: Request,
        env: Env,
    ): Promise<Response> {
        const url = new URL(request.url)
        const pathname = url.pathname
        const method = request.method

        /* =========================
           CORS PREFLIGHT
        ========================= */

        const bodySizeError = await checkRequestBodySize(request)
        if (bodySizeError) return bodySizeError

        if (method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    ...getCorsHeaders(request.headers.get('Origin') || undefined, env),
                    ...securityHeaders(),
                },
            })
        }

        const publicRateLimitBucket =
            pathname === '/api/auth/login' ? 'login' :
                pathname === '/api/payments/create' ? 'payment-create' :
                    pathname === '/api/payments/final/create' ? 'payment-final' :
                        pathname === '/api/quotes' ? 'quote-create' :
                            pathname.startsWith('/api/quotes/public/') ? 'quote-public' :
                                pathname.startsWith('/api/orders/track/') ? 'order-track' :
                                    /^\/api\/payments\/[^/]+\/status$/.test(pathname) ? 'payment-status' :
                                        (pathname === '/api/payments/webhook' || pathname === '/v1.0/debit/notify') ? 'payment-webhook' :
                                            null

        if (publicRateLimitBucket) {
            const limit = publicRateLimitBucket === 'payment-webhook' ? 120 : publicRateLimitBucket === 'order-track' ? 30 : publicRateLimitBucket === 'quote-public' ? 30 : 20
            const rate = consumePublicRateLimit(request, publicRateLimitBucket, limit, 60 * 1000)
            if (!rate.allowed) return rateLimitResponse(rate.retryAfter, request, env)
        }

        try {
            await ensureSecuritySchema(env)
            await cleanupExpiredSessions(env)

            /* =========================
               AUTHENTICATION
            ========================= */

            if (pathname === '/api/auth/login' && method === 'POST') {
                let body: LoginPayload

                try {
                    body = await request.json<LoginPayload>()
                } catch {
                    return json(
                        {
                            success: false,
                            message: 'Invalid JSON body.',
                        },
                        400,
                    )
                }

                return await loginAdmin(request, env, body)
            }

            if (pathname === '/api/auth/me' && method === 'GET') {
                return await getCurrentAdmin(request, env)
            }

            if (pathname === '/api/auth/logout' && method === 'POST') {
                return await logoutAdmin(request, env)
            }

            if (
                pathname === '/api/auth/change-password' &&
                method === 'PUT'
            ) {
                const body =
                    await request.json<ChangePasswordPayload>()

                return await changeAdminPassword(
                    request,
                    env,
                    body,
                )
            }

            /* =========================
               ADMIN NOTIFICATIONS
            ========================= */

            if (pathname === '/api/admin/notifications' && method === 'GET') {
                const auth = await requirePermission(request, env, 'notifications:read')
                if (auth instanceof Response) return auth
                return await getAdminNotifications(request, env)
            }

            const notificationReadMatch =
                pathname.match(/^\/api\/admin\/notifications\/(\d+)\/read$/)

            if (notificationReadMatch && method === 'PUT') {
                const auth = await requirePermission(request, env, 'notifications:write')
                if (auth instanceof Response) return auth
                return await markAdminNotificationRead(
                    request,
                    env,
                    Number(notificationReadMatch[1]),
                )
            }

            if (pathname === '/api/admin/notifications/read-all' && method === 'PUT') {
                const auth = await requirePermission(request, env, 'notifications:write')
                if (auth instanceof Response) return auth
                return await markAllAdminNotificationsRead(request, env)
            }

            /* =========================
               PUBLIC QUOTE ACCEPT
               Must run before the global admin auth gate.
            ========================= */

            if (
                method === 'POST' &&
                isPublicQuoteAcceptPath(pathname)
            ) {
                const publicQuoteToken =
                    getPublicQuoteToken(pathname)

                if (publicQuoteToken !== null) {
                    return await acceptPublicQuote(
                        env,
                        publicQuoteToken,
                    )
                }
            }

            /* =========================
               PUBLIC ROUTES
            ========================= */

            const isPublicRoute =
                (pathname === '/api/payments/create' && method === 'POST') ||
                (pathname === '/api/payments/final/create' && method === 'POST') ||
                (/^\/api\/payments\/[^/]+\/status$/.test(pathname) && method === 'GET') ||
                (pathname === '/api/payments/webhook' && method === 'POST') ||
                (pathname === '/v1.0/debit/notify' && method === 'POST') ||
                (pathname.startsWith('/api/orders/track/') && method === 'GET') ||
                (pathname === '/api/services' && method === 'GET') ||
                (/^\/api\/services\/\d+$/.test(pathname) && method === 'GET') ||
                (pathname === '/api/quotes' && method === 'POST') ||
                (/^\/api\/quotes\/public\/[^/]+(?:\/accept)?$/.test(pathname) && (method === 'GET' || method === 'POST')) ||
                (pathname === '/api/products' && method === 'GET') ||
                (/^\/api\/products\/\d+$/.test(pathname) && method === 'GET') ||
                (pathname === '/api/portfolio' && method === 'GET') ||
                (/^\/api\/portfolio\/\d+$/.test(pathname) && method === 'GET') ||
                (pathname === '/api/promotions' && method === 'GET') ||
                (/^\/api\/promotions\/\d+$/.test(pathname) && method === 'GET') ||
                (pathname === '/api/news' && method === 'GET') ||
                (/^\/api\/news\/\d+$/.test(pathname) && method === 'GET') ||
                (pathname.startsWith('/api/idol/') && method === 'GET')

            if (!isPublicRoute) {
                const permission =
                    pathname === '/api/settings' && method === 'GET' ? 'dashboard:read' :
                        pathname === '/api/settings' && method === 'PUT' ? 'settings:write' :
                            pathname.startsWith('/api/admin/') && pathname.includes('/notifications') ? 'dashboard:read' :
                                pathname.startsWith('/api/services') || pathname.startsWith('/api/products') ||
                                    pathname.startsWith('/api/portfolio') || pathname.startsWith('/api/news') ||
                                    pathname.startsWith('/api/promotions') || pathname.startsWith('/api/idol/') ?
                                    (method === 'GET' ? 'content:read' : 'content:write') :
                                    pathname.startsWith('/api/orders') ? 'orders:read' :
                                        'dashboard:read'

                const auth = await requirePermission(request, env, permission)
                if (auth instanceof Response) return auth
            }

            /* =========================
               SETTINGS
            ========================= */

            if (pathname === '/api/settings') {
                if (method === 'GET') {
                    return await getSiteSettings(env)
                }

                if (method === 'PUT') {
                    const auth = await requirePermission(request, env, 'settings:write')

                    if (auth instanceof Response) {
                        return auth
                    }

                    const body =
                        await request.json<SiteSettingsPayload>()

                    return await updateSiteSettings(
                        env,
                        body,
                        auth.user.id,
                    )
                }
            }

            /* =========================
               SERVICES
            ========================= */

            if (pathname === '/api/services') {
                if (method === 'GET') {
                    return await getServices(env)
                }

                if (method === 'POST') {
                    const parsed = await parseServiceRequest(request)
                    return await createService(env, parsed.body, parsed.image)
                }
            }

            const serviceId =
                getServiceId(pathname)

            if (serviceId !== null) {
                if (method === 'GET') {
                    return await getService(
                        env,
                        serviceId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseServiceRequest(request)
                    return await updateService(env, serviceId, parsed.body, parsed.image)
                }

                if (method === 'DELETE') {
                    return await deleteService(
                        env,
                        serviceId,
                    )
                }
            }

            /* =========================
               SERVICE QUOTES
            ========================= */

            const publicQuoteToken =
                getPublicQuoteToken(pathname)

            if (publicQuoteToken !== null) {
                if (method === 'GET' && !isPublicQuoteAcceptPath(pathname)) {
                    return await getPublicQuote(
                        env,
                        publicQuoteToken,
                    )
                }

                if (method === 'POST' && isPublicQuoteAcceptPath(pathname)) {
                    return await acceptPublicQuote(
                        env,
                        publicQuoteToken,
                    )
                }
            }

            if (pathname === '/api/quotes') {
                if (method === 'GET') {
                    return await getQuotes(env)
                }

                if (method === 'POST') {
                    const body = await request.json<QuotePayload>()
                    return await createQuote(env, body)
                }
            }

            const quoteId = getQuoteId(pathname)

            if (quoteId !== null) {
                if (method === 'GET') {
                    return await getQuote(env, quoteId)
                }

                if (method === 'PUT') {
                    const body = await request.json<QuotePayload>()
                    return await updateQuote(
                        request,
                        env,
                        quoteId,
                        body,
                    )
                }
            }

            /* =========================
               PRODUCTS
            ========================= */

            if (pathname === '/api/products') {
                if (method === 'GET') {
                    return await getProducts(env)
                }

                if (method === 'POST') {
                    const parsed = await parseProductRequest(request)

                    return await createProduct(
                        env,
                        parsed.body,
                        parsed.image,
                    )
                }
            }

            const productId =
                getProductId(pathname)

            if (productId !== null) {
                if (method === 'GET') {
                    return await getProduct(
                        env,
                        productId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseProductRequest(request)

                    return await updateProduct(
                        env,
                        productId,
                        parsed.body,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteProduct(
                        env,
                        productId,
                    )
                }
            }

            /* =========================
               PORTFOLIO
            ========================= */

            if (pathname === '/api/portfolio') {
                if (method === 'GET') {
                    return await getPortfolios(env)
                }

                if (method === 'POST') {
                    const parsed = await parsePortfolioRequest(request)
                    return await createPortfolio(env, parsed.body, parsed.image)
                }
            }

            const portfolioId =
                getPortfolioId(pathname)

            if (portfolioId !== null) {
                if (method === 'GET') {
                    return await getPortfolio(
                        env,
                        portfolioId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parsePortfolioRequest(request)
                    return await updatePortfolio(env, portfolioId, parsed.body, parsed.image)
                }

                if (method === 'DELETE') {
                    return await deletePortfolio(
                        env,
                        portfolioId,
                    )
                }
            }

            /* =====================================================
               IDOL PRODUCTION
            ===================================================== */

            /* =========================
               IDOL GROUP DETAIL
               GET /api/idol/groups/:id
            ========================= */

            const idolGroupId =
                getIdolGroupId(pathname)

            if (idolGroupId !== null) {
                if (method === 'GET') {
                    return await getIdolGroup(
                        env,
                        idolGroupId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseIdolRequest(request)

                    return await updateIdolGroup(
                        env,
                        idolGroupId,
                        parsed.body as IdolGroupPayload,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteIdolGroup(
                        env,
                        idolGroupId,
                    )
                }
            }

            /* =========================
               IDOL GROUPS
            ========================= */

            if (pathname === '/api/idol/groups') {
                if (method === 'GET') {
                    return await getIdolGroups(env)
                }

                if (method === 'POST') {
                    const parsed = await parseIdolRequest(request)

                    return await createIdolGroup(
                        env,
                        parsed.body as IdolGroupPayload,
                        parsed.image,
                    )
                }
            }

            /* =========================
               IDOL GROUP MEMBERS
            ========================= */

            const idolGroupMembersMatch =
                pathname.match(
                    /^\/api\/idol\/groups\/(\d+)\/members$/,
                )

            if (idolGroupMembersMatch) {
                const groupId =
                    Number(idolGroupMembersMatch[1])

                if (method === 'GET') {
                    return await getIdolMembers(
                        env,
                        groupId,
                    )
                }

                if (method === 'POST') {
                    const parsed = await parseIdolRequest(request)

                    return await createIdolMember(
                        env,
                        groupId,
                        parsed.body as IdolMemberPayload,
                        parsed.image,
                    )
                }
            }

            /* =========================
               IDOL MEMBER DETAIL
            ========================= */

            const idolMemberId =
                getIdolMemberId(pathname)

            if (idolMemberId !== null) {
                if (method === 'GET') {
                    return await getIdolMember(
                        env,
                        idolMemberId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseIdolRequest(request)

                    return await updateIdolMember(
                        env,
                        idolMemberId,
                        parsed.body as IdolMemberPayload,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteIdolMember(
                        env,
                        idolMemberId,
                    )
                }
            }

            /* =========================
               IDOL GROUP RELEASES
            ========================= */

            const idolGroupReleasesMatch =
                pathname.match(
                    /^\/api\/idol\/groups\/(\d+)\/releases$/,
                )

            if (idolGroupReleasesMatch) {
                const groupId =
                    Number(idolGroupReleasesMatch[1])

                if (method === 'GET') {
                    return await getIdolReleases(
                        env,
                        groupId,
                    )
                }

                if (method === 'POST') {
                    const parsed = await parseIdolRequest(request)

                    return await createIdolRelease(
                        env,
                        groupId,
                        parsed.body as IdolReleasePayload,
                        parsed.image,
                    )
                }
            }

            /* =========================
               IDOL RELEASE DETAIL
            ========================= */

            const idolReleaseId =
                getIdolReleaseId(pathname)

            if (idolReleaseId !== null) {
                if (method === 'GET') {
                    return await getIdolRelease(
                        env,
                        idolReleaseId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseIdolRequest(request)

                    return await updateIdolRelease(
                        env,
                        idolReleaseId,
                        parsed.body as IdolReleasePayload,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteIdolRelease(
                        env,
                        idolReleaseId,
                    )
                }
            }

            /* =========================
               ALL IDOL RELEASES
            ========================= */

            if (
                pathname ===
                '/api/idol/releases'
            ) {
                if (method === 'GET') {
                    return await getAllIdolReleases(env)
                }
            }

            /* =========================
               GROUP MUSIC VIDEOS
            ========================= */

            const idolGroupMusicVideosMatch =
                pathname.match(
                    /^\/api\/idol\/groups\/(\d+)\/music-videos$/,
                )

            if (idolGroupMusicVideosMatch) {
                const groupId =
                    Number(
                        idolGroupMusicVideosMatch[1],
                    )

                if (method === 'GET') {
                    return await getIdolMusicVideosByGroup(
                        env,
                        groupId,
                    )
                }
            }

            /* =========================
               IDOL MUSIC VIDEOS
            ========================= */

            if (
                pathname ===
                '/api/idol/music-videos'
            ) {
                if (method === 'GET') {
                    return await getIdolMusicVideos(env)
                }

                if (method === 'POST') {
                    const parsed = await parseIdolRequest(request)

                    return await createIdolMusicVideo(
                        env,
                        parsed.body as IdolMusicVideoPayload,
                        parsed.image,
                    )
                }
            }

            /* =========================
               IDOL MUSIC VIDEO DETAIL
            ========================= */

            const idolMusicVideoId =
                getIdolMusicVideoId(pathname)

            if (idolMusicVideoId !== null) {
                if (method === 'GET') {
                    return await getIdolMusicVideo(
                        env,
                        idolMusicVideoId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseIdolRequest(request)

                    return await updateIdolMusicVideo(
                        env,
                        idolMusicVideoId,
                        parsed.body as IdolMusicVideoPayload,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteIdolMusicVideo(
                        env,
                        idolMusicVideoId,
                    )
                }
            }

            /* =========================
               GROUP ACTIVITIES
            ========================= */

            const idolGroupActivitiesMatch =
                pathname.match(
                    /^\/api\/idol\/groups\/(\d+)\/activities$/,
                )

            if (idolGroupActivitiesMatch) {
                const groupId =
                    Number(
                        idolGroupActivitiesMatch[1],
                    )

                if (method === 'GET') {
                    return await getIdolActivities(
                        env,
                        groupId,
                    )
                }

                if (method === 'POST') {
                    const parsed = await parseIdolRequest(request)

                    return await createIdolActivity(
                        env,
                        groupId,
                        parsed.body as IdolActivityPayload,
                        parsed.image,
                    )
                }
            }

            /* =========================
               IDOL ACTIVITY DETAIL
            ========================= */

            const idolActivityId =
                getIdolActivityId(pathname)

            if (idolActivityId !== null) {
                if (method === 'GET') {
                    return await getIdolActivity(
                        env,
                        idolActivityId,
                    )
                }

                if (method === 'PUT') {
                    const parsed = await parseIdolRequest(request)

                    return await updateIdolActivity(
                        env,
                        idolActivityId,
                        parsed.body as IdolActivityPayload,
                        parsed.image,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteIdolActivity(
                        env,
                        idolActivityId,
                    )
                }
            }

            /* =========================
               ALL IDOL ACTIVITIES
            ========================= */

            if (
                pathname ===
                '/api/idol/activities'
            ) {
                if (method === 'GET') {
                    return await getAllIdolActivities(env)
                }
            }

            /* =========================
               PAYMENT ROUTES
            ========================= */

            if (
                (pathname === '/api/payments/webhook' ||
                    pathname === '/v1.0/debit/notify') &&
                method === 'POST'
            ) {
                return await handleDanaWebhook(
                    request,
                    env,
                )
            }

            if (
                pathname === '/api/payments/final/create' &&
                method === 'POST'
            ) {
                const body = await request.json<{
                    order_number?: unknown
                    payment_token?: unknown
                }>()
                return await createFinalPayment(env, body)
            }

            if (
                pathname === '/api/payments/create' &&
                method === 'POST'
            ) {
                const body =
                    await request.json<CreatePaymentPayload>()

                return await createPayment(
                    env,
                    body,
                )
            }

            const paymentStatusMatch =
                pathname.match(
                    /^\/api\/payments\/([^/]+)\/status$/,
                )

            if (
                paymentStatusMatch &&
                method === 'GET'
            ) {
                const paymentReference =
                    decodeURIComponent(
                        paymentStatusMatch[1],
                    )
                if (!/^[A-Za-z0-9_-]{8,64}$/.test(paymentReference)) {
                    return json({ success: false, message: 'Invalid payment reference.' }, 400)
                }

                return await getPaymentStatus(
                    env,
                    paymentReference,
                    (url.searchParams.get('token') || '').trim(),
                )
            }

            /* =========================
               PUBLIC ORDER TRACKING
      
               IMPORTANT:
               Harus sebelum /api/orders/:id
            ========================= */

            const trackingPrefix =
                '/api/orders/track/'

            if (
                pathname.startsWith(
                    trackingPrefix,
                ) &&
                method === 'GET'
            ) {
                const orderNumber =
                    decodeURIComponent(
                        pathname.substring(
                            trackingPrefix.length,
                        ),
                    )
                const paymentToken = (url.searchParams.get('token') || '').trim()

                if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderNumber) || !paymentToken || paymentToken.length < 32 || paymentToken.length > 256) {
                    return json(
                        {
                            success: false,
                            message:
                                'Order number is required.',
                        },
                        400,
                    )
                }

                return await trackOrder(
                    env,
                    orderNumber,
                    paymentToken,
                )
            }

            /* =========================
               ORDERS
            ========================= */

            if (pathname === '/api/orders') {
                if (method === 'GET') {
                    return await getOrders(env)
                }

                if (method === 'POST') {
                    const body =
                        await request.json<OrderPayload>()

                    return await createOrder(
                        env,
                        body,
                    )
                }
            }

            const orderId =
                getOrderId(pathname)

            if (orderId !== null) {
                if (method === 'PUT') {
                    const body =
                        await request.json<{
                            status?: unknown
                        }>()

                    return await updateOrder(
                        env,
                        orderId,
                        body,
                    )
                }

                if (method === 'DELETE') {
                    return await deleteOrder(
                        env,
                        orderId,
                    )
                }
            }


            /* =========================
               PROMOTIONS
            ========================= */

            if (pathname === '/api/promotions') {
                if (method === 'GET') {
                    return await getPromotions(env)
                }

                if (method === 'POST') {
                    const body =
                        await request.json<PromotionPayload>()

                    return await createPromotion(
                        env,
                        body,
                    )
                }
            }

            const promotionId =
                getPromotionId(pathname)

            if (promotionId !== null) {
                if (method === 'GET') {
                    return await getPromotion(
                        env,
                        promotionId,
                    )
                }

                if (method === 'PUT') {
                    const body =
                        await request.json<PromotionPayload>()

                    return await updatePromotion(
                        env,
                        promotionId,
                        body,
                    )
                }

                if (method === 'DELETE') {
                    return await deletePromotion(
                        env,
                        promotionId,
                    )
                }
            }

            /* =========================
               NEWS
            ========================= */

            if (pathname === '/api/news') {
                if (method === 'GET') {
                    const includeDraft = url.searchParams.get('include_draft') === 'true'
                    const news = await getNews(env, includeDraft)

                    return json({
                        success: true,
                        data: news,
                    })
                }

                if (method === 'POST') {
                    const parsed = await parseNewsRequest(request)
                    return await createNews(env, parsed.body, parsed.image)
                }
            }

            const newsId = getNewsId(pathname)

            if (newsId !== null) {
                if (method === 'GET') {
                    const news = await getNewsItem(env, newsId)

                    if (!news) {
                        return json({
                            success: false,
                            message: 'News not found.',
                        }, 404)
                    }

                    return json({
                        success: true,
                        data: news,
                    })
                }

                if (method === 'PUT') {
                    const parsed = await parseNewsRequest(request)
                    return await updateNews(env, newsId, parsed.body, parsed.image)
                }

                if (method === 'DELETE') {
                    return await deleteNews(env, newsId)
                }
            }


            /* =========================
               BUSINESS SYSTEM ROUTES
            ========================= */

            // Make sure every business endpoint uses the currently bound D1 schema.
            await ensureBusinessSchema(env)

            if (pathname === '/api/admin/members') {
                const auth = await requirePermission(request, env, 'members:read'); if (auth instanceof Response) return auth
                if (method === 'GET') return await getBusinessMembers(env)
                if (method === 'POST') return await createBusinessMember(env, await request.json<BusinessMemberPayload>(), auth.user.id)
            }
            const memberId = businessId(pathname, /^\/api\/admin\/members\/(\d+)$/)
            if (memberId !== null) {
                const auth = await requirePermission(request, env, 'members:write'); if (auth instanceof Response) return auth
                if (method === 'PUT') return await updateBusinessMember(env, memberId, await request.json<BusinessMemberPayload>(), auth.user.id)
                if (method === 'DELETE') return await deleteBusinessMember(env, memberId, auth.user.id)
            }

            if (pathname === '/api/admin/projects') {
                const auth = await requirePermission(request, env, method === 'GET' ? 'projects:read' : 'projects:write'); if (auth instanceof Response) return auth
                if (method === 'GET') return await getBusinessProjects(env)
                if (method === 'POST') return await createBusinessProject(env, await request.json<BusinessProjectPayload>(), auth.user.id)
            }

            const projectCostsMatch = pathname.match(/^\/api\/admin\/projects\/(\d+)\/costs$/)
            if (projectCostsMatch) {
                const auth = await requirePermission(request, env, method === 'GET' ? 'finance:read' : 'finance:write'); if (auth instanceof Response) return auth
                const pid = Number(projectCostsMatch[1])
                if (method === 'GET') return await getProjectCosts(env, pid)
                if (method === 'POST') return await createProjectCost(env, pid, await request.json<ProjectCostPayload>(), auth.user.id)
            }
            const projectCostDeleteMatch = pathname.match(/^\/api\/admin\/projects\/(\d+)\/costs\/(\d+)$/)
            if (projectCostDeleteMatch && method === 'DELETE') {
                const auth = await requirePermission(request, env, 'finance:write'); if (auth instanceof Response) return auth
                return await deleteProjectCost(env, Number(projectCostDeleteMatch[1]), Number(projectCostDeleteMatch[2]), auth.user.id)
            }

            const projectMembersMatch = pathname.match(/^\/api\/admin\/projects\/(\d+)\/members$/)
            if (projectMembersMatch) {
                const auth = await requirePermission(request, env, 'projects:write'); if (auth instanceof Response) return auth
                if (method === 'PUT') return await assignBusinessProjectMembers(env, Number(projectMembersMatch[1]), await request.json<BusinessProjectPayload>(), auth.user.id)
            }
            const projectIdBusiness = businessId(pathname, /^\/api\/admin\/projects\/(\d+)$/)
            if (projectIdBusiness !== null) {
                const auth = await requirePermission(request, env, method === 'GET' ? 'projects:read' : 'projects:write'); if (auth instanceof Response) return auth
                if (method === 'GET') { const p = await getBusinessProjectById(env, projectIdBusiness); return p ? json({ success: true, data: p }) : json({ success: false, message: 'Project not found.' }, 404) }
                if (method === 'PUT') return await updateBusinessProject(env, projectIdBusiness, await request.json<BusinessProjectPayload>(), auth.user.id)
            }

            if (pathname === '/api/admin/finance/summary' && method === 'GET') { const auth = await requirePermission(request, env, 'finance:read'); if (auth instanceof Response) return auth; return await getFinanceSummary(env) }
            if (pathname === '/api/admin/finance/transactions') {
                const auth = await requirePermission(request, env, method === 'GET' ? 'finance:read' : 'finance:write'); if (auth instanceof Response) return auth
                if (method === 'GET') return await getFinanceTransactions(env)
                if (method === 'POST') return await createFinanceTransaction(env, await request.json<BusinessTransactionPayload>(), auth.user.id)
            }
            const transactionId = businessId(pathname, /^\/api\/admin\/finance\/transactions\/(\d+)$/)
            if (transactionId !== null) { const auth = await requirePermission(request, env, 'finance:write'); if (auth instanceof Response) return auth; if (method === 'PUT') return await updateFinanceTransaction(env, transactionId, await request.json<BusinessTransactionPayload>(), auth.user.id); if (method === 'DELETE') return await deleteFinanceTransaction(env, transactionId, auth.user.id) }

            if (pathname === '/api/admin/revenue-sharing') { const auth = await requirePermission(request, env, method === 'GET' ? 'revenue:read' : 'revenue:write'); if (auth instanceof Response) return auth; if (method === 'GET') return await getRevenueSharings(env); if (method === 'POST') return await createRevenueSharing(env, await request.json<BusinessDistributionPayload>(), auth.user.id) }
            const distributionId = businessId(pathname, /^\/api\/admin\/revenue-sharing\/(\d+)$/)
            if (distributionId !== null) { const auth = await requirePermission(request, env, 'revenue:write'); if (auth instanceof Response) return auth; if (method === 'PUT' && url.searchParams.get('action') === 'approve') return await approveRevenueSharing(env, distributionId, auth.user.id); if (method === 'PUT' && url.searchParams.get('action') === 'pay') return await payRevenueSharing(env, distributionId, auth.user.id) }

            if (pathname === '/api/admin/documents') { const auth = await requirePermission(request, env, method === 'GET' ? 'documents:read' : 'documents:write'); if (auth instanceof Response) return auth; if (method === 'GET') return await getBusinessDocuments(env); if (method === 'POST') return await createBusinessDocument(env, await request.json<BusinessDocumentPayload>(), auth.user.id) }
            const documentId = businessId(pathname, /^\/api\/admin\/documents\/(\d+)$/)
            if (documentId !== null) { const auth = await requirePermission(request, env, 'documents:read'); if (auth instanceof Response) return auth; if (method === 'GET') return await getBusinessDocument(env, documentId) }

            if (pathname === '/api/admin/audit-logs' && method === 'GET') { const auth = await requirePermission(request, env, 'audit:read'); if (auth instanceof Response) return auth; return await getAuditLogs(env) }

            /* =========================
               NOT FOUND
            ========================= */

            return json(
                {
                    success: false,
                    message: 'Endpoint not found.',
                },
                404,
            )
        } catch (error) {
            console.error(
                'Worker error:',
                error,
            )

            return json(
                {
                    success: false,
                    message: 'Internal server error.',
                },
                500,
            )
        }
    },
}
