'use client'

import { useRef, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { EventInput, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'

type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  eventType: 'available' | 'session' | 'blocked'
  description: string
  meetingUrl: string
  studentId: string | null
  studentName: string | null
}

type CalendarViewProps = {
  events: CalendarEvent[]
  onDateSelect: (info: DateSelectArg) => void
  onEventClick: (info: EventClickArg) => void
  onEventDrop: (info: EventDropArg) => void
}

const EVENT_COLORS: Record<string, { backgroundColor: string; borderColor: string }> = {
  available: { backgroundColor: '#10b981', borderColor: '#059669' },
  session: { backgroundColor: '#ABD600', borderColor: '#C3F400' },
  blocked: { backgroundColor: '#6b7280', borderColor: '#4b5563' },
}

export function CalendarView({ events, onDateSelect, onEventClick, onEventDrop }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)

  const fcEvents: EventInput[] = useMemo(() =>
    events.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      ...EVENT_COLORS[e.eventType],
      extendedProps: {
        eventType: e.eventType,
        description: e.description,
        meetingUrl: e.meetingUrl,
        studentId: e.studentId,
        studentName: e.studentName,
      },
      classNames: new Date(e.end) < new Date() ? ['opacity-40'] : [],
    })),
    [events]
  )

  return (
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
        .fc-dark-theme .fc-toolbar-title {
          color: #E5E1E4;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .fc-dark-theme .fc-col-header-cell-cushion,
        .fc-dark-theme .fc-daygrid-day-number,
        .fc-dark-theme .fc-list-day-text,
        .fc-dark-theme .fc-list-day-side-text {
          color: #C4C9AC;
          text-decoration: none;
        }
        .fc-dark-theme .fc-timegrid-slot-label-cushion {
          color: rgba(196,201,172,0.75);
          font-size: 0.75rem;
        }
        .fc-dark-theme .fc-event {
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 0.8rem;
          border-width: 0;
          border-left-width: 3px;
        }
        .fc-dark-theme .fc-button {
          border-radius: 8px;
          font-size: 0.85rem;
          padding: 6px 14px;
          transition: all 0.2s;
        }
        .fc-dark-theme .fc-scrollgrid {
          border: none;
        }
        .fc-dark-theme td, .fc-dark-theme th {
          border-color: rgba(68,73,51,0.75);
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: 'Bugün',
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
          list: 'Liste',
        }}
        locale="tr"
        firstDay={1}
        selectable
        selectMirror
        editable
        eventStartEditable
        eventDurationEditable
        events={fcEvents}
        select={onDateSelect}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        height="auto"
        dayMaxEvents={3}
        nowIndicator
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  )
}
