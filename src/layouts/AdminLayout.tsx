import {
  useEffect,
  useState,
  type ComponentType,
} from 'react'
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

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
  Sun,
  Moon,
} from 'lucide-react'

const iconMap: Record<
  string,
  ComponentType<{ className?: string }>
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

type ThemeMode = 'dark' | 'light'

type MenuGroup = {
  id: string
  label: string
  items: typeof ADMIN_NAV_LINKS[number][]
  collapsible?: boolean
}

function extractAdminToken(
  value: unknown,
): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return null
    }

    try {
      return extractAdminToken(
        JSON.parse(trimmed),
      )
    } catch {
      return trimmed
    }
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const record =
      value as Record<string, unknown>

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
      const candidate =
        extractAdminToken(
          record[key],
        )

      if (candidate) {
        return candidate
      }
    }
  }

  return null
}

function getStoredAdminTokens(): string[] {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token =
      extractAdminToken(value)

    if (
      token &&
      !seen.has(token)
    ) {
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
        add(
          storage.getItem(key),
        )
      } catch {
        // Ignore storage errors.
      }
    }

    try {
      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key =
          storage.key(index)

        if (
          key &&
          !preferredKeys.includes(key)
        ) {
          add(
            storage.getItem(key),
          )
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
  const API_BASE_URL = (
    import.meta.env
      .VITE_API_BASE_URL ||
    'https://39production-api.39production.workers.dev'
  ).replace(/\/+$/, '')

  for (
    const token of getStoredAdminTokens()
  ) {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        )

      if (response.ok) {
        return token
      }
    } catch {
      // Try next stored token.
    }
  }

  return null
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false)

  const [
    logoutOpen,
    setLogoutOpen,
  ] = useState(false)

  const [
    notifications,
    setNotifications,
  ] = useState<
    Array<{
      id: number
      type: string
      title: string
      message: string
      reference_type: string | null
      reference_id: number | null
      reference_number: string | null
      is_read: number | boolean
      created_at: string
    }>
  >([])

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0)

  const [
    theme,
    setTheme,
  ] = useState<ThemeMode>(() => {
    if (
      typeof window === 'undefined'
    ) {
      return 'light'
    }

    const stored =
      window.localStorage.getItem(
        '39production_admin_theme',
      )

    return stored === 'dark'
      ? 'dark'
      : 'light'
  })

  const [
    openGroups,
    setOpenGroups,
  ] = useState<
    Record<string, boolean>
  >({
    business: true,
    content: true,
    system: true,
  })

  const API_BASE_URL = (
    import.meta.env
      .VITE_API_BASE_URL ||
    'https://39production-api.39production.workers.dev'
  ).replace(/\/+$/, '')

  const isDark =
    theme === 'dark'

  /*
   * ==========================================
   * THEME
   * ==========================================
   */

  useEffect(() => {
    window.localStorage.setItem(
      '39production_admin_theme',
      theme,
    )

    document.documentElement.dataset.adminTheme =
      theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) =>
      current === 'dark'
        ? 'light'
        : 'dark',
    )
  }

  /*
   * ==========================================
   * NOTIFICATIONS
   * ==========================================
   */

  async function loadNotifications() {
    try {
      const token =
        await getAdminToken()

      if (!token) {
        return
      }

      const response =
        await fetch(
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

      const result =
        await response.json()

      if (
        !result?.success ||
        !result?.data
      ) {
        return
      }

      const nextNotifications =
        Array.isArray(
          result.data
            .notifications,
        )
          ? result.data.notifications
          : []

      setNotifications(
        nextNotifications,
      )

      setUnreadCount(
        Number(
          result.data
            .unread_count || 0,
        ),
      )
    } catch (error) {
      console.error(
        'Load admin notifications error:',
        error,
      )
    }
  }

  async function markNotificationRead(
    id: number,
  ) {
    try {
      const token =
        await getAdminToken()

      if (!token) {
        return
      }

      const target =
        notifications.find(
          (item) =>
            item.id === id,
        )

      const wasUnread =
        target &&
        (target.is_read === 0 ||
          target.is_read === false)

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/notifications/${id}/read`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                  ...item,
                  is_read: 1,
                }
                : item,
          ),
      )

      if (wasUnread) {
        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1,
            ),
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
      const token =
        await getAdminToken()

      if (!token) {
        return
      }

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/notifications/read-all`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              is_read: 1,
            }),
          ),
      )

      setUnreadCount(0)
    } catch (error) {
      console.error(
        'Mark all notifications read error:',
        error,
      )
    }
  }

  function notificationLink(
    item: {
      reference_type:
      | string
      | null
    },
  ) {
    if (
      item.reference_type ===
      'quote'
    ) {
      return '/admin/quotes'
    }

    if (
      item.reference_type ===
      'order'
    ) {
      return '/admin/orders'
    }

    return '/admin/dashboard'
  }

  function formatNotificationTime(
    value: string,
  ) {
    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return ''
    }

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(date)
  }

  /*
   * ==========================================
   * MENU GROUPING
   * ==========================================
   */

  const dashboardLink =
    ADMIN_NAV_LINKS.find(
      (link) =>
        link.path ===
        '/admin/dashboard',
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

  const businessItems =
    ADMIN_NAV_LINKS.filter(
      (link) =>
        businessPaths.includes(
          link.path,
        ),
    )

  const contentItems =
    ADMIN_NAV_LINKS.filter(
      (link) =>
        contentPaths.includes(
          link.path,
        ),
    )

  const systemItems =
    ADMIN_NAV_LINKS.filter(
      (link) =>
        systemPaths.includes(
          link.path,
        ),
    )

  const menuGroups: MenuGroup[] =
    [
      {
        id: 'business',
        label: 'Business',
        items:
          businessItems,
        collapsible:
          true,
      },
      {
        id: 'content',
        label: 'Content',
        items:
          contentItems,
        collapsible:
          true,
      },
      {
        id: 'system',
        label: 'System',
        items:
          systemItems,
        collapsible:
          true,
      },
    ]

  /*
   * ==========================================
   * ACTIVE MENU
   * ==========================================
   */

  const isActive = (
    path: string,
  ) => {
    if (
      path ===
      '/admin/dashboard'
    ) {
      return (
        location.pathname ===
        path
      )
    }

    return location.pathname.startsWith(
      path,
    )
  }

  /*
   * ==========================================
   * NOTIFICATION POLLING
   * ==========================================
   */

  useEffect(() => {
    let mounted = true

    const refresh =
      async () => {
        if (!mounted) {
          return
        }

        await loadNotifications()
      }

    refresh()

    const interval =
      window.setInterval(
        refresh,
        10000,
      )

    const handleFocus =
      () => {
        refresh()
      }

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          refresh()
        }
      }

    window.addEventListener(
      'focus',
      handleFocus,
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibility,
    )

    return () => {
      mounted = false

      window.clearInterval(
        interval,
      )

      window.removeEventListener(
        'focus',
        handleFocus,
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      )
    }
  }, [])

  /*
   * ==========================================
   * AUTO OPEN ACTIVE GROUP
   * ==========================================
   */

  useEffect(() => {
    const activeGroup =
      menuGroups.find(
        (group) =>
          group.items.some(
            (item) =>
              isActive(
                item.path,
              ),
          ),
      )

    if (activeGroup) {
      setOpenGroups(
        (current) => ({
          ...current,
          [activeGroup.id]:
            true,
        }),
      )
    }
  }, [
    location.pathname,
  ])

  /*
   * ==========================================
   * SIDEBAR
   * ==========================================
   */

  const toggleGroup = (
    groupId: string,
  ) => {
    setOpenGroups(
      (current) => ({
        ...current,
        [groupId]:
          !current[groupId],
      }),
    )
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout =
    () => {
      const storageKeys = [
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
        for (
          const key of storageKeys
        ) {
          try {
            storage.removeItem(
              key,
            )
          } catch {
            // Ignore storage errors.
          }
        }
      }

      setLogoutOpen(false)
      setSidebarOpen(false)
      setNotificationsOpen(false)

      navigate('/', {
        replace: true,
      })
    }

  /*
   * ==========================================
   * THEME COLORS
   * ==========================================
   */

  const pageBg = isDark
    ? 'bg-[#0b0b0f]'
    : 'bg-[#f7f7fa]'

  const sidebarBg = isDark
    ? 'bg-[#101014]'
    : 'bg-white'

  const headerBg = isDark
    ? 'bg-[#0b0b0f]/90'
    : 'bg-white/90'

  const surface = isDark
    ? 'bg-[#15151b]'
    : 'bg-white'

  const border = isDark
    ? 'border-white/[0.08]'
    : 'border-neutral-200'

  const borderSoft = isDark
    ? 'border-white/[0.06]'
    : 'border-neutral-100'

  const primaryText = isDark
    ? 'text-white'
    : 'text-neutral-950'

  const secondaryText = isDark
    ? 'text-white/55'
    : 'text-neutral-600'

  const mutedText = isDark
    ? 'text-white/30'
    : 'text-neutral-400'

  const hoverBg = isDark
    ? 'hover:bg-white/[0.045]'
    : 'hover:bg-neutral-50'

  return (
    <div
      className={`
        min-h-screen
        transition-colors
        duration-300
        ${pageBg}
        ${primaryText}
      `}
    >
      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}
      <div
        className={`
          fixed
          inset-0
          z-40
          backdrop-blur-sm
          transition-all
          duration-300
          lg:hidden

          ${sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
          }

          ${isDark
            ? 'bg-black/70'
            : 'bg-black/25'
          }
        `}
        onClick={closeSidebar}
      />

      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          transition-all
          duration-300
          ease-out
          lg:translate-x-0

          ${sidebarBg}
          ${border}

          ${sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
          }
        `}
      >
        {/* ====================================================
            SIDEBAR HEADER
            39PRODUCTION LOGO — tetap pakai Logo.tsx
        ==================================================== */}
        <div
          className={`
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            px-4

            ${border}
          `}
        >
          <div className="flex items-center">
            <Logo
              size="sm"
              showSubtext
            />
          </div>

          <button
            type="button"
            onClick={
              closeSidebar
            }
            className={`
              rounded-lg
              p-1.5
              transition-all
              duration-200
              hover:rotate-90
              lg:hidden

              ${secondaryText}
              ${hoverBg}
            `}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================================
            ADMIN BADGE
        ==================================================== */}
        <div className="mx-3 mt-3 shrink-0">
          <div
            className={`
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              px-3
              py-2.5

              ${isDark
                ? 'border-violet-400/15 bg-violet-500/[0.08]'
                : 'border-violet-200 bg-violet-50'
              }
            `}
          >
            <div
              className={`
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg

                ${isDark
                  ? 'bg-violet-500/[0.10]'
                  : 'bg-violet-100'
                }
              `}
            >
              <Shield
                className="
                  h-4
                  w-4
                  text-violet-500
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-violet-500
                "
              >
                Workspace
              </p>

              <p
                className={`
                  truncate
                  text-xs
                  font-semibold

                  ${isDark
                    ? 'text-white/85'
                    : 'text-neutral-800'
                  }
                `}
              >
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}
        <nav
          className="
            flex-1
            space-y-4
            overflow-y-auto
            px-3
            py-4
          "
        >
          {/* ==================================================
              DASHBOARD
          ================================================== */}
          {dashboardLink && (
            <div>
              <Link
                to={
                  dashboardLink.path
                }
                onClick={
                  closeSidebar
                }
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  overflow-hidden
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  duration-200

                  ${isActive(
                  dashboardLink.path,
                )
                    ? isDark
                      ? 'bg-violet-500/[0.11] text-violet-300'
                      : 'bg-violet-50 text-violet-700'
                    : isDark
                      ? 'text-white/55 hover:translate-x-1 hover:bg-white/[0.045] hover:text-white'
                      : 'text-neutral-600 hover:translate-x-1 hover:bg-neutral-50 hover:text-neutral-950'
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    left-0
                    top-1/2
                    h-6
                    w-0.5
                    -translate-y-1/2
                    rounded-r-full
                    bg-violet-500
                    transition-all
                    duration-300

                    ${isActive(
                    dashboardLink.path,
                  )
                      ? 'opacity-100'
                      : 'opacity-0'
                    }
                  `}
                />

                {(() => {
                  const IconComponent =
                    iconMap[
                    dashboardLink.icon
                    ]

                  return IconComponent ? (
                    <IconComponent
                      className="
                        h-5
                        w-5
                        shrink-0
                        transition-transform
                        duration-200
                        group-hover:scale-110
                      "
                    />
                  ) : null
                })()}

                <span className="truncate">
                  {
                    dashboardLink.label
                  }
                </span>

                <ChevronRight
                  className="
                    ml-auto
                    h-4
                    w-4
                    shrink-0
                    opacity-40
                  "
                />
              </Link>
            </div>
          )}

          {/* ==================================================
              MENU GROUPS
          ================================================== */}
          {menuGroups.map(
            (group) => {
              const groupIsActive =
                group.items.some(
                  (item) =>
                    isActive(
                      item.path,
                    ),
                )

              const isOpen =
                openGroups[
                group.id
                ]

              return (
                <div
                  key={
                    group.id
                  }
                >
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(
                        group.id,
                      )
                    }
                    className={`
                      mb-1
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      transition-colors

                      ${groupIsActive
                        ? 'text-violet-500'
                        : mutedText
                      }

                      ${hoverBg}
                    `}
                  >
                    <span>
                      {
                        group.label
                      }
                    </span>

                    <ChevronDown
                      className={`
                        h-3.5
                        w-3.5
                        transition-transform
                        duration-200

                        ${isOpen
                          ? 'rotate-0'
                          : '-rotate-90'
                        }
                      `}
                    />
                  </button>

                  {/* Group Items */}
                  <div
                    className={`
                      grid
                      transition-all
                      duration-300
                      ease-out

                      ${isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1">
                        {group.items.map(
                          (link) => {
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
                                key={
                                  link.path
                                }
                                to={
                                  link.path
                                }
                                onClick={
                                  closeSidebar
                                }
                                className={`
                                  group
                                  relative
                                  flex
                                  items-center
                                  gap-3
                                  overflow-hidden
                                  rounded-xl
                                  px-3
                                  py-2.5
                                  text-sm
                                  font-medium
                                  transition-all
                                  duration-200

                                  ${active
                                    ? isDark
                                      ? 'bg-violet-500/[0.11] text-violet-300'
                                      : 'bg-violet-50 text-violet-700'
                                    : isDark
                                      ? 'text-white/55 hover:translate-x-1 hover:bg-white/[0.045] hover:text-white'
                                      : 'text-neutral-600 hover:translate-x-1 hover:bg-neutral-50 hover:text-neutral-950'
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    absolute
                                    left-0
                                    top-1/2
                                    h-6
                                    w-0.5
                                    -translate-y-1/2
                                    rounded-r-full
                                    bg-violet-500
                                    transition-opacity

                                    ${active
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                    }
                                  `}
                                />

                                {IconComponent && (
                                  <IconComponent
                                    className="
                                      h-5
                                      w-5
                                      shrink-0
                                      transition-transform
                                      duration-200
                                      group-hover:scale-110
                                    "
                                  />
                                )}

                                <span className="truncate">
                                  {
                                    link.label
                                  }
                                </span>

                                <ChevronRight
                                  className="
                                    ml-auto
                                    h-4
                                    w-4
                                    shrink-0
                                    opacity-40
                                  "
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
            },
          )}
        </nav>

        {/* ====================================================
            SIDEBAR FOOTER
            Logout only
        ==================================================== */}
        <div
          className={`
            shrink-0
            border-t
            p-3

            ${border}
          `}
        >
          <button
            type="button"
            onClick={() =>
              setLogoutOpen(true)
            }
            className={`
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-sm
              font-medium
              transition-all
              duration-200
              hover:translate-x-1
              hover:text-red-500

              ${secondaryText}
              ${hoverBg}
            `}
          >
            <LogOut
              className="
                h-5
                w-5
                shrink-0
                transition-transform
                duration-200
                group-hover:-translate-x-0.5
              "
            />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}
      <div className="min-h-screen lg:pl-64">
        {/* ====================================================
            HEADER
        ==================================================== */}
        <header
          className={`
            fixed
            left-0
            right-0
            top-0
            z-30
            flex
            h-16
            items-center
            gap-3
            border-b
            px-4
            backdrop-blur-xl
            transition-colors
            duration-300
            lg:left-64
            lg:px-8

            ${headerBg}
            ${border}
          `}
        >
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className={`
              rounded-lg
              p-2
              transition-all
              duration-200
              hover:scale-105
              lg:hidden

              ${secondaryText}
              ${hoverBg}
            `}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <h1
            className={`
              text-lg
              font-semibold
              tracking-[-0.02em]

              ${primaryText}
            `}
          >
            Admin Dashboard
          </h1>

          <div className="flex-1" />

          {/* ==================================================
              THEME TOGGLE
          ================================================== */}
          <button
            type="button"
            onClick={
              toggleTheme
            }
            className={`
              inline-flex
              h-9
              items-center
              gap-2
              rounded-xl
              border
              px-3
              text-xs
              font-semibold
              transition-all
              duration-200
              hover:scale-[1.02]

              ${border}

              ${isDark
                ? 'bg-white/[0.03] text-white/60'
                : 'bg-neutral-50 text-neutral-700'
              }
            `}
            aria-label={`Switch to ${isDark
              ? 'light'
              : 'dark'
              } theme`}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />

                <span className="hidden sm:inline">
                  Light
                </span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-violet-600" />

                <span className="hidden sm:inline">
                  Dark
                </span>
              </>
            )}
          </button>

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(
                  (current) =>
                    !current,
                )

                loadNotifications()
              }}
              className={`
                relative
                rounded-xl
                p-2
                transition-all
                duration-200
                active:scale-95

                ${secondaryText}
                ${hoverBg}
              `}
              aria-label="Notifications"
              aria-expanded={
                notificationsOpen
              }
            >
              <Bell className="h-5 w-5" />

              {unreadCount >
                0 && (
                  <span
                    className={`
                    absolute
                    -right-0.5
                    -top-0.5
                    flex
                    min-h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    px-1
                    text-[9px]
                    font-bold
                    text-white
                    bg-violet-500

                    ${isDark
                        ? 'border-[#0b0b0f]'
                        : 'border-white'
                      }
                  `}
                  >
                    {unreadCount >
                      99
                      ? '99+'
                      : unreadCount}
                  </span>
                )}
            </button>

            {notificationsOpen && (
              <>
                <button
                  type="button"
                  className="
                    fixed
                    inset-0
                    z-40
                    cursor-default
                  "
                  onClick={() =>
                    setNotificationsOpen(
                      false,
                    )
                  }
                  aria-label="Close notifications"
                />

                <div
                  className={`
                    absolute
                    right-0
                    top-12
                    z-50
                    w-[min(24rem,calc(100vw-2rem))]
                    overflow-hidden
                    rounded-2xl
                    border
                    shadow-2xl

                    ${surface}
                    ${border}
                  `}
                >
                  {/* Notification header */}
                  <div
                    className={`
                      flex
                      items-center
                      justify-between
                      border-b
                      px-4
                      py-3

                      ${border}
                    `}
                  >
                    <div>
                      <h2
                        className={`
                          text-sm
                          font-semibold

                          ${primaryText}
                        `}
                      >
                        Notifications
                      </h2>

                      <p
                        className={`
                          mt-0.5
                          text-[11px]

                          ${mutedText}
                        `}
                      >
                        {unreadCount >
                          0
                          ? `${unreadCount} unread notification${unreadCount >
                            1
                            ? 's'
                            : ''
                          }`
                          : 'All caught up'}
                      </p>
                    </div>

                    {unreadCount >
                      0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsRead
                          }
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          px-2.5
                          py-1.5
                          text-[11px]
                          font-medium
                          text-violet-500
                          hover:bg-violet-500/10
                        "
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-[24rem] overflow-y-auto">
                    {notifications.length ===
                      0 ? (
                      <div className="px-6 py-10 text-center">
                        <div
                          className={`
                            mx-auto
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl

                            ${isDark
                              ? 'bg-white/[0.04] text-white/30'
                              : 'bg-neutral-100 text-neutral-400'
                            }
                          `}
                        >
                          <Bell className="h-5 w-5" />
                        </div>

                        <p
                          className={`
                            text-sm
                            font-medium

                            ${primaryText}
                          `}
                        >
                          No notifications
                        </p>

                        <p
                          className={`
                            mt-1
                            text-xs

                            ${mutedText}
                          `}
                        >
                          New orders and
                          quote requests
                          will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (item) => {
                          const unread =
                            item.is_read ===
                            0 ||
                            item.is_read ===
                            false

                          return (
                            <Link
                              key={
                                item.id
                              }
                              to={notificationLink(
                                item,
                              )}
                              onClick={() => {
                                if (
                                  unread
                                ) {
                                  markNotificationRead(
                                    item.id,
                                  )
                                }

                                setNotificationsOpen(
                                  false,
                                )
                              }}
                              className={`
                                block
                                border-b
                                px-4
                                py-3
                                transition-colors

                                ${borderSoft}
                                ${hoverBg}

                                ${unread
                                  ? isDark
                                    ? 'bg-violet-500/[0.035]'
                                    : 'bg-violet-50/70'
                                  : ''
                                }
                              `}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`
                                    mt-0.5
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg

                                    ${item.type ===
                                      'quote'
                                      ? isDark
                                        ? 'bg-violet-500/[0.10] text-violet-400'
                                        : 'bg-violet-50 text-violet-600'
                                      : isDark
                                        ? 'bg-blue-500/[0.10] text-blue-400'
                                        : 'bg-blue-50 text-blue-600'
                                    }
                                  `}
                                >
                                  {item.type ===
                                    'quote' ? (
                                    <FileText className="h-4 w-4" />
                                  ) : (
                                    <ShoppingBag className="h-4 w-4" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={`
                                        text-xs

                                        ${unread
                                          ? `font-semibold ${primaryText}`
                                          : `font-medium ${secondaryText}`
                                        }
                                      `}
                                    >
                                      {
                                        item.title
                                      }
                                    </p>

                                    {unread && (
                                      <span
                                        className="
                                          mt-1
                                          h-1.5
                                          w-1.5
                                          shrink-0
                                          rounded-full
                                          bg-violet-500
                                        "
                                      />
                                    )}
                                  </div>

                                  <p
                                    className={`
                                      mt-1
                                      truncate
                                      text-xs

                                      ${secondaryText}
                                    `}
                                  >
                                    {
                                      item.message
                                    }
                                  </p>

                                  <div
                                    className={`
                                      mt-1.5
                                      flex
                                      items-center
                                      gap-2
                                      text-[10px]

                                      ${mutedText}
                                    `}
                                  >
                                    <span>
                                      {
                                        item.reference_number ||
                                        ''
                                      }
                                    </span>

                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {formatNotificationTime(
                                        item.created_at,
                                      )}
                                    </span>

                                    <ExternalLink className="ml-auto h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )
                        },
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ==================================================
              ADMIN PROFILE
              Hanya icon
          ================================================== */}
          <div
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              transition-all
              duration-200

              ${border}

              ${isDark
                ? 'bg-white/[0.03] text-white/65 hover:bg-white/[0.06]'
                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
              }
            `}
            title="Admin"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </div>
        </header>

        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}
        <main className="min-h-screen pt-16">
          <div
            className="
              min-h-[calc(100vh-4rem)]
              p-4
              lg:p-8
            "
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* ======================================================
          LOGOUT CONFIRMATION
      ====================================================== */}
      {logoutOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            px-4
            backdrop-blur-sm
          "
        >
          {/* Backdrop */}
          <button
            type="button"
            className="
              absolute
              inset-0
              cursor-default
            "
            onClick={() =>
              setLogoutOpen(
                false,
              )
            }
            aria-label="Close logout dialog"
          />

          {/* Modal */}
          <div
            className={`
              relative
              z-10
              w-full
              max-w-sm
              overflow-hidden
              rounded-2xl
              border
              p-6
              shadow-2xl

              ${surface}
              ${border}
            `}
          >
            <div
              className="
                mb-4
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-red-500/10
                text-red-500
              "
            >
              <LogOut className="h-5 w-5" />
            </div>

            <h2
              className={`
                text-lg
                font-semibold

                ${primaryText}
              `}
            >
              Logout dari Admin?
            </h2>

            <p
              className={`
                mt-2
                text-sm
                leading-6

                ${secondaryText}
              `}
            >
              Sesi admin kamu akan
              diakhiri dan kamu perlu
              login kembali untuk
              mengakses dashboard.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(
                    false,
                  )
                }
                className={`
                  flex-1
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition-colors

                  ${border}

                  ${isDark
                    ? 'text-white/65 hover:bg-white/[0.045]'
                    : 'text-neutral-700 hover:bg-neutral-50'
                  }
                `}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="
                  flex-1
                  rounded-xl
                  bg-red-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-red-600
                  active:scale-[0.98]
                "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
