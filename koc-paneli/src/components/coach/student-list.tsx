'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentStatusBadge } from '@/components/coach/student-status-badge'
import { formatDate, formatRelativeTime } from '@/lib/coach/format'
import type { CoachStudentListItem } from '@/lib/coach/types'
import { Search } from 'lucide-react'

type StudentListProps = {
  students: CoachStudentListItem[]
}

export function StudentList({ students }: StudentListProps) {
  const [query, setQuery] = useState('')

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr')
    if (!normalized) return students

    return students.filter((student) =>
      student.fullName.toLocaleLowerCase('tr').includes(normalized)
    )
  }, [query, students])

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C9AC]" />
        <Input
          type="search"
          placeholder="Öğrenci ara..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="coach-input h-11 pl-10"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="coach-card border-dashed p-8 text-center text-sm text-[#C4C9AC]">
          {students.length === 0
            ? 'Henüz öğrenci bulunmuyor.'
            : 'Aramanızla eşleşen öğrenci yok.'}
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/coach/ogrenciler/${student.id}`}
              className="block"
            >
              <Card className="coach-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="size-12 border border-[#444933]">
                    {student.avatarUrl && (
                      <AvatarImage
                        src={student.avatarUrl}
                        alt={student.fullName}
                      />
                    )}
                    <AvatarFallback className="bg-[#353437] text-[#E5E1E4]">
                      {student.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#E5E1E4]">{student.fullName}</p>
                      <StudentStatusBadge status={student.status} />
                    </div>
                    <p className="text-sm text-[#C4C9AC]">
                      {student.packageName ?? 'Paket atanmamış'} · Başlangıç:{' '}
                      {formatDate(student.startDate)}
                    </p>
                    {student.lastActivityAt && (
                      <p className="mt-1 text-xs text-[#C4C9AC]/70">
                        Son aktivite:{' '}
                        {formatRelativeTime(student.lastActivityAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
