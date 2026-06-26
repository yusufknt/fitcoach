'use client'

import { useState, useCallback } from 'react'
import { CalendarView } from './calendar-view'
import { CalendarSidebar } from './calendar-sidebar'
import { EventModal } from './event-modal'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, moveCalendarEvent } from '@/lib/coach/calendar.client'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { CalendarEventFormData, CalendarSummary, StudentOption } from '@/lib/coach/types'
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core'
import { CoachPageHeader } from '@/components/coach/page-header'

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

type CalendarLayoutProps = {
  coachId: string
  initialEvents: CalendarEvent[]
  initialSummary: CalendarSummary
  students: StudentOption[]
}

export function CalendarLayout({ coachId, initialEvents, initialSummary, students }: CalendarLayoutProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingEvent, setEditingEvent] = useState<(Partial<CalendarEventFormData> & { id?: string }) | undefined>()

  const toLocalDatetime = (isoStr: string) => {
    const d = new Date(isoStr)
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setModalMode('create')
    setEditingEvent({
      start_time: toLocalDatetime(info.startStr),
      end_time: toLocalDatetime(info.endStr),
    })
    setModalOpen(true)
  }, [])

  const handleEventClick = useCallback((info: EventClickArg) => {
    const evt = info.event
    const props = evt.extendedProps
    setModalMode('edit')
    setEditingEvent({
      id: evt.id,
      title: evt.title,
      event_type: props.eventType,
      start_time: toLocalDatetime(evt.startStr),
      end_time: toLocalDatetime(evt.endStr || evt.startStr),
      student_id: props.studentId ?? '',
      description: props.description ?? '',
      meeting_url: props.meetingUrl ?? '',
    })
    setModalOpen(true)
  }, [])

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const success = await moveCalendarEvent(
      info.event.id,
      info.event.startStr,
      info.event.endStr || info.event.startStr
    )
    if (!success) {
      info.revert()
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === info.event.id
            ? { ...e, start: info.event.startStr, end: info.event.endStr || info.event.startStr }
            : e
        )
      )
    }
  }, [])

  const handleSave = useCallback(async (data: CalendarEventFormData) => {
    if (modalMode === 'create') {
      const result = await createCalendarEvent(coachId, data)
      if (result) {
        const studentName = students.find((s) => s.id === data.student_id)?.fullName ?? null
        setEvents((prev) => [
          ...prev,
          {
            id: result.id,
            title: data.title,
            start: result.start_time,
            end: result.end_time,
            eventType: data.event_type,
            description: data.description,
            meetingUrl: data.meeting_url,
            studentId: data.student_id,
            studentName,
          },
        ])
      }
    } else if (editingEvent?.id) {
      const success = await updateCalendarEvent(editingEvent.id, data)
      if (success) {
        const studentName = students.find((s) => s.id === data.student_id)?.fullName ?? null
        setEvents((prev) =>
          prev.map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  title: data.title,
                  start: new Date(data.start_time).toISOString(),
                  end: new Date(data.end_time).toISOString(),
                  eventType: data.event_type,
                  description: data.description,
                  meetingUrl: data.meeting_url,
                  studentId: data.student_id,
                  studentName,
                }
              : e
          )
        )
      }
    }
    setModalOpen(false)
    setEditingEvent(undefined)
  }, [coachId, modalMode, editingEvent, students])

  const handleDelete = useCallback(async () => {
    if (!editingEvent?.id) return
    const success = await deleteCalendarEvent(editingEvent.id)
    if (success) {
      setEvents((prev) => prev.filter((e) => e.id !== editingEvent.id))
    }
    setModalOpen(false)
    setEditingEvent(undefined)
  }, [editingEvent])

  const handleAddAvailability = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0)
    setModalMode('create')
    setEditingEvent({
      event_type: 'available',
      title: 'Müsait',
      start_time: toLocalDatetime(start.toISOString()),
      end_time: toLocalDatetime(end.toISOString()),
    })
    setModalOpen(true)
  }

  return (
    <>
      <div className="space-y-8">
        <CoachPageHeader
          title="Takvim"
          description="Randevularınızı ve müsaitliğinizi yönetin."
          action={
            <Button onClick={handleAddAvailability} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
              <Plus className="mr-2 h-4 w-4" />
              Müsait Saat Ekle
            </Button>
          }
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Calendar */}
          <div className="min-w-0 flex-1">
          <CalendarView
            events={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          />
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72">
            <CalendarSidebar summary={initialSummary} />
          </div>
        </div>
      </div>

      {/* Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingEvent(undefined)
        }}
        onSave={handleSave}
        onDelete={modalMode === 'edit' ? handleDelete : undefined}
        students={students}
        initialData={editingEvent}
        mode={modalMode}
      />
    </>
  )
}
