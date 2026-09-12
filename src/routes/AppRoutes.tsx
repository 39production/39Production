import { Routes, Route } from 'react-router-dom'

import { PublicLayout } from '@/layouts/PublicLayout'

import { HomePage } from '@/pages/public/HomePage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { PortfolioPage } from '@/pages/public/PortfolioPage'
import { ServicesPage } from '@/pages/public/ServicesPage'
import { ServiceDetailPage } from '@/pages/public/ServiceDetailPage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'
import { TrackOrderPage } from '@/pages/public/TrackOrderPage'
import { NewsPage } from '@/pages/public/NewsPage'
import { NewsDetailPage } from '@/pages/public/NewsDetailPage'
import { IdolPage } from '@/pages/public/IdolPage'
import { IdolGroupPage } from '@/pages/public/IdolGroupPage'
import { IdolMemberPage } from '@/pages/public/IdolMemberPage'
import { IdolEventsPage } from '@/pages/public/IdolEventsPage'
import { IdolMusicVideosPage } from '@/pages/public/IdolMusicVideosPage'
import { IdolReleasesPage } from '@/pages/public/IdolReleasesPage'
import { QuotePage } from '@/pages/public/QuotePage'
import { PlaceholderPage } from '@/pages/public/PlaceholderPage'

import { AdminLayout } from '@/layouts/AdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage'
import { AdminServicesPage } from '@/pages/admin/AdminServicesPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminPortfolioPage } from '@/pages/admin/AdminPortfolioPage'
import { AdminIdolPage } from '@/pages/admin/AdminIdolPage'
import { AdminPromotionsPage } from '@/pages/admin/AdminPromotionsPage'
import { AdminNewsPage } from '@/pages/admin/AdminNewsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminQuotesPage } from '@/pages/admin/AdminQuotesPage'

// ============================================================
// BUSINESS MANAGEMENT PAGES
// ============================================================

import { AdminMembersPage } from '@/pages/admin/AdminMembersPage'
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage'
import { AdminFinancePage } from '@/pages/admin/AdminFinancePage'
import { AdminRevenueSharingPage } from '@/pages/admin/AdminRevenueSharingPage'
import { AdminDocumentsPage } from '@/pages/admin/AdminDocumentsPage'
import { AdminAuditLogPage } from '@/pages/admin/AdminAuditLogPage'

export function AppRoutes() {
    return (
        <Routes>
            {/* =====================================================
                PUBLIC ROUTES
            ====================================================== */}

            <Route element={<PublicLayout />}>
                {/* =================================================
                    HOME
                ================================================== */}

                <Route
                    path="/"
                    element={<HomePage />}
                />

                {/* =================================================
                    ABOUT
                ================================================== */}

                <Route
                    path="/about"
                    element={<AboutPage />}
                />

                {/* =================================================
                    CONTACT
                ================================================== */}

                <Route
                    path="/contact"
                    element={<ContactPage />}
                />

                {/* =================================================
                    PORTFOLIO
                ================================================== */}

                <Route
                    path="/portfolio"
                    element={<PortfolioPage />}
                />

                {/* =================================================
                    SERVICES
                ================================================== */}

                <Route
                    path="/services"
                    element={<ServicesPage />}
                />

                <Route
                    path="/services/:id"
                    element={<ServiceDetailPage />}
                />

                {/* =================================================
                    PRODUCTS
                ================================================== */}

                <Route
                    path="/products"
                    element={<ProductsPage />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetailPage />}
                />

                {/* =================================================
                    QUOTATION
                    Public access - no customer login required
                ================================================== */}

                <Route
                    path="/quote/:token"
                    element={<QuotePage />}
                />

                {/* =================================================
                    ORDER TRACKING
                ================================================== */}

                <Route
                    path="/track-order"
                    element={<TrackOrderPage />}
                />

                {/* =================================================
                    NEWS
                ================================================== */}

                <Route
                    path="/news"
                    element={<NewsPage />}
                />

                <Route
                    path="/news/:id"
                    element={<NewsDetailPage />}
                />

                {/* =================================================
                    IDOL / ENTERTAINMENT
                ================================================== */}

                <Route
                    path="/idol"
                    element={<IdolPage />}
                />

                <Route
                    path="/idol/groups"
                    element={<IdolGroupPage />}
                />

                <Route
                    path="/idol/groups/:id"
                    element={<IdolGroupPage />}
                />

                <Route
                    path="/idol/members"
                    element={<IdolMemberPage />}
                />

                <Route
                    path="/idol/members/:id"
                    element={<IdolMemberPage />}
                />

                <Route
                    path="/idol/events"
                    element={<IdolEventsPage />}
                />

                <Route
                    path="/idol/music-videos"
                    element={<IdolMusicVideosPage />}
                />

                <Route
                    path="/idol/releases"
                    element={<IdolReleasesPage />}
                />

                {/* =================================================
                    PUBLIC 404
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <PlaceholderPage
                            title="Page Not Found"
                            description="The page you are looking for is not available."
                        />
                    }
                />
            </Route>

            {/* =====================================================
                LOGIN
            ====================================================== */}

            <Route
                path="/login"
                element={<LoginPage />}
            />

            {/* =====================================================
                PROTECTED ADMIN ROUTES
            ====================================================== */}

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >
                    {/* =================================================
                        DASHBOARD
                    ================================================== */}

                    <Route
                        path="dashboard"
                        element={<AdminDashboardPage />}
                    />

                    {/* =================================================
                        ORDERS & CUSTOMERS
                    ================================================== */}

                    <Route
                        path="orders"
                        element={<AdminOrdersPage />}
                    />

                    <Route
                        path="customers"
                        element={<AdminCustomersPage />}
                    />

                    {/* =================================================
                        QUOTATIONS
                    ================================================== */}

                    <Route
                        path="quotes"
                        element={<AdminQuotesPage />}
                    />

                    {/* =================================================
                        BUSINESS MANAGEMENT
                    ================================================== */}

                    <Route
                        path="members"
                        element={<AdminMembersPage />}
                    />

                    <Route
                        path="projects"
                        element={<AdminProjectsPage />}
                    />

                    <Route
                        path="finance"
                        element={<AdminFinancePage />}
                    />

                    <Route
                        path="revenue-sharing"
                        element={<AdminRevenueSharingPage />}
                    />

                    <Route
                        path="documents"
                        element={<AdminDocumentsPage />}
                    />

                    <Route
                        path="audit-log"
                        element={<AdminAuditLogPage />}
                    />

                    {/* =================================================
                        CONTENT MANAGEMENT
                    ================================================== */}

                    <Route
                        path="services"
                        element={<AdminServicesPage />}
                    />

                    <Route
                        path="products"
                        element={<AdminProductsPage />}
                    />

                    <Route
                        path="portfolio"
                        element={<AdminPortfolioPage />}
                    />

                    <Route
                        path="idol"
                        element={<AdminIdolPage />}
                    />

                    <Route
                        path="promotions"
                        element={<AdminPromotionsPage />}
                    />

                    <Route
                        path="news"
                        element={<AdminNewsPage />}
                    />

                    {/* =================================================
                        SETTINGS
                    ================================================== */}

                    <Route
                        path="settings"
                        element={<AdminSettingsPage />}
                    />
                </Route>
            </Route>
        </Routes>
    )
}