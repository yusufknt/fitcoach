import Link from 'next/link'
import type { Profile } from '@/types'

type HeroSectionProps = {
  coach: Profile | null
}

export function HeroSection({ coach }: HeroSectionProps) {
  const name = coach?.full_name && coach.full_name !== 'İsimsiz' ? coach.full_name : 'Can Demir'
  
  // Use first line of bio as intro, or default text
  const bioFirstLine = coach?.bio?.split('\n')[0]
  const intro = bioFirstLine && bioFirstLine.trim().length > 0 
    ? bioFirstLine 
    : 'Hedeflerinize Bilimsel Yaklaşımla Ulaşın. Kişiselleştirilmiş online koçluk ile sağlıklı alışkanlıklar kazanın, performansınızı artırın ve sürdürülebilir sonuçlar elde edin.'

  const avatarUrl = coach?.avatar_url ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4YB0MuoomtHxWBv398hQSzGYLHbw34-1OBEAkhtqLiPKdIMTC0vtiAmUPArq8hYfKa3kFPzSJ6QgdhEOwoyBj7BbCaknvhoxtLXK6d-QAv33kJzC8CG17RJfvQLQtFbFvlMUxxr0p18_aUfZ-ffhBhxsASM0jkvJO8Up7NRLsU5aJIBqC7Jcz5j4HKjXVuT5HenAPfZn1-8yin9l4WpXvVLXZgztahxrnbNf7054PCGMYS7qYEghWvSzLJCSpMg5hqrZAbE8N_90E'

  return (
    <section className="relative min-h-screen flex items-center pt-20 px-margin-x overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-secondary-container/5 rounded-full blur-[100px]"></div>
      </div>
      <div className="container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10 w-full">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md mb-stack-md w-fit">
            Online Koçluk
          </span>
          <h1 className="font-display-lg text-display-lg mb-stack-md leading-none">
            {name} ile <br />
            <span className="gradient-text">KİNETİK PERFORMANCE</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-xl">
            {intro}
          </p>
          <div className="flex flex-wrap gap-stack-md">
            <Link
              href="#paketler"
              className="px-8 py-4 bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-lg btn-glow transition-all active:scale-95 text-center min-w-[180px]"
            >
              Paketleri İncele
            </Link>
            <Link
              href="/giris"
              className="px-8 py-4 border border-outline-variant text-on-surface font-label-md text-label-md font-bold rounded-lg hover:bg-surface-container-high transition-all active:scale-95 text-center min-w-[180px]"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 hidden lg:block">
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden glass-card group">
            <img
              alt={`${name} Coach`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={avatarUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-lg">
              <div className="flex items-center gap-stack-sm">
                <span className="w-3 h-3 bg-primary-container rounded-full animate-pulse"></span>
                <span className="font-label-md text-label-md text-primary">
                  Şu an aktif öğrenci alımı açık
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
