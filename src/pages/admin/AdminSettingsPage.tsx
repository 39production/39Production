import {
  Bell,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react'
import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  authenticatedFetch,
  changePassword,
  getCurrentUser,
  logout,
  type AuthUser,
} from '@/lib/auth'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface SiteSettings {
  id?: number
  site_name: string
  admin_name: string
  admin_email: string
  notifications_enabled: boolean
  updated_at?: string
}

type AdminTheme = 'dark' | 'light'

interface ThemeTokens {
  page: string
  surface: string
  elevated: string
  input: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  hover: string
  placeholder: string
}

function useAdminTheme() {
  const readTheme = (): AdminTheme =>
    document.documentElement.dataset.adminTheme ===
      'light'
      ? 'light'
      : 'dark'

  const [theme, setTheme] =
    useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme())
    }

    syncTheme()

    const observer =
      new MutationObserver(syncTheme)

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['data-admin-theme'],
      },
    )

    return () =>
      observer.disconnect()
  }, [])

  return theme
}

function getThemeTokens(
  theme: AdminTheme,
): ThemeTokens {
  if (theme === 'light') {
    return {
      page: 'bg-[#f7f7fa]',
      surface: 'bg-white',
      elevated: 'bg-neutral-50',
      input: 'bg-white',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-500',
      hover: 'hover:bg-neutral-50',
      placeholder:
        'placeholder:text-neutral-400',
    }
  }

  return {
    page: 'bg-[#0b0b0f]',
    surface: 'bg-[#15151b]',
    elevated: 'bg-[#1b1b22]',
    input: 'bg-[#0f0f13]',
    border: 'border-white/[0.08]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/45',
    hover: 'hover:bg-white/[0.04]',
    placeholder:
      'placeholder:text-white/30',
  }
}

export function AdminSettingsPage() {
  const navigate = useNavigate()
  const theme = useAdminTheme()
  const tokens = getThemeTokens(theme)

  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [siteName, setSiteName] =
    useState('')
  const [notifications, setNotifications] =
    useState(true)

  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)
  const [loggingOut, setLoggingOut] =
    useState(false)

  const [
    isPasswordModalOpen,
    setIsPasswordModalOpen,
  ] = useState(false)

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false)

  const [message, setMessage] =
    useState('')
  const [error, setError] =
    useState('')

  const inputClass = [
    'w-full rounded-lg border px-4 py-3 text-sm outline-none transition',
    tokens.border,
    tokens.input,
    tokens.textPrimary,
    tokens.placeholder,
    'focus:border-violet-500',
    'disabled:cursor-not-allowed',
    'disabled:opacity-60',
  ].join(' ')

  const sectionClass = [
    'rounded-xl border p-6',
    tokens.border,
    tokens.surface,
  ].join(' ')

  const smallPanelClass = [
    'rounded-lg border',
    tokens.border,
    tokens.elevated,
  ].join(' ')

  useEffect(() => {
    let mounted = true

    async function loadSettings() {
      try {
        setLoading(true)
        setError('')

        const [
          currentUser,
          response,
        ] = await Promise.all([
          getCurrentUser(),
          authenticatedFetch(
            `${API_BASE_URL}/api/settings`,
          ),
        ])

        if (!response.ok) {
          const result =
            await response
              .json()
              .catch(() => null)

          throw new Error(
            result?.message ||
            'Failed to load settings.',
          )
        }

        const result =
          (await response.json()) as {
            success: boolean
            message?: string
            data?: SiteSettings
          }

        if (
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
            'Failed to load settings.',
          )
        }

        if (!mounted) {
          return
        }

        setUser(currentUser)

        setName(
          result.data.admin_name ||
          currentUser.name ||
          '',
        )

        setEmail(
          result.data.admin_email ||
          currentUser.email ||
          '',
        )

        setSiteName(
          result.data.site_name || '',
        )

        setNotifications(
          Boolean(
            result.data
              .notifications_enabled,
          ),
        )
      } catch (error) {
        if (!mounted) {
          return
        }

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load settings.',
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSaveChanges(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    const trimmedName =
      name.trim()

    const trimmedEmail =
      email.trim().toLowerCase()

    const trimmedSiteName =
      siteName.trim()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      setError(
        'Please enter a valid email address.',
      )
      return
    }

    if (!trimmedSiteName) {
      setError(
        'Website name is required.',
      )
      return
    }

    try {
      setSaving(true)

      const response =
        await authenticatedFetch(
          `${API_BASE_URL}/api/settings`,
          {
            method: 'PUT',
            body: JSON.stringify({
              admin_name:
                trimmedName,
              admin_email:
                trimmedEmail,
              site_name:
                trimmedSiteName,
              notifications_enabled:
                notifications,
            }),
          },
        )

      const result =
        (await response.json()) as {
          success: boolean
          message?: string
          data?: SiteSettings
        }

      if (
        response.status === 401
      ) {
        navigate('/login', {
          replace: true,
        })
        return
      }

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result.message ||
          'Failed to save settings.',
        )
      }

      setName(
        result.data.admin_name,
      )

      setEmail(
        result.data.admin_email,
      )

      setSiteName(
        result.data.site_name,
      )

      setNotifications(
        Boolean(
          result.data
            .notifications_enabled,
        ),
      )

      setUser((previous) =>
        previous
          ? {
            ...previous,
            name:
              result.data
                ?.admin_name ||
              previous.name,
            email:
              result.data
                ?.admin_email ||
              previous.email,
          }
          : previous,
      )

      setMessage(
        result.message ||
        'Settings have been saved successfully.',
      )

      window.setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save settings.',
      )
    } finally {
      setSaving(false)
    }
  }

  function openPasswordModal() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('')
    setIsPasswordModalOpen(true)
  }

  function closePasswordModal(
    force = false,
  ) {
    if (
      changingPassword &&
      !force
    ) {
      return
    }

    setIsPasswordModalOpen(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!currentPassword) {
      setError(
        'Current password is required.',
      )
      return
    }

    if (!newPassword) {
      setError(
        'New password is required.',
      )
      return
    }

    if (newPassword.length < 6) {
      setError(
        'New password must be at least 6 characters.',
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.',
      )
      return
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setError(
        'New password must be different from the current password.',
      )
      return
    }

    try {
      setChangingPassword(true)

      await changePassword(
        currentPassword,
        newPassword,
      )

      closePasswordModal(true)

      navigate('/login', {
        replace: true,
        state: {
          message:
            'Password changed successfully. Please login again.',
        },
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to change password.',
      )
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await logout()

      navigate('/login', {
        replace: true,
      })
    } catch {
      navigate('/login', {
        replace: true,
      })
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div
        className={[
          'flex min-h-[400px] items-center justify-center',
          tokens.page,
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center gap-2 text-sm',
            tokens.textMuted,
          ].join(' ')}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'min-h-full space-y-8',
        tokens.page,
      ].join(' ')}
    >
      {/* HEADER */}
      <div>
        <p
          className={[
            'text-sm',
            tokens.textMuted,
          ].join(' ')}
        >
          System Configuration
        </p>

        <h1
          className={[
            'mt-1 font-display text-3xl font-bold',
            tokens.textPrimary,
          ].join(' ')}
        >
          Settings
        </h1>

        <p
          className={[
            'mt-2 text-sm',
            tokens.textSecondary,
          ].join(' ')}
        >
          Manage your administrator account,
          website configuration, notifications,
          and security.
        </p>
      </div>

      {/* FEEDBACK */}
      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {message}
        </div>
      )}

      {error &&
        !isPasswordModalOpen && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

      <form
        onSubmit={handleSaveChanges}
        className="space-y-8"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ADMIN PROFILE */}
          <section className={sectionClass}>
            <SectionHeader
              icon={
                <User className="h-5 w-5" />
              }
              title="Admin Profile"
              description="Update your account information."
              theme={theme}
            />

            <div className="space-y-5">
              <Field
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Admin name"
                disabled={saving}
                theme={theme}
              />

              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="admin@example.com"
                disabled={saving}
                theme={theme}
              />

              {user && (
                <div className={smallPanelClass}>
                  <div className="px-4 py-3">
                    <p
                      className={[
                        'text-xs',
                        tokens.textMuted,
                      ].join(' ')}
                    >
                      Account Status
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      <p className="text-sm font-medium text-emerald-500">
                        {user.status}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* WEBSITE */}
          <section className={sectionClass}>
            <SectionHeader
              icon={
                <Globe className="h-5 w-5" />
              }
              title="Website"
              description="General website configuration."
              theme={theme}
            />

            <div className="space-y-5">
              <Field
                label="Website Name"
                value={siteName}
                onChange={setSiteName}
                placeholder="Website name"
                disabled={saving}
                theme={theme}
              />

              <div>
                <label
                  className={[
                    'mb-2 block text-sm font-medium',
                    tokens.textPrimary,
                  ].join(' ')}
                >
                  Website Status
                </label>

                <div
                  className={[
                    'flex items-center justify-between rounded-lg border px-4 py-3',
                    tokens.border,
                    tokens.elevated,
                  ].join(' ')}
                >
                  <div>
                    <p
                      className={[
                        'text-sm font-medium',
                        tokens.textPrimary,
                      ].join(' ')}
                    >
                      Website Online
                    </p>

                    <p
                      className={[
                        'mt-1 text-xs',
                        tokens.textMuted,
                      ].join(' ')}
                    >
                      Your public website is
                      currently accessible.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className={sectionClass}>
            <SectionHeader
              icon={
                <Bell className="h-5 w-5" />
              }
              title="Notifications"
              description="Control admin notifications."
              theme={theme}
            />

            <div className="space-y-3">
              <label
                className={[
                  'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors',
                  tokens.border,
                  tokens.elevated,
                  theme === 'light'
                    ? 'hover:border-violet-300'
                    : 'hover:border-violet-500/40',
                ].join(' ')}
              >
                <div>
                  <p
                    className={[
                      'text-sm font-medium',
                      tokens.textPrimary,
                    ].join(' ')}
                  >
                    Email Notifications
                  </p>

                  <p
                    className={[
                      'mt-1 text-xs',
                      tokens.textMuted,
                    ].join(' ')}
                  >
                    Receive notifications for
                    new orders.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) =>
                    setNotifications(
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                  className="h-4 w-4 accent-violet-600"
                />
              </label>

              <div
                className={[
                  'rounded-lg border px-4 py-3',
                  tokens.border,
                  tokens.elevated,
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={[
                        'text-sm font-medium',
                        tokens.textPrimary,
                      ].join(' ')}
                    >
                      Notification Status
                    </p>

                    <p
                      className={[
                        'mt-1 text-xs',
                        tokens.textMuted,
                      ].join(' ')}
                    >
                      {notifications
                        ? 'New order notifications are enabled.'
                        : 'New order notifications are disabled.'}
                    </p>
                  </div>

                  <span
                    className={[
                      'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                      notifications
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : theme === 'light'
                          ? 'bg-neutral-100 text-neutral-500'
                          : 'bg-white/5 text-white/45',
                    ].join(' ')}
                  >
                    {notifications
                      ? 'Enabled'
                      : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className={sectionClass}>
            <SectionHeader
              icon={
                <Shield className="h-5 w-5" />
              }
              title="Security"
              description="Manage account security."
              theme={theme}
            />

            <div className="space-y-4">
              <div
                className={[
                  'rounded-lg border p-4',
                  tokens.border,
                  tokens.elevated,
                ].join(' ')}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-lg bg-violet-500/10 p-2 text-violet-500">
                    <Shield className="h-4 w-4" />
                  </div>

                  <div>
                    <p
                      className={[
                        'text-sm font-medium',
                        tokens.textPrimary,
                      ].join(' ')}
                    >
                      Account Security
                    </p>

                    <p
                      className={[
                        'mt-1 text-xs leading-5',
                        tokens.textMuted,
                      ].join(' ')}
                    >
                      Your password is securely
                      hashed and never stored as
                      plain text.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    openPasswordModal
                  }
                  className={[
                    'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                    tokens.border,
                    tokens.textPrimary,
                    tokens.hover,
                  ].join(' ')}
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}

                  {loggingOut
                    ? 'Signing Out...'
                    : 'Sign Out'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* SAVE */}
        <div
          className={[
            'flex justify-end border-t pt-6',
            tokens.border,
          ].join(' ')}
        >
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]">
          <div
            className={[
              'w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl',
              tokens.border,
              tokens.surface,
            ].join(' ')}
          >
            {/* MODAL HEADER */}
            <div
              className={[
                'flex items-center justify-between border-b px-6 py-5',
                tokens.border,
              ].join(' ')}
            >
              <div>
                <h2
                  className={[
                    'font-display text-xl font-bold',
                    tokens.textPrimary,
                  ].join(' ')}
                >
                  Change Password
                </h2>

                <p
                  className={[
                    'mt-1 text-sm',
                    tokens.textMuted,
                  ].join(' ')}
                >
                  Update your administrator
                  password.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  closePasswordModal()
                }
                disabled={changingPassword}
                className={[
                  'rounded-lg p-2 transition-colors disabled:opacity-50',
                  tokens.textMuted,
                  tokens.hover,
                ].join(' ')}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                handlePasswordChange
              }
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Field
                  label="Current Password"
                  value={currentPassword}
                  onChange={
                    setCurrentPassword
                  }
                  type="password"
                  placeholder="Enter current password"
                  disabled={
                    changingPassword
                  }
                  theme={theme}
                />

                <Field
                  label="New Password"
                  value={newPassword}
                  onChange={
                    setNewPassword
                  }
                  type="password"
                  placeholder="Minimum 6 characters"
                  disabled={
                    changingPassword
                  }
                  theme={theme}
                />

                <Field
                  label="Confirm New Password"
                  value={
                    confirmPassword
                  }
                  onChange={
                    setConfirmPassword
                  }
                  type="password"
                  placeholder="Repeat new password"
                  disabled={
                    changingPassword
                  }
                  theme={theme}
                />
              </div>

              <div
                className={[
                  'flex justify-end gap-3 border-t px-6 py-5',
                  tokens.border,
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() =>
                    closePasswordModal()
                  }
                  disabled={
                    changingPassword
                  }
                  className={[
                    'rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
                    tokens.border,
                    tokens.textSecondary,
                    tokens.hover,
                  ].join(' ')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {changingPassword
                    ? 'Updating...'
                    : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
  theme,
}: {
  icon: React.ReactNode
  title: string
  description: string
  theme: AdminTheme
}) {
  const tokens =
    getThemeTokens(theme)

  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
        {icon}
      </div>

      <div>
        <h2
          className={[
            'font-semibold',
            tokens.textPrimary,
          ].join(' ')}
        >
          {title}
        </h2>

        <p
          className={[
            'text-xs',
            tokens.textMuted,
          ].join(' ')}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  theme,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  theme: AdminTheme
}) {
  const tokens =
    getThemeTokens(theme)

  const inputClass = [
    'w-full rounded-lg border px-4 py-3 text-sm outline-none transition',
    tokens.border,
    tokens.input,
    tokens.textPrimary,
    tokens.placeholder,
    'focus:border-violet-500',
    'disabled:cursor-not-allowed',
    'disabled:opacity-60',
  ].join(' ')

  return (
    <div>
      <label
        className={[
          'mb-2 block text-sm font-medium',
          tokens.textPrimary,
        ].join(' ')}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={inputClass}
      />
    </div>
  )
}