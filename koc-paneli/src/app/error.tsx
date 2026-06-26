'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f13] p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Bir şeyler ters gitti!</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        İsteğinizi işlerken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        Sorun devam ederse sistem yöneticisine başvurun.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="btn-primary-glow w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Yeniden Dene
        </Button>
        <a href="mailto:destek@fitcoach.com">
          <Button variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 text-white hover:bg-white/10">
            Destek Ekibine Ulaş
          </Button>
        </a>
      </div>
    </div>
  )
}
