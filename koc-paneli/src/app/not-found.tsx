import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#abd600]/10 mb-6">
        <FileQuestion className="h-10 w-10 text-[#abd600]" />
      </div>
      <h1 className="text-6xl font-bold text-white tracking-tighter mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white/90 mb-2">Sayfa Bulunamadı</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 text-white hover:bg-white/10">
            Ana Sayfaya Dön
          </Button>
        </Link>
        <Link href="/giris">
          <Button className="w-full sm:w-auto btn-primary-glow">
            Panele Git
          </Button>
        </Link>
      </div>
    </div>
  )
}
