import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'
import type { TopActiveStudent } from '@/lib/coach/types'

type TopStudentsProps = {
  students: TopActiveStudent[]
}

export function TopStudents({ students }: TopStudentsProps) {
  return (
    <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#E5E1E4]">
          <Trophy className="h-5 w-5 text-[#ABD600]" />
          En Aktif Öğrenciler
        </CardTitle>
        <p className="text-sm text-[#C4C9AC]">Son 7 gün</p>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-sm text-[#C4C9AC]">
            Bu dönemde ilerleme kaydı bulunamadı.
          </p>
        ) : (
          <ul className="space-y-3">
            {students.map((student, index) => (
              <li
                key={student.studentId}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#2A2A2C]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#201F22] text-xs font-bold text-[#ABD600]">
                  {index + 1}
                </span>
                <Avatar className="h-10 w-10 border border-[#444933]">
                  {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                  <AvatarFallback className="bg-[#353437] text-sm text-[#E5E1E4]">
                    {student.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#E5E1E4]">
                    {student.fullName}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#353437]">
                    <div
                      className="h-full rounded-full bg-[#ABD600]"
                      style={{ width: `${Math.min(100, student.progressCount * 20)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#C4C9AC]">
                  {student.progressCount} kayıt
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
