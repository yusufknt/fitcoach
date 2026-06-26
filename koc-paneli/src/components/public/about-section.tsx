import type { Profile } from '@/types'

type AboutSectionProps = {
  coach: Profile | null
}

export function AboutSection({ coach }: AboutSectionProps) {
  // If coach bio exists, use it, otherwise use default
  const bio = coach?.bio && coach.bio.trim().length > 0
    ? coach.bio
    : 'Yılların deneyimiyle öğrencilerimin hedeflerine ulaşmalarına yardımcı oluyorum. Bilimsel temelli programlar, sürdürülebilir alışkanlıklar ve düzenli takip ile kalıcı sonuçlar elde etmenizi sağlıyorum.'

  return (
    <section className="py-stack-lg px-margin-x bg-surface-container-lowest" id="hakkimda">
      <div className="container-max mx-auto">
        <div className="flex flex-col md:flex-row gap-gutter items-center mb-stack-lg">
          <div className="md:w-1/2">
            <span className="font-label-md text-label-md text-primary mb-stack-sm block">Hakkımda</span>
            <h2 className="font-headline-lg text-headline-lg mb-stack-md">Deneyim ve Yaklaşım</h2>
            <div className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-stack-md space-y-4">
              {bio.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
            <div className="p-6 glass-card rounded-xl">
              <span className="material-symbols-outlined text-primary-container mb-2">verified_user</span>
              <div className="font-data-num text-data-num text-primary">500+</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">Saat Birebir Koçluk</div>
            </div>
            <div className="p-6 glass-card rounded-xl">
              <span className="material-symbols-outlined text-primary-container mb-2">military_tech</span>
              <div className="font-data-num text-data-num text-primary">ULUSLARARASI</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">Fitness Sertifikaları</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="p-8 bg-surface-container rounded-xl border border-outline-variant hover:border-primary-container/30 transition-all group">
            <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-4">Kişiye Özel Program</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Her bireyin genetiği ve yaşam tarzı farklıdır. Size en uygun antrenman ve beslenme planını bilimsel verilerle oluşturuyorum.</p>
          </div>
          
          <div className="p-8 bg-surface-container rounded-xl border border-outline-variant hover:border-primary-container/30 transition-all group">
            <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-4">Haftalık Takip</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">İlerlemenizi her hafta analiz ediyor, formunuzdaki ve verilerinizdeki değişimlere göre programınızı anlık güncelliyorum.</p>
          </div>
          
          <div className="p-8 bg-surface-container rounded-xl border border-outline-variant hover:border-primary-container/30 transition-all group">
            <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6 text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined">psychology_alt</span>
            </div>
            <h3 className="font-headline-md text-headline-md mb-4">Sürdürülebilir Yaşam</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Sadece kısa süreli değişimler değil, hayat boyu koruyabileceğiniz sağlıklı alışkanlıklar ve disiplin kazandırıyorum.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
