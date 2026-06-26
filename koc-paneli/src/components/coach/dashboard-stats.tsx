import { Card, CardContent, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/coach/types'

type DashboardStatsProps = {
  stats: DashboardStats
  appointmentCount: number
  activityCount: number
}

export function DashboardStatsCards({
  stats,
  appointmentCount,
  activityCount,
}: DashboardStatsProps) {
  const items = [
    {
      title: 'Aktif Öğrenci',
      value: stats.activeStudentCount,
      description: 'Devam eden koçluk ilişkisi',
      meta: '+',
      highlight: false,
    },
    {
      title: 'Okunmamış Mesaj',
      value: stats.unreadMessageCount,
      description: 'Yanıt bekleyen mesajlar',
      meta: stats.unreadMessageCount > 0 ? 'YENİ' : 'TEMİZ',
      highlight: true,
    },
    {
      title: 'Yaklaşan Randevu',
      value: appointmentCount,
      description: 'Bugün ve yarın planlanan',
      meta: '48 SA',
      highlight: false,
    },
    {
      title: 'Son Aktivite',
      value: activityCount,
      description: 'Akışta listelenen kayıt',
      meta: 'CANLI',
      highlight: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.title}
          className="group border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]"
        >
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-[#C4C9AC]">
                {item.title}
              </CardTitle>
              <span
                className={
                  item.highlight
                    ? 'rounded-full bg-[#C3F400] px-2 py-0.5 text-[10px] font-extrabold text-[#283500]'
                    : 'text-xs font-bold text-[#ABD600]'
                }
              >
                {item.meta}
              </span>
            </div>
            <p
              className={
                item.highlight
                  ? 'text-5xl font-extrabold tracking-tight text-[#ABD600]'
                  : 'text-5xl font-extrabold tracking-tight text-[#E5E1E4]'
              }
            >
              {item.value}
            </p>
            <p className="mt-2 text-xs text-[#C4C9AC]/80">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
