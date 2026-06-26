'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Mail } from 'lucide-react'

export default function StudentError({
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
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 shadow-[0_0_24px_rgba(239,68,68,0.1)]">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Öğrenci Panelinde Bir Hata Oluştu</h2>
      <p className="text-[#C4C9AC] max-w-md mx-auto mb-8">
        Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen koçunuzla iletişime geçin.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600] w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Yeniden Dene
        </Button>
        <a href="mailto:koc@fitcoach.com">
          <Button variant="outline" className="w-full sm:w-auto border-[#444933] bg-[#2A2A2C] text-[#E5E1E4] hover:bg-[#353437] flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            Koça E-posta Gönder
          </Button>
        </a>
      </div>
    </div>
  )
}
