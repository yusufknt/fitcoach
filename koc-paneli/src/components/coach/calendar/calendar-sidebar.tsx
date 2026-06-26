'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock } from 'lucide-react'
import { formatTime } from '@/lib/coach/format'
import type { CalendarSummary } from '@/lib/coach/types'

type CalendarSidebarProps = {
  summary: CalendarSummary
}

const typeColors: Record<string, string> = {
  available: 'bg-emerald-500',
  session: 'bg-[#ABD600]',
  blocked: 'bg-gray-500',
}

export function CalendarSidebar({ summary }: CalendarSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Week session count */}
      <Card className="coach-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#C4C9AC]">Bu Hafta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-extrabold text-[#E5E1E4]">{summary.weekSessionCount}</p>
          <p className="mt-1 text-xs text-[#C4C9AC]">toplam seans</p>
        </CardContent>
      </Card>

      {/* Today events */}
      <Card className="coach-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#C4C9AC]">
            <CalendarDays className="h-4 w-4" />
            Bugünkü Etkinlikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.todayEvents.length === 0 ? (
            <p className="text-sm text-[#C4C9AC]">Bugün etkinlik yok.</p>
          ) : (
            <ul className="space-y-3">
              {summary.todayEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeColors[event.eventType]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#E5E1E4]">{event.title}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-[#C4C9AC]">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
                    </div>
                    {event.studentName && (
                      <p className="mt-0.5 text-xs text-[#ABD600]">{event.studentName}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
