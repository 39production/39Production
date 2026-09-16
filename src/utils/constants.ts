// 39Production — Utility Constants
// Brand identity, app-wide constants, API configuration,
// navigation, business system constants, and shared statuses.

// ============================================================
// APP / BRAND
// ============================================================

export const APP_NAME = '39Production'

export const APP_READING = 'Sankyuu Production'

export const APP_TAGLINE =
  'Creating Digital Works. Producing Stories. Sharing Gratitude.'

export const APP_DESCRIPTION =
  'A creative digital production house and Entertainment production platform.'

export const APP_COPYRIGHT = `© ${new Date().getFullYear()} 39Production. All rights reserved.`


// ============================================================
// API CONFIGURATION
// ============================================================
//
// Semua request frontend ke backend menggunakan base URL ini.
//
// Development:
// VITE_API_BASE_URL=http://localhost:8787
//
// Production:
// VITE_API_BASE_URL=https://39production-api.39production.workers.dev
//
// Jangan menambahkan "/" di akhir URL.
//
// Contoh:
// ${API_BASE_URL}/api/products
// ${API_BASE_URL}/api/orders
// ${API_BASE_URL}/api/admin/members
//

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://39production-api.39production.workers.dev'
).replace(/\/+$/, '')


// ============================================================
// API ENDPOINTS
// ============================================================
//
// Centralized endpoint configuration.
// Jangan menulis URL Worker secara manual di masing-masing page.
//

export const API_ENDPOINTS = {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    changePassword: '/api/auth/change-password',
  },

  // ----------------------------------------------------------
  // Public / Customer
  // ----------------------------------------------------------

  services: '/api/services',

  products: '/api/products',

  portfolio: '/api/portfolio',

  news: '/api/news',

  promotions: '/api/promotions',

  quotes: '/api/quotes',

  orders: '/api/orders',

  payments: {
    create: '/api/payments/create',
  },

  // ----------------------------------------------------------
  // Idol Production
  // ----------------------------------------------------------

  idol: {
    groups: '/api/idol/groups',
    members: '/api/idol/members',
    releases: '/api/idol/releases',
    musicVideos: '/api/idol/music-videos',
    activities: '/api/idol/activities',
  },

  // ----------------------------------------------------------
  // Site Settings
  // ----------------------------------------------------------

  settings: '/api/settings',

  // ----------------------------------------------------------
  // Admin Business System
  // ----------------------------------------------------------

  admin: {
    dashboard: '/api/admin/dashboard',

    members: '/api/admin/members',

    projects: '/api/admin/projects',

    finance: '/api/admin/finance',

    financeTransactions: '/api/admin/finance/transactions',

    revenueSharing: '/api/admin/revenue-sharing',

    documents: '/api/admin/documents',

    auditLogs: '/api/admin/audit-logs',
  },
} as const


// ============================================================
// API HELPER
// ============================================================
//
// Digunakan oleh seluruh halaman React:
//
// fetch(buildApiUrl(API_ENDPOINTS.products))
//
// atau:
//
// fetch(buildApiUrl('/api/admin/members'))
//

export function buildApiUrl(endpoint: string): string {
  if (!endpoint) {
    return API_BASE_URL
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  return `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`
}


// ============================================================
// AUTH STORAGE
// ============================================================
//
// Key disentralisasi agar seluruh halaman menggunakan
// storage key yang sama.
//

export const AUTH_STORAGE_KEYS = {
  token: '39production_admin_token',
  user: '39production_admin_user',
} as const


// ============================================================
// WHATSAPP CONFIGURATION
// ============================================================

export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890'

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}`


// ============================================================
// SERVICE CATEGORIES
// ============================================================

export const SERVICE_CATEGORIES = [
  {
    id: 'web-development',
    name: 'Web Development',
    icon: 'Globe',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: 'Palette',
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    icon: 'PenTool',
  },
  {
    id: 'illustration',
    name: 'Illustration',
    icon: 'Brush',
  },
  {
    id: 'animation',
    name: 'Animation',
    icon: 'Film',
  },
  {
    id: 'game-development',
    name: 'Game Development',
    icon: 'Gamepad2',
  },
  {
    id: 'creative-production',
    name: 'Creative Production',
    icon: 'Sparkles',
  },
] as const


// ============================================================
// PRODUCT CATEGORIES
// ============================================================

export const PRODUCT_CATEGORIES = [
  'Music',
  'Animation',
  'Web',
  'Game',
  'UI/UX',
  'Graphic Design',
  'Illustration',
  'Other',
] as const


// ============================================================
// PORTFOLIO CATEGORIES
// ============================================================

export const PORTFOLIO_CATEGORIES = [
  'Website',
  'UI/UX',
  'Graphic Design',
  'Illustration',
  'Animation',
  'Game',
  'Other',
] as const


// ============================================================
// ORDER STATUS
// ============================================================

export const ORDER_STATUSES = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'text-yellow-400',
  },
  {
    value: 'reviewing',
    label: 'Reviewing',
    color: 'text-blue-400',
  },
  {
    value: 'accepted',
    label: 'Accepted',
    color: 'text-cyan-400',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    color: 'text-purple-400',
  },
  {
    value: 'revision',
    label: 'Revision',
    color: 'text-orange-400',
  },
  {
    value: 'completed',
    label: 'Completed',
    color: 'text-green-400',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// ADMIN ORDER STATUS
// ============================================================
//
// Status yang digunakan pada sistem order backend.
//
// Catatan:
// Worker yang sekarang juga memiliki status order tersendiri.
// Konstanta ini dipakai untuk UI business system dan nantinya
// harus disamakan dengan enum/status yang kita implementasikan
// di Worker.
//

export const ADMIN_ORDER_STATUSES = [
  {
    value: 'Pending',
    label: 'Pending',
    color: 'text-yellow-400',
  },
  {
    value: 'Processing',
    label: 'Processing',
    color: 'text-blue-400',
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: 'text-green-400',
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// MEMBER STATUS
// ============================================================

export const MEMBER_STATUSES = [
  {
    value: 'Active',
    label: 'Active',
    color: 'text-green-400',
  },
  {
    value: 'Inactive',
    label: 'Inactive',
    color: 'text-zinc-400',
  },
] as const


// ============================================================
// MEMBER ROLES
// ============================================================

export const MEMBER_ROLES = [
  'Founder',
  'Co-Founder',
  'Developer',
  'UI/UX Designer',
  'Graphic Designer',
  'Illustrator',
  'Animator',
  'Game Developer',
  'Music Producer',
  'Project Manager',
  'Marketing',
  'Finance',
  'Other',
] as const


// ============================================================
// PROJECT STATUS
// ============================================================

export const PROJECT_STATUSES = [
  {
    value: 'Planning',
    label: 'Planning',
    color: 'text-yellow-400',
  },
  {
    value: 'Active',
    label: 'Active',
    color: 'text-blue-400',
  },
  {
    value: 'On Hold',
    label: 'On Hold',
    color: 'text-orange-400',
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: 'text-green-400',
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// PROJECT TYPES
// ============================================================

export const PROJECT_TYPES = [
  'Client Project',
  'Internal Project',
  'Product',
  'Creative Production',
  'Entertainment',
  'Other',
] as const


// ============================================================
// CONTRIBUTION TYPES
// ============================================================

export const CONTRIBUTION_TYPES = [
  'Development',
  'Design',
  'Management',
  'Production',
  'Marketing',
  'Finance',
  'Content',
  'Other',
] as const


// ============================================================
// FINANCE TRANSACTION TYPES
// ============================================================

export const FINANCE_TRANSACTION_TYPES = [
  {
    value: 'Revenue',
    label: 'Revenue',
    color: 'text-green-400',
  },
  {
    value: 'Expense',
    label: 'Expense',
    color: 'text-red-400',
  },
  {
    value: 'Payment',
    label: 'Payment',
    color: 'text-blue-400',
  },
  {
    value: 'Refund',
    label: 'Refund',
    color: 'text-orange-400',
  },
  {
    value: 'Transfer',
    label: 'Transfer',
    color: 'text-purple-400',
  },
  {
    value: 'Distribution',
    label: 'Distribution',
    color: 'text-cyan-400',
  },
] as const


// ============================================================
// FINANCE TRANSACTION STATUS
// ============================================================

export const FINANCE_TRANSACTION_STATUSES = [
  {
    value: 'Pending',
    label: 'Pending',
    color: 'text-yellow-400',
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: 'text-green-400',
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// PAYMENT METHODS
// ============================================================

export const PAYMENT_METHODS = [
  'DANA',
  'Bank Transfer',
  'QRIS',
  'Cash',
  'Other',
] as const


// ============================================================
// REVENUE SHARING STATUS
// ============================================================

export const REVENUE_SHARING_STATUSES = [
  {
    value: 'Draft',
    label: 'Draft',
    color: 'text-zinc-400',
  },
  {
    value: 'Calculated',
    label: 'Calculated',
    color: 'text-blue-400',
  },
  {
    value: 'Pending Approval',
    label: 'Pending Approval',
    color: 'text-yellow-400',
  },
  {
    value: 'Approved',
    label: 'Approved',
    color: 'text-green-400',
  },
  {
    value: 'Paid',
    label: 'Paid',
    color: 'text-purple-400',
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// REVENUE SHARING CONFIGURATION
// ============================================================
//
// Default company reserve.
//
// PENTING:
// Nilai ini adalah konfigurasi default UI.
// Perhitungan final revenue sharing tetap harus dilakukan
// oleh Worker berdasarkan data D1, bukan dipercaya dari frontend.
//

export const DEFAULT_COMPANY_RESERVE_PERCENTAGE = 20


// ============================================================
// DOCUMENT TYPES
// ============================================================

export const DOCUMENT_TYPES = [
  {
    value: 'Invoice',
    label: 'Invoice',
  },
  {
    value: 'Receipt',
    label: 'Receipt',
  },
  {
    value: 'Project Statement',
    label: 'Project Statement',
  },
  {
    value: 'Agreement',
    label: 'Agreement',
  },
] as const


// ============================================================
// DOCUMENT STATUS
// ============================================================

export const DOCUMENT_STATUSES = [
  {
    value: 'Draft',
    label: 'Draft',
    color: 'text-zinc-400',
  },
  {
    value: 'Generated',
    label: 'Generated',
    color: 'text-blue-400',
  },
  {
    value: 'Issued',
    label: 'Issued',
    color: 'text-green-400',
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'text-red-400',
  },
] as const


// ============================================================
// AUDIT ACTIONS
// ============================================================

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'ACTIVATE',
  'DEACTIVATE',
  'APPROVE',
  'REJECT',
  'GENERATE',
  'ISSUE',
  'PAY',
  'LOGIN',
  'LOGOUT',
] as const


// ============================================================
// AUDIT ENTITY TYPES
// ============================================================

export const AUDIT_ENTITY_TYPES = [
  'Member',
  'Project',
  'Project Member',
  'Financial Transaction',
  'Revenue Sharing',
  'Distribution',
  'Document',
  'Order',
  'Payment',
  'Settings',
  'Admin User',
] as const


// ============================================================
// PAGINATION
// ============================================================

export const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
] as const


// ============================================================
// DATE / CURRENCY
// ============================================================

export const DEFAULT_CURRENCY = 'IDR'

export const DEFAULT_LOCALE = 'id-ID'


// ============================================================
// NAVIGATION LINKS
// ============================================================

export const NAV_LINKS = [
  {
    path: '/',
    label: 'Home',
  },
  {
    path: '/services',
    label: 'Services',
  },
  {
    path: '/products',
    label: 'Products',
  },
  {
    path: '/portfolio',
    label: 'Portfolio',
  },
  {
    path: '/idol',
    label: 'Entertainment',
  },
  {
    path: '/news',
    label: 'News',
  },
  {
    path: '/about',
    label: 'About',
  },
  {
    path: '/contact',
    label: 'Contact',
  },
] as const


// ============================================================
// CUSTOMER SIDEBAR LINKS
// ============================================================

export const CUSTOMER_NAV_LINKS = [
  {
    path: '/customer/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
  },
  {
    path: '/customer/orders',
    label: 'Orders',
    icon: 'ShoppingBag',
  },
  {
    path: '/customer/projects',
    label: 'Projects',
    icon: 'FolderKanban',
  },
  {
    path: '/customer/files',
    label: 'Files',
    icon: 'FileBox',
  },
  {
    path: '/customer/profile',
    label: 'Profile',
    icon: 'User',
  },
] as const


// ============================================================
// ADMIN SIDEBAR LINKS
// ============================================================
//
// Struktur:
//
// Dashboard
//
// Operations
//   Orders
//   Customers
//   Projects
//   Quotes
//
// Business Management
//   Members
//   Finance
//   Revenue Sharing
//   Documents
//   Audit Log
//
// Content Management
//   Services
//   Products
//   Portfolio
//   Idol Production
//   Promotions
//   News
//
// System
//   Settings
//

export const ADMIN_NAV_LINKS = [
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
  },

  // ==========================================================
  // CUSTOMER & PROJECT OPERATIONS
  // ==========================================================

  {
    path: '/admin/orders',
    label: 'Orders',
    icon: 'ShoppingBag',
  },

  {
    path: '/admin/customers',
    label: 'Customers',
    icon: 'Users',
  },

  {
    path: '/admin/projects',
    label: 'Projects',
    icon: 'FolderKanban',
  },

  {
    path: '/admin/quotes',
    label: 'Quotes',
    icon: 'FileText',
  },

  // ==========================================================
  // BUSINESS MANAGEMENT
  // ==========================================================

  {
    path: '/admin/members',
    label: 'Members',
    icon: 'UserRound',
  },

  {
    path: '/admin/finance',
    label: 'Finance',
    icon: 'WalletCards',
  },

  {
    path: '/admin/revenue-sharing',
    label: 'Revenue Sharing',
    icon: 'ChartNoAxesCombined',
  },

  {
    path: '/admin/documents',
    label: 'Documents',
    icon: 'Files',
  },

  {
    path: '/admin/audit-log',
    label: 'Audit Log',
    icon: 'ClipboardList',
  },

  // ==========================================================
  // CONTENT MANAGEMENT
  // ==========================================================

  {
    path: '/admin/services',
    label: 'Services',
    icon: 'Briefcase',
  },

  {
    path: '/admin/products',
    label: 'Products',
    icon: 'Package',
  },

  {
    path: '/admin/portfolio',
    label: 'Portfolio',
    icon: 'FolderOpen',
  },

  {
    path: '/admin/idol',
    label: 'Entertainment',
    icon: 'Music',
  },

  {
    path: '/admin/promotions',
    label: 'Promotions',
    icon: 'Megaphone',
  },

  {
    path: '/admin/news',
    label: 'News',
    icon: 'Newspaper',
  },

  // ==========================================================
  // SYSTEM
  // ==========================================================

  {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'Settings',
  },
] as const


// ============================================================
// ADMIN NAVIGATION GROUPS
// ============================================================
//
// Dipakai kalau AdminLayout ingin menampilkan menu dalam
// kelompok/dropdown agar tidak semuanya bercampur.
//

export const ADMIN_NAV_GROUPS = [
  {
    id: 'dashboard',
    label: 'Overview',
    items: [
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
      },
    ],
  },

  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        path: '/admin/orders',
        label: 'Orders',
        icon: 'ShoppingBag',
      },
      {
        path: '/admin/customers',
        label: 'Customers',
        icon: 'Users',
      },
      {
        path: '/admin/projects',
        label: 'Projects',
        icon: 'FolderKanban',
      },
      {
        path: '/admin/quotes',
        label: 'Quotes',
        icon: 'FileText',
      },
    ],
  },

  {
    id: 'business',
    label: 'Business Management',
    items: [
      {
        path: '/admin/members',
        label: 'Members',
        icon: 'UserRound',
      },
      {
        path: '/admin/finance',
        label: 'Finance',
        icon: 'WalletCards',
      },
      {
        path: '/admin/revenue-sharing',
        label: 'Revenue Sharing',
        icon: 'ChartNoAxesCombined',
      },
      {
        path: '/admin/documents',
        label: 'Documents',
        icon: 'Files',
      },
      {
        path: '/admin/audit-log',
        label: 'Audit Log',
        icon: 'ClipboardList',
      },
    ],
  },

  {
    id: 'content',
    label: 'Content Management',
    items: [
      {
        path: '/admin/services',
        label: 'Services',
        icon: 'Briefcase',
      },
      {
        path: '/admin/products',
        label: 'Products',
        icon: 'Package',
      },
      {
        path: '/admin/portfolio',
        label: 'Portfolio',
        icon: 'FolderOpen',
      },
      {
        path: '/admin/idol',
        label: 'Entertainment',
        icon: 'Music',
      },
      {
        path: '/admin/promotions',
        label: 'Promotions',
        icon: 'Megaphone',
      },
      {
        path: '/admin/news',
        label: 'News',
        icon: 'Newspaper',
      },
    ],
  },

  {
    id: 'system',
    label: 'System',
    items: [
      {
        path: '/admin/settings',
        label: 'Settings',
        icon: 'Settings',
      },
    ],
  },
] as const


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function formatCurrency(
  value: number | string | null | undefined,
): string {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) {
    return 'Rp0'
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount)
}


export function formatDate(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return '-'
  }

  const date = value instanceof Date
    ? value
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}


export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return '-'
  }

  const date = value instanceof Date
    ? value
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}


// ============================================================
// API AUTH HEADER
// ============================================================

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(
      AUTH_STORAGE_KEYS.token,
    )
  } catch {
    return null
  }
}


export function getAuthHeaders(
  includeJsonContentType = true,
): HeadersInit {
  const token = getAuthToken()

  const headers: Record<string, string> = {}

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}


// ============================================================
// API REQUEST HELPER
// ============================================================
//
// Helper umum untuk request ke Worker.
//
// Contoh:
//
// const data = await apiRequest<Member[]>(
//   '/api/admin/members',
// )
//

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = buildApiUrl(endpoint)

  const headers = new Headers(
    options.headers || {},
  )

  const token = getAuthToken()

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  }

  if (token && !headers.has('Authorization')) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  let payload: unknown = null

  const contentType =
    response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    payload = await response.text()
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}.`

    throw new Error(message)
  }

  return payload as T
}


// ============================================================
// COMMON API METHODS
// ============================================================

export async function apiGet<T>(
  endpoint: string,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  })
}


export async function apiPost<T>(
  endpoint: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}


export async function apiPut<T>(
  endpoint: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}


export async function apiDelete<T>(
  endpoint: string,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  })
}
