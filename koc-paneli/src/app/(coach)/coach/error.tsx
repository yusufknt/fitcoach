'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center bg-[#09090B] p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 shadow-[0_0_24px_rgba(239,68,68,0.1)]">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Koç Panelinde Bir Hata Oluştu</h2>
      <p className="mx-auto mb-8 max-w-md text-[#C4C9AC]">
        Verileri yüklerken veya bir işlemi gerçekleştirirken sorun yaşadık. Lütfen tekrar deneyin.
      </p>
      
      <Button 
        onClick={() => reset()} 
        className="flex items-center justify-center gap-2 bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]"
      >
        <RotateCcw className="h-4 w-4" />
        Yeniden Dene
      </Button>
    </div>
  )
}
