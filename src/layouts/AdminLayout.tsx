import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { ADMIN_NAV_LINKS } from '@/utils/constants'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Briefcase,
  Package,
  FolderOpen,
  FolderKanban,
  Music,
  Megaphone,
  Newspaper,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  Shield,
  UserRound,
  WalletCards,
  ChartNoAxesCombined,
  Files,
  ClipboardList,
  Bell,
  Check,
  ExternalLink,
  FileText,
} from 'lucide-react'

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Briefcase,
  Package,
  FolderOpen,
  FolderKanban,
  Music,
  Megaphone,
  Newspaper,
  Settings,
  UserRound,
  WalletCards,
  ChartNoAxesCombined,
  Files,
  ClipboardList,
  Bell,
  FileText,
}

type MenuGroup = {
  id: string
  label: string
  items: typeof ADMIN_NAV_LINKS[number][]
  collapsible?: boolean
}

function extractAdminToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    try {
      return extractAdminToken(JSON.parse(trimmed))
    } catch {
      return trimmed
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const tokenKeys = [
      'token',
      'access_token',
      'accessToken',
      'admin_token',
      'adminToken',
      'session_token',
      'sessionToken',
    ]

    for (const key of tokenKeys) {
      const candidate = record[key]
      if (
        typeof candidate === 'string' &&
        candidate.trim()
      ) {
        return candidate.trim()
      }
    }

    for (const key of [
      'data',
      'auth',
      'session',
      'user',
    ]) {
      const candidate = extractAdminToken(record[key])
      if (candidate) return candidate
    }
  }

  return null
}

function getStoredAdminTokens(): string[] {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token = extractAdminToken(value)
    if (token && !seen.has(token)) {
      seen.add(token)
      tokens.push(token)
    }
  }

  const preferredKeys = [
    '39production_admin_token',
    'token',
    'auth_token',
    'access_token',
    'accessToken',
    'admin_token',
    'adminToken',
    'session_token',
    'sessionToken',
    'auth',
    'adminAuth',
    'user',
  ]

  for (const storage of [
    window.localStorage,
    window.sessionStorage,
  ]) {
    for (const key of preferredKeys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore storage errors.
      }
    }

    // Fallback for existing auth implementations that use
    // a different storage key or JSON structure.
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (key && !preferredKeys.includes(key)) {
          add(storage.getItem(key))
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
  for (const token of getStoredAdminTokens()) {
    try {
      const response = await fetch(
        `${(import.meta.env.VITE_API_BASE_URL || 'https://39production-api.39production.workers.dev').replace(/\/+$/, '')}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        },
      )

      if (response.ok) return token
    } catch {
      // Try the next stored token.
    }
  }

  return null
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: number
    type: string
    title: string
    message: string
    reference_type: string | null
    reference_id: number | null
    reference_number: string | null
    is_read: number | boolean
    created_at: string
  }>>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [openGroups, setOpenGroups] = useState<
    Record<string, boolean>
  >({
    business: true,
    content: true,
    system: true,
  })

  const location = useLocation()

  const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'https://39production-api.39production.workers.dev'
  ).replace(/\/+$/, '')

  async function loadNotifications() {
    try {
      const token = await getAdminToken()
      if (!token) return

      const response = await fetch(
        `${API_BASE_URL}/api/admin/notifications`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        console.warn(
          `Load admin notifications failed: ${response.status}`,
        )
        return
      }

      const result = await response.json()

      if (!result?.success || !result?.data) return

      const nextNotifications = Array.isArray(
        result.data.notifications,
      )
        ? result.data.notifications
        : []

      setNotifications(nextNotifications)
      setUnreadCount(
        Number(result.data.unread_count || 0),
      )
    } catch (error) {
      console.error(
        'Load admin notifications error:',
        error,
      )
    }
  }

  async function markNotificationRead(id: number) {
    try {
      const token = await getAdminToken()
      if (!token) return

      const target = notifications.find(
        (item) => item.id === id,
      )
      const wasUnread =
        target &&
        (target.is_read === 0 ||
          target.is_read === false)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) return

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, is_read: 1 }
            : item,
        ),
      )

      if (wasUnread) {
        setUnreadCount((current) =>
          Math.max(0, current - 1),
        )
      }
    } catch (error) {
      console.error(
        'Mark notification read error:',
        error,
      )
    }
  }

  async function markAllNotificationsRead() {
    try {
      const token = await getAdminToken()
      if (!token) return

      const response = await fetch(
        `${API_BASE_URL}/api/admin/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) return

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: 1,
        })),
      )
      setUnreadCount(0)
    } catch (error) {
      console.error(
        'Mark all notifications read error:',
        error,
      )
    }
  }

  function notificationLink(item: { reference_type: string | null }) {
    if (item.reference_type === 'quote') return '/admin/quotes'
    if (item.reference_type === 'order') return '/admin/orders'
    return '/admin/dashboard'
  }

  function formatNotificationTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  /*
   * ==========================================
   * MENU GROUPING
   * ==========================================
   */

  const dashboardLink = ADMIN_NAV_LINKS.find(
    (link) => link.path === '/admin/dashboard',
  )

  const businessPaths = [
    '/admin/orders',
    '/admin/projects',
    '/admin/quotes',
    '/admin/members',
    '/admin/finance',
    '/admin/revenue-sharing',
    '/admin/documents',
    '/admin/audit-log',
  ]

  const contentPaths = [
    '/admin/services',
    '/admin/products',
    '/admin/portfolio',
    '/admin/idol',
    '/admin/promotions',
    '/admin/news',
  ]

  const systemPaths = [
    '/admin/settings',
  ]

  const businessItems = ADMIN_NAV_LINKS.filter((link) =>
    businessPaths.includes(link.path),
  )

  const contentItems = ADMIN_NAV_LINKS.filter((link) =>
    contentPaths.includes(link.path),
  )

  const systemItems = ADMIN_NAV_LINKS.filter((link) =>
    systemPaths.includes(link.path),
  )

  const menuGroups: MenuGroup[] = [
    {
      id: 'business',
      label: 'Business',
      items: businessItems,
      collapsible: true,
    },
    {
      id: 'content',
      label: 'Content',
      items: contentItems,
      collapsible: true,
    },
    {
      id: 'system',
      label: 'System',
      items: systemItems,
      collapsible: true,
    },
  ]

  /*
   * ==========================================
   * ACTIVE MENU
   * ==========================================
   */

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path
    }

    return location.pathname.startsWith(path)
  }

  /*
   * ==========================================
   * AUTO OPEN ACTIVE GROUP
   * ==========================================
   */

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      if (!mounted) return
      await loadNotifications()
    }

    // Load immediately when the admin layout mounts.
    refresh()

    // Poll frequently enough that a new quote/order appears
    // without requiring a page refresh.
    const interval = window.setInterval(
      refresh,
      10000,
    )

    const handleFocus = () => {
      refresh()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener(
      'visibilitychange',
      handleVisibility,
    )

    return () => {
      mounted = false
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      )
    }
  }, [])

  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some((item) =>
        isActive(item.path),
      ),
    )

    if (activeGroup) {
      setOpenGroups((current) => ({
        ...current,
        [activeGroup.id]: true,
      }))
    }
  }, [location.pathname])

  /*
   * ==========================================
   * TOGGLE GROUP
   * ==========================================
   */

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }))
  }

  /*
   * ==========================================
   * CLOSE SIDEBAR MOBILE
   * ==========================================
   */

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* =========================
          MOBILE OVERLAY
      ========================= */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${sidebarOpen
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
          }`}
        onClick={closeSidebar}
      />

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-default bg-bg-surface shadow-xl transition-all duration-300 ease-out lg:translate-x-0 lg:shadow-none ${sidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full'
          }`}
      >
        {/* =========================
            SIDEBAR HEADER
        ========================= */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-default px-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-1.5 text-text-muted transition-all duration-200 hover:rotate-90 hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================
            ADMIN BADGE
        ========================= */}
        <div className="mx-3 mt-3 shrink-0">
          <div className="flex items-center gap-2 rounded-lg bg-brand-primary/10 px-3 py-2 transition-all duration-300 hover:bg-brand-primary/15">
            <Shield className="h-4 w-4 shrink-0 text-brand-primary" />

            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              Admin Panel
            </span>
          </div>
        </div>

        {/* =========================
            NAVIGATION
        ========================= */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin">
          {/* =========================
              DASHBOARD
          ========================= */}
          {dashboardLink && (
            <div>
              <Link
                to={dashboardLink.path}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${isActive(
                  dashboardLink.path,
                )
                  ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                  : 'text-text-secondary hover:translate-x-1 hover:bg-bg-elevated hover:text-text-primary'
                  }`}
              >
                {/* Active indicator */}
                <span
                  className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-primary transition-all duration-300 ${isActive(
                    dashboardLink.path,
                  )
                    ? 'opacity-100'
                    : 'opacity-0'
                    }`}
                />

                {(() => {
                  const IconComponent =
                    iconMap[
                    dashboardLink.icon
                    ]

                  return IconComponent ? (
                    <IconComponent
                      className={`h-5 w-5 shrink-0 transition-all duration-200 ${isActive(
                        dashboardLink.path,
                      )
                        ? 'scale-110'
                        : 'group-hover:scale-110'
                        }`}
                    />
                  ) : null
                })()}

                <span className="truncate">
                  {dashboardLink.label}
                </span>

                <ChevronRight
                  className={`ml-auto h-4 w-4 shrink-0 transition-all duration-200 ${isActive(
                    dashboardLink.path,
                  )
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                    }`}
                />
              </Link>
            </div>
          )}

          {/* =========================
              MENU GROUPS
          ========================= */}
          {menuGroups.map((group) => {
            const groupIsActive =
              group.items.some((item) =>
                isActive(item.path),
              )

            const isOpen =
              openGroups[group.id]

            return (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  type="button"
                  onClick={() =>
                    toggleGroup(group.id)
                  }
                  className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${groupIsActive
                    ? 'text-brand-primary'
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text-secondary'
                    }`}
                >
                  <span>
                    {group.label}
                  </span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen
                      ? 'rotate-0'
                      : '-rotate-90'
                      }`}
                  />
                </button>

                {/* Group Items */}
                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1">
                      {group.items.map(
                        (link, index) => {
                          const IconComponent =
                            iconMap[
                            link.icon
                            ]

                          const active =
                            isActive(
                              link.path,
                            )

                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={
                                closeSidebar
                              }
                              style={{
                                animationDelay: `${index * 35}ms`,
                              }}
                              className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${active
                                ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                                : 'text-text-secondary hover:translate-x-1 hover:bg-bg-elevated hover:text-text-primary'
                                }`}
                            >
                              {/* Active indicator */}
                              <span
                                className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-primary transition-all duration-300 ${active
                                  ? 'opacity-100'
                                  : 'opacity-0'
                                  }`}
                              />

                              {/* Icon */}
                              {IconComponent && (
                                <IconComponent
                                  className={`h-5 w-5 shrink-0 transition-all duration-200 ${active
                                    ? 'scale-110'
                                    : 'group-hover:scale-110'
                                    }`}
                                />
                              )}

                              {/* Label */}
                              <span className="truncate">
                                {link.label}
                              </span>

                              {/* Active Arrow */}
                              <ChevronRight
                                className={`ml-auto h-4 w-4 shrink-0 transition-all duration-200 ${active
                                  ? 'translate-x-0 opacity-100'
                                  : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                                  }`}
                              />
                            </Link>
                          )
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* =========================
            SIDEBAR FOOTER
        ========================= */}
        <div className="shrink-0 border-t border-border-default p-3">
          <Link
            to="/"
            onClick={closeSidebar}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-all duration-200 hover:translate-x-1 hover:bg-bg-elevated hover:text-text-primary"
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span>
              Back to Site
            </span>
          </Link>
        </div>
      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}
      <div className="min-h-screen lg:pl-64">
        {/* =========================
            FIXED HEADER
        ========================= */}
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-border-default bg-bg-base/85 px-4 backdrop-blur-xl transition-all duration-300 lg:left-64 lg:px-8">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary active:scale-95 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
          </button>

          {/* Page Title */}
          <h1 className="animate-[fadeInDown_0.4s_ease-out] text-lg font-semibold text-text-primary">
            Admin Dashboard
          </h1>

          <div className="flex-1" />

          {/* =========================
              NOTIFICATIONS
          ========================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((current) => !current)
                loadNotifications()
              }}
              className="relative rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary active:scale-95"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-bg-base bg-brand-primary px-1 text-[9px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                />

                <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-brand-primary transition-colors hover:bg-brand-primary/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[24rem] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
                          <Bell className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">No notifications</p>
                        <p className="mt-1 text-xs text-text-muted">New orders and quote requests will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const unread = item.is_read === 0 || item.is_read === false

                        return (
                          <Link
                            key={item.id}
                            to={notificationLink(item)}
                            onClick={() => {
                              if (unread) markNotificationRead(item.id)
                              setNotificationsOpen(false)
                            }}
                            className={`block border-b border-border-default px-4 py-3 transition-colors hover:bg-bg-elevated ${unread ? 'bg-brand-primary/[0.04]' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.type === 'quote' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {item.type === 'quote' ? <FileText className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs ${unread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                                    {item.title}
                                  </p>
                                  {unread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />}
                                </div>
                                <p className="mt-1 truncate text-xs text-text-secondary">
                                  {item.message}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-muted">
                                  <span>{item.reference_number || ''}</span>
                                  <span>•</span>
                                  <span>{formatNotificationTime(item.created_at)}</span>
                                  <ExternalLink className="ml-auto h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-secondary to-brand-accent shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md" />

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-base bg-green-500" />
            </div>

            <span className="hidden text-sm font-medium text-text-primary md:block">
              Admin
            </span>
          </div>
        </header>

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <main className="min-h-screen pt-16">
          <div className="animate-[fadeInUp_0.45s_ease-out] p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}