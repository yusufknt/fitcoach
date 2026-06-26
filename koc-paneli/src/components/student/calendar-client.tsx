'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Clock, X } from 'lucide-react'
import { formatTime, formatDateTime } from '@/lib/coach/format'
import type { StudentCalendarEvent } from '@/lib/student/types'
import type { EventInput, EventClickArg } from '@fullcalendar/core'

type CalendarClientProps = {
  events: StudentCalendarEvent[]
}

const EVENT_COLORS: Record<string, { backgroundColor: string; borderColor: string }> = {
  available: { backgroundColor: '#10b981', borderColor: '#059669' },
  session: { backgroundColor: '#ABD600', borderColor: '#C3F400' },
  blocked: { backgroundColor: '#6b7280', borderColor: '#4b5563' },
}

export function StudentCalendarClient({ events }: CalendarClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<StudentCalendarEvent | null>(null)

  const fcEvents: EventInput[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    ...EVENT_COLORS[e.eventType],
    extendedProps: { ...e },
    classNames: new Date(e.end) < new Date() ? ['opacity-40'] : [],
  }))

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as StudentCalendarEvent
    setSelectedEvent(props)
  }

  // This week's sessions
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const thisWeekSessions = events.filter(
    (e) => e.eventType === 'session' &&
      new Date(e.start) >= weekStart && new Date(e.start) < weekEnd
  )

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Calendar */}
      <div className="flex-1 min-w-0">
        <div className="fc-dark-theme coach-card p-4">
          <style>{`
            .fc-dark-theme {
              --fc-border-color: #444933;
              --fc-button-bg-color: #201F22;
              --fc-button-border-color: #444933;
              --fc-button-text-color: #E5E1E4;
              --fc-button-hover-bg-color: #2A2A2C;
              --fc-button-hover-border-color: #ABD600;
              --fc-button-active-bg-color: #C3F400;
              --fc-button-active-border-color: #C3F400;
              --fc-button-active-text-color: #283500;
              --fc-page-bg-color: transparent;
              --fc-neutral-bg-color: rgba(196,201,172,0.06);
              --fc-today-bg-color: rgba(171,214,0,0.08);
              --fc-event-border-color: transparent;
              --fc-now-indicator-color: #ABD600;
              --fc-list-event-hover-bg-color: #2A2A2C;
            }
            .fc-dark-theme .fc-toolbar-title { color: #E5E1E4; font-size: 1.25rem; font-weight: 700; }
            .fc-dark-theme .fc-col-header-cell-cushion,
            .fc-dark-theme .fc-daygrid-day-number,
            .fc-dark-theme .fc-list-day-text,
            .fc-dark-theme .fc-list-day-side-text { color: #C4C9AC; text-decoration: none; }
            .fc-dark-theme .fc-timegrid-slot-label-cushion { color: rgba(196,201,172,0.75); font-size: 0.75rem; }
            .fc-dark-theme .fc-event { border-radius: 6px; padding: 2px 6px; font-size: 0.8rem; border-width: 0; border-left-width: 3px; }
            .fc-dark-theme .fc-button { border-radius: 8px; font-size: 0.85rem; padding: 6px 14px; transition: all 0.2s; }
            .fc-dark-theme .fc-scrollgrid { border: none; }
            .fc-dark-theme td, .fc-dark-theme th { border-color: rgba(68,73,51,0.75); }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            buttonText={{ today: 'Bugün', month: 'Ay', week: 'Hafta' }}
            locale="tr"
            firstDay={1}
            events={fcEvents}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={3}
            nowIndicator
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full shrink-0 lg:w-72">
        <Card className="coach-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#C4C9AC]">Bu Haftaki Seanslar</CardTitle>
          </CardHeader>
          <CardContent>
            {thisWeekSessions.length === 0 ? (
              <p className="text-sm text-[#C4C9AC]">Bu hafta seans yok.</p>
            ) : (
              <ul className="space-y-3">
                {thisWeekSessions.map((s) => (
                  <li key={s.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ABD600]" />
                    <div>
                      <p className="text-sm font-medium text-[#E5E1E4]">{s.title}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-[#C4C9AC]">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(s.start)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#E5E1E4]">{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} className="rounded-lg p-1.5 text-[#C4C9AC] hover:bg-[#2A2A2C]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#C4C9AC]">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</span>
              </div>
              {selectedEvent.description && (
                <p className="text-[#C4C9AC]">{selectedEvent.description}</p>
              )}
              {selectedEvent.meetingUrl && (
                <a
                  href={selectedEvent.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#C3F400] px-4 py-2.5 text-sm font-medium text-[#283500] transition hover:bg-[#ABD600]"
                >
                  <Video className="h-4 w-4" />
                  Görüşmeye Katıl
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
