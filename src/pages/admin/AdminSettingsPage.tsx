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
  FormEvent,
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

export function AdminSettingsPage() {
  const navigate = useNavigate()

  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

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

  function closePasswordModal() {
    if (changingPassword) {
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

      setIsPasswordModalOpen(false)

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-sm text-text-muted">
          Admin Panel
        </p>

        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
          Settings
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Manage your account and website configuration.
        </p>
      </div>

      {/* FEEDBACK */}
      {message && (
        <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {error &&
        !isPasswordModalOpen && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

      <form
        onSubmit={handleSaveChanges}
        className="space-y-8"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ADMIN PROFILE */}
          <section className="rounded-xl border border-border-default bg-bg-surface p-6">
            <SectionHeader
              icon={
                <User className="h-5 w-5" />
              }
              title="Admin Profile"
              description="Update your account information."
            />

            <div className="space-y-5">
              <Field
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Admin name"
                disabled={saving}
              />

              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="admin@example.com"
                disabled={saving}
              />

              {user && (
                <div className="rounded-lg border border-border-default bg-bg-base px-4 py-3">
                  <p className="text-xs text-text-muted">
                    Account status
                  </p>

                  <p className="mt-1 text-sm font-medium text-green-400">
                    {user.status}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* WEBSITE */}
          <section className="rounded-xl border border-border-default bg-bg-surface p-6">
            <SectionHeader
              icon={
                <Globe className="h-5 w-5" />
              }
              title="Website"
              description="General website configuration."
            />

            <div className="space-y-5">
              <Field
                label="Website Name"
                value={siteName}
                onChange={setSiteName}
                placeholder="Website name"
                disabled={saving}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Website Status
                </label>

                <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-base px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Website Online
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Your public website is currently accessible.
                    </p>
                  </div>

                  <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="rounded-xl border border-border-default bg-bg-surface p-6">
            <SectionHeader
              icon={
                <Bell className="h-5 w-5" />
              }
              title="Notifications"
              description="Control admin notifications."
            />

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border-default bg-bg-base p-4 transition-colors hover:border-brand-primary">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Email Notifications
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    Receive notifications for new orders.
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
                  className="h-4 w-4 accent-brand-primary"
                />
              </label>

              <div className="rounded-lg border border-border-default px-4 py-3">
                <p className="text-sm font-medium text-text-primary">
                  Notification Status
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {notifications
                    ? 'New order notifications are enabled.'
                    : 'New order notifications are disabled.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className="rounded-xl border border-border-default bg-bg-surface p-6">
            <SectionHeader
              icon={
                <Shield className="h-5 w-5" />
              }
              title="Security"
              description="Manage account security."
            />

            <div className="space-y-4">
              <div className="rounded-lg border border-border-default bg-bg-base p-4">
                <p className="text-sm font-medium text-text-primary">
                  Account Security
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Your password is securely hashed and never stored as plain text.
                </p>
              </div>

              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-base"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
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
          </section>
        </div>

        {/* SAVE */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  Update your administrator password.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closePasswordModal
                }
                disabled={
                  changingPassword
                }
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary disabled:opacity-50"
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
                  <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
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
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border-default px-6 py-5">
                <button
                  type="button"
                  onClick={
                    closePasswordModal
                  }
                  disabled={
                    changingPassword
                  }
                  className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
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
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-text-primary">
          {title}
        </h2>

        <p className="text-xs text-text-muted">
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
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
        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}