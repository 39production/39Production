import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title: string
    description: string
    path?: string
    keywords?: string
}

const SITE_URL = 'https://39production.github.io/39Production'

export function SEO({
    title,
    description,
    path = '/',
    keywords,
}: SEOProps) {
    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`

    return (
        <Helmet>
            <html lang="id" />

            <title>{title}</title>

            <meta
                name="description"
                content={description}
            />

            {keywords && (
                <meta
                    name="keywords"
                    content={keywords}
                />
            )}

            <link
                rel="canonical"
                href={canonicalUrl}
            />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta
                property="og:site_name"
                content="39Production"
            />

            {/* Twitter / X */}
            <meta
                name="twitter:card"
                content="summary_large_image"
            />
            <meta
                name="twitter:title"
                content={title}
            />
            <meta
                name="twitter:description"
                content={description}
            />
        </Helmet>
    )
}