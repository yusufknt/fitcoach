import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentStatusBadge } from '@/components/coach/student-status-badge'
import { formatDate } from '@/lib/coach/format'
import type { CoachStudentDetail } from '@/lib/coach/types'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'

type StudentProfileHeaderProps = {
  student: CoachStudentDetail
  onboarding: StudentOnboardingView | null
}

const experienceMap: Record<string, string> = {
  beginner: 'Yeni Başlayan',
  '1-3years': '1-3 Yıl',
  '3plus': '3+ Yıl',
}

const goalMap: Record<string, string> = {
  muscle_gain: 'Kas Kazanımı',
  fat_loss: 'Yağ Yakımı',
  recomposition: 'Rekomposizyon',
  strength: 'Güç',
}

function calculateAge(birthDate: string | null): number | string {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function StudentProfileHeader({ student, onboarding }: StudentProfileHeaderProps) {
  return (
    <Card className="coach-card">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-[#444933]">
              {student.avatarUrl && (
                <AvatarImage src={student.avatarUrl} alt={student.fullName} />
              )}
              <AvatarFallback className="bg-[#353437] text-[#E5E1E4]">
                {student.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#E5E1E4]">{student.fullName}</h1>
                <StudentStatusBadge status={student.status} />
              </div>
              <p className="text-sm text-[#C4C9AC]">
                {student.packageName ?? 'Paket atanmamış'} · Başlangıç:{' '}
                {formatDate(student.startDate)}
                {student.endDate
                  ? ` · Bitiş: ${formatDate(student.endDate)}`
                  : ''}
              </p>
            </div>
          </div>

          <Link
            href="/coach/ogrenciler"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'border-[#444933] text-[#E5E1E4] hover:bg-[#2A2A2C]',
            })}
          >
            Listeye dön
          </Link>
        </div>

        {/* Quick Physical Profile metrics bar */}
        {onboarding?.profile && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#444933]/45 pt-3.5 text-xs text-[#C4C9AC]">
            <div className="flex items-center gap-1.5">
              <span>Boy:</span>
              <span className="font-bold text-[#E5E1E4]">{onboarding.profile.height_cm} cm</span>
            </div>
            <div className="h-3 w-[1px] bg-[#444933]/50 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Başlangıç Kilosu:</span>
              <span className="font-bold text-[#E5E1E4]">{onboarding.profile.initial_weight} kg</span>
            </div>
            <div className="h-3 w-[1px] bg-[#444933]/50 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Yaş:</span>
              <span className="font-bold text-[#E5E1E4]">{calculateAge(onboarding.profile.birth_date)}</span>
            </div>
            <div className="h-3 w-[1px] bg-[#444933]/50 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Hedef:</span>
              <span className="font-bold text-[#ABD600]">
                {onboarding.profile.goal ? (goalMap[onboarding.profile.goal] || onboarding.profile.goal) : '-'}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-[#444933]/50 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Deneyim:</span>
              <span className="font-bold text-[#E5E1E4]">
                {onboarding.profile.experience ? (experienceMap[onboarding.profile.experience] || onboarding.profile.experience) : '-'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
