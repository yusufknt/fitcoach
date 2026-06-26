import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FileUp, MessageSquare, CalendarPlus } from 'lucide-react'

const actions = [
  {
    label: 'Yeni Program Yükle',
    description: 'Antrenman ve beslenme',
    href: '/coach/ogrenciler',
    icon: FileUp,
    color: 'text-[#ABD600]',
    bg: 'bg-[#C3F400]/15',
  },
  {
    label: 'Mesaj Gönder',
    description: 'Öğrencilerinize ulaşın',
    href: '/coach/mesajlar',
    icon: MessageSquare,
    color: 'text-[#00DBE9]',
    bg: 'bg-[#00EEFC]/15',
  },
  {
    label: 'Randevu Oluştur',
    description: 'Görüşme planlayın',
    href: '/coach/takvim',
    icon: CalendarPlus,
    color: 'text-[#D2E5F5]',
    bg: 'bg-[#D2E5F5]/15',
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href} className="group">
            <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 group-hover:border-[#ABD600]/40 group-hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
              <CardContent className="flex items-center gap-4 p-5 sm:p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.bg} transition-transform group-hover:scale-110`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block truncate text-lg font-bold text-[#E5E1E4]">
                    {action.label}
                  </span>
                  <span className="text-xs font-semibold text-[#C4C9AC]/80">
                    {action.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
