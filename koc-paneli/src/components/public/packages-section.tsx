import Link from 'next/link'
import { getActivePackages, formatDuration, formatPrice } from '@/lib/public/landing'

export async function PackagesSection() {
  const packages = await getActivePackages()

  return (
    <section className="py-stack-lg px-margin-x" id="paketler">
      <div className="container-max mx-auto text-center mb-stack-lg">
        <span className="px-4 py-1 bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-full mb-4 inline-block">
          Fiyatlandırma
        </span>
        <h2 className="font-display-lg text-display-lg mb-4">Size Uygun Koçluk Paketi</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
          Hedefinize göre seçebileceğiniz paketler. Satın alma için giriş yapmanız yeterli.
        </p>
      </div>

      <div className="container-max mx-auto flex flex-wrap justify-center gap-gutter w-full">
        {packages.length === 0 ? (
          <p className="text-center text-[#C4C9AC]">Henüz aktif paket bulunmuyor.</p>
        ) : (
          packages.map((pkg, idx) => {
            // Highlight the first package (or middle if there are 3)
            const isHighlighted = packages.length === 1 ? true : idx === 0
            
            return (
              <div 
                key={pkg.id} 
                className={`w-full max-w-sm p-8 glass-card rounded-2xl relative flex flex-col justify-between ${
                  isHighlighted ? 'border-2 border-primary-container/50 shadow-[0_0_30px_rgba(171,214,0,0.15)]' : 'border border-outline-variant'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-full uppercase tracking-wider text-xs">
                    EN ÇOK TERCİH EDİLEN
                  </div>
                )}
                
                <div>
                  <div className="mb-6">
                    <h3 className="font-headline-lg text-headline-lg mb-2 text-white">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="font-body-md text-body-md text-on-surface-variant">{pkg.description}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="font-display-lg text-display-lg text-primary">{formatPrice(pkg.price)}</span>
                      <span className="font-label-md text-label-md text-on-surface-variant mb-2">
                        / {formatDuration(pkg.duration_days)}
                      </span>
                    </div>
                  </div>
                  
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-3">
                          <span 
                            className="material-symbols-outlined text-primary-container text-lg"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          <span className="font-body-md text-body-md text-on-surface">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <Link
                  href="/giris"
                  className={`w-full py-4 text-center font-label-md text-label-md font-bold rounded-xl btn-glow transition-all active:scale-95 flex items-center justify-center ${
                    isHighlighted 
                      ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(195,244,0,0.2)]'
                      : 'border border-outline-variant text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Satın Al
                </Link>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
