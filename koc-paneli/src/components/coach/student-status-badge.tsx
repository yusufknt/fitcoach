import { cn } from '@/lib/utils'
import type { CoachStudent } from '@/types'

const statusConfig: Record<
  CoachStudent['status'],
  { label: string; className: string }
> = {
  active: {
    label: 'Aktif',
    className: 'bg-[#C3F400]/15 text-[#ABD600] ring-[#ABD600]/25',
  },
  paused: {
    label: 'Duraklatıldı',
    className: 'bg-[#D2E5F5]/15 text-[#D2E5F5] ring-[#D2E5F5]/20',
  },
  completed: {
    label: 'Tamamlandı',
    className: 'bg-[#353437] text-[#C4C9AC] ring-[#444933]',
  },
}

type StudentStatusBadgeProps = {
  status: CoachStudent['status']
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 transition-all duration-200',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
