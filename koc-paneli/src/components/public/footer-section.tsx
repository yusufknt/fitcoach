export function FooterSection() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface py-stack-lg px-margin-x border-t border-outline-variant">
      <div className="container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-gutter w-full">
        <div>
          <div className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight mb-2 uppercase">
            KİNETİK PERFORMANCE
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">
            Elite Fitness Coaching
          </p>
        </div>
        <nav className="flex gap-stack-md">
          <a className="text-on-surface-variant hover:text-primary transition-all" href="#" aria-label="Websitesi">
            <span className="material-symbols-outlined">public</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all" href="#" aria-label="E-posta">
            <span className="material-symbols-outlined">alternate_email</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all" href="#" aria-label="Paylaş">
            <span className="material-symbols-outlined">share</span>
          </a>
        </nav>
      </div>
      <div className="container-max mx-auto mt-stack-lg pt-8 border-t border-outline-variant/30 text-center w-full">
        <p className="font-label-md text-label-md text-on-surface-variant">
          © {year} Kinetic Performance. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}
