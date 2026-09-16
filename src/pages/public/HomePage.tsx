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
  )
}
