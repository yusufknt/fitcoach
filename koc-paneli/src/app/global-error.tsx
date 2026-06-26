'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-[#0F0F13] text-white antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Beklenmeyen bir hata oluştu</h1>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Sayfa güvenli şekilde yüklenemedi. Tekrar deneyebilir veya giriş
            sayfasından panele dönebilirsiniz.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => reset()} className="btn-primary-glow gap-2">
              <RotateCcw className="h-4 w-4" />
              Yeniden Dene
            </Button>
            <a href="/giris">
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                Giriş Sayfası
              </Button>
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
