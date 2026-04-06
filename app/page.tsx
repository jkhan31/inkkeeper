'use client'

import { useCallback } from 'react'
import { Header } from '../components/landing/Header'
import { Footer } from '../components/landing/Footer'
import { HeroSection } from '../sections/HeroSection'
import { ProblemSection } from '../sections/ProblemSection'
import { SolutionSection } from '../sections/SolutionSection'
import { ValueSection } from '../sections/ValueSection'
import { DifferentiationSection } from '../sections/DifferentiationSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { TestimonialsSection } from '../sections/TestimonialsSection'
import { ClosingCTASection } from '../sections/ClosingCTASection'

export default function LandingPage() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  return (
    <div className="relative min-h-screen selection:bg-seal-rust/10 bg-rice-paper">
      {/* Visual Texture */}
      <div className="grain-overlay" />

      <Header onNavigate={scrollToSection} />

      <main className="pt-20">
        {/* Section 1 — Hero */}
        <HeroSection />

        {/* Section 2 — Problem */}
        <ProblemSection />

        {/* Section 3 — The Ritual */}
        <SolutionSection />

        {/* Section 4 — Two Ways to Capture */}
        <ValueSection />

        {/* Section 5 — Personal Archive */}
        <DifferentiationSection />

        {/* Section 6 — Rediscovery */}
        <FeaturesSection />

        {/* Section 7 — Philosophy */}
        <TestimonialsSection />

        {/* Section 8 — Final CTA */}
        <ClosingCTASection />
      </main>

      <Footer />
    </div>
  )
}