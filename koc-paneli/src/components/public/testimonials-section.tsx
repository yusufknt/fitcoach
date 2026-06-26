const testimonials = [
  {
    name: 'Ayşe K.',
    role: '3 aylık öğrenci',
    quote:
      'Program tamamen bana göre hazırlandı. Düzenli takip sayesinde hedef kiloma ulaştım ve alışkanlıklarımı koruyabiliyorum.',
  },
  {
    name: 'Mehmet T.',
    role: '6 aylık öğrenci',
    quote:
      'Mesajlaşma ve haftalık geri bildirimler motivasyonumu yüksek tuttu. Profesyonel ve samimi bir koçluk deneyimi.',
  },
  {
    name: 'Zeynep A.',
    role: '1 aylık öğrenci',
    quote:
      'İlk ayda bile farkı hissettim. Esnek randevu saatleri ve anlaşılır program yapısı çok işime yaradı.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-stack-lg px-margin-x bg-surface-container-low overflow-hidden relative" id="referanslar">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container rounded-full blur-[120px]"></div>
      </div>
      <div className="container-max mx-auto text-center mb-stack-lg relative z-10">
        <span className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 inline-block">
          Referanslar
        </span>
        <h2 className="font-display-lg text-display-lg">Öğrencilerim Ne Diyor?</h2>
      </div>
      <div className="container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter relative z-10 w-full">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="p-8 glass-card rounded-xl border border-outline-variant hover:border-primary-container/20 transition-all flex flex-col justify-between"
          >
            <div>
              <span 
                className="material-symbols-outlined text-primary-container text-4xl mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                format_quote
              </span>
              <p className="font-body-md text-body-md italic text-on-surface mb-8 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
            <div>
              <div className="font-label-md text-label-md font-bold text-primary">{item.name}</div>
              <div className="font-label-md text-label-md text-on-surface-variant">{item.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
