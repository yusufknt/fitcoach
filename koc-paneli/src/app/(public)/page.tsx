import { getCoachProfile } from '@/lib/public/landing'
import { HeroSection } from '@/components/public/hero-section'
import { AboutSection } from '@/components/public/about-section'
import { PackagesSection } from '@/components/public/packages-section'
import { TestimonialsSection } from '@/components/public/testimonials-section'
import { FooterSection } from '@/components/public/footer-section'

export default async function HomePage() {
  const coach = await getCoachProfile()

  return (
    <>
      <HeroSection coach={coach} />
      <AboutSection coach={coach} />
      <PackagesSection />
      <TestimonialsSection />
      <FooterSection />
    </>
  )
}
