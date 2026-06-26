'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Palette, MessageSquareQuote, Package } from 'lucide-react'

export function WebsiteTab() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
            <Globe className="h-4 w-4 text-[#ABD600]" />
            Hero Bölümü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#444933] bg-[#0E0E10]/70 p-8 text-center">
            <div>
              <Palette className="mx-auto h-8 w-8 text-[#C4C9AC]" />
              <p className="mt-3 text-sm font-medium text-[#E5E1E4]">
                Website düzenleme modülü
              </p>
              <p className="mt-1 text-xs text-[#C4C9AC]">
                Hero başlık, slogan ve görsel düzenlemeleri yakında aktif olacak.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
            <MessageSquareQuote className="h-4 w-4 text-[#ABD600]" />
            Referanslar (Testimonial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#444933] bg-[#0E0E10]/70 p-8 text-center">
            <div>
              <MessageSquareQuote className="mx-auto h-8 w-8 text-[#C4C9AC]" />
              <p className="mt-3 text-sm font-medium text-[#E5E1E4]">
                Referans yönetimi
              </p>
              <p className="mt-1 text-xs text-[#C4C9AC]">
                Öğrenci yorumlarını ekle, düzenle ve sırala. Yakında aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
            <Package className="h-4 w-4 text-[#ABD600]" />
            Paket Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#444933] bg-[#0E0E10]/70 p-8 text-center">
            <div>
              <Package className="mx-auto h-8 w-8 text-[#C4C9AC]" />
              <p className="mt-3 text-sm font-medium text-[#E5E1E4]">
                Paketleri düzenle
              </p>
              <p className="mt-1 text-xs text-[#C4C9AC]">
                Mevcut paketleri düzenle, yeni paket ekle, aktif/pasif toggle. Yakında aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
