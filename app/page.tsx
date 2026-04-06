'use client'

import { useCallback } from 'react'
import { Header } from '../components/landing/Header'
import { Footer } from '../components/landing/Footer'
import { HeroSection } from '../sections/HeroSection'
import { ProblemSection } from '../sections/ProblemSection'
import { SolutionSection } from '../sections/SolutionSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { ValueSection } from '../sections/ValueSection'
import { RediscoverySection } from '../sections/RediscoverySection'
import { DifferentiationSection } from '../sections/DifferentiationSection'
import { TestimonialsSection } from '../sections/TestimonialsSection'
import { PricingSection } from '../sections/PricingSection'
import { ClosingCTASection } from '../sections/ClosingCTASection'

export default function LandingPage() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Offset for the sticky header
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
    <div className="relative min-h-screen selection:bg-seal-rust/10">
      {/* Visual Texture */}
      <div className="grain-overlay" />

      <Header onNavigate={scrollToSection} />

      <main>
        <HeroSection onNavigate={scrollToSection} />

        <div id="problem">
          <ProblemSection />
        </div>

        <div id="solution">
          <SolutionSection />
        </div>

        <div id="features">
          <FeaturesSection />
        </div>

        <ValueSection />

        <RediscoverySection />

        <DifferentiationSection />

        <div id="testimonials">
          <TestimonialsSection />
        </div>

        <div id="pricing">
          <PricingSection />
        </div>

        <ClosingCTASection />
      </main>

      <Footer />
    </div>
  )
}