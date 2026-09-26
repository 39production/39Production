import { Helmet } from 'react-helmet-async'

import { HeroSection } from '@/components/home/HeroSection'
import { TrustSection } from '@/components/home/TrustSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { FeaturedWorksSection } from '@/components/home/FeaturedWorksSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { DigitalProductsSection } from '@/components/home/DigitalProductsSection'
import { IdolSection } from '@/components/home/IdolSection'
import { PromotionsSection } from '@/components/home/PromotionsSection'
import { NewsSection } from '@/components/home/NewsSection'
import { CTASection } from '@/components/home/CTASection'

export function HomePage() {
    return (
        <>
            <Helmet>
                <title>
                    39Production — Creative Technology & Entertainment Production
                </title>

                <meta
                    name="description"
                    content="39Production adalah creative technology dan entertainment production house yang menggabungkan technology, design, storytelling, music, dan entertainment untuk menciptakan digital products, creative experiences, dan original entertainment."
                />

                <meta
                    name="keywords"
                    content="39Production, Sankyuu Production, creative technology Indonesia, digital production house Indonesia, creative studio Indonesia, web development, UI UX design, graphic design, animation, game development, entertainment production, idol production"
                />

                <meta
                    name="robots"
                    content="index, follow"
                />

                <link
                    rel="canonical"
                    href="https://39production.github.io/39Production/"
                />

                <meta
                    property="og:type"
                    content="website"
                />

                <meta
                    property="og:title"
                    content="39Production — Creative Technology & Entertainment Production"
                />

                <meta
                    property="og:description"
                    content="Creative technology dan entertainment production house yang mengubah ide menjadi digital products, creative experiences, dan original entertainment."
                />

                <meta
                    property="og:url"
                    content="https://39production.github.io/39Production/"
                />

                <meta
                    property="og:site_name"
                    content="39Production"
                />

                <meta
                    name="twitter:card"
                    content="summary"
                />

                <meta
                    name="twitter:title"
                    content="39Production — Creative Technology & Entertainment Production"
                />

                <meta
                    name="twitter:description"
                    content="39Production menggabungkan technology, design, storytelling, music, dan entertainment untuk menciptakan karya digital dan creative experiences."
                />
            </Helmet>

            <main className="overflow-hidden">
                {/* =========================================================
            01 — BRAND / HERO
            Introduce who 39Production is and what we create.
        ========================================================== */}
                <HeroSection />

                {/* =========================================================
            02 — TRUST / VALUE
            Establish credibility before presenting the services.
        ========================================================== */}
                <TrustSection />

                {/* =========================================================
            03 — CAPABILITIES
            Show the creative technology and production services.
        ========================================================== */}
                <ServicesSection />

                {/* =========================================================
            04 — SELECTED WORK
            Demonstrate what 39Production can actually produce.
        ========================================================== */}
                <FeaturedWorksSection />

                {/* =========================================================
            05 — PROCESS
            Explain how customers move from idea to delivery.
        ========================================================== */}
                <HowItWorksSection />

                {/* =========================================================
            06 — DIGITAL PRODUCTS
            Present ready-to-use products that can be purchased
            directly without going through the custom project flow.
        ========================================================== */}
                <DigitalProductsSection />

                {/* =========================================================
            07 — ENTERTAINMENT
            Introduce the 39Production entertainment / idol
            production ecosystem.
        ========================================================== */}
                <IdolSection />

                {/* =========================================================
            08 — SPECIAL OFFERS
            Highlight currently active promotions and offers.
        ========================================================== */}
                <PromotionsSection />

                {/* =========================================================
            09 — JOURNAL / UPDATES
            Keep the brand active with projects, products,
            creative technology, and entertainment updates.
        ========================================================== */}
                <NewsSection />

                {/* =========================================================
            10 — FINAL CTA
            Convert visitors after they understand the brand,
            capabilities, proof, process, and offerings.
        ========================================================== */}
                <CTASection />
            </main>
        </>
    )
}