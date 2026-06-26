'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Trash2 } from 'lucide-react'
import type { CalendarEventFormData, StudentOption } from '@/lib/coach/types'

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CalendarEventFormData) => void
  onDelete?: () => void
  students: StudentOption[]
  initialData?: Partial<CalendarEventFormData> & { id?: string }
  mode: 'create' | 'edit'
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  students,
  initialData,
  mode,
}: EventModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [eventType, setEventType] = useState<'available' | 'session' | 'blocked'>(
    initialData?.event_type ?? 'session'
  )
  const [startTime, setStartTime] = useState(initialData?.start_time ?? '')
  const [endTime, setEndTime] = useState(initialData?.end_time ?? '')
  const [studentId, setStudentId] = useState(initialData?.student_id ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [meetingUrl, setMeetingUrl] = useState(initialData?.meeting_url ?? '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: title || (eventType === 'available' ? 'Müsait' : eventType === 'blocked' ? 'Bloklu' : 'Seans'),
      event_type: eventType,
      start_time: startTime,
      end_time: endTime,
      student_id: studentId || null,
      description,
      meeting_url: meetingUrl,
    })
  }

  const eventTypes = [
    { value: 'session' as const, label: 'Seans', color: 'bg-[#ABD600]' },
    { value: 'available' as const, label: 'Müsait', color: 'bg-emerald-500' },
    { value: 'blocked' as const, label: 'Bloklu', color: 'bg-gray-500' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {mode === 'create' ? 'Yeni Etkinlik' : 'Etkinliği Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#C4C9AC] transition-colors hover:bg-[#2A2A2C] hover:text-[#E5E1E4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Type */}
          <div>
            <Label className="mb-2 text-[#C4C9AC]">Etkinlik Tipi</Label>
            <div className="mt-2 flex gap-2">
              {eventTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setEventType(t.value)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    eventType === t.value
                      ? 'bg-[#C3F400] text-[#283500] ring-1 ring-[#C3F400]/30'
                      : 'text-[#C4C9AC] hover:bg-[#2A2A2C] hover:text-[#E5E1E4]'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="event-title" className="text-[#C4C9AC]">Başlık</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === 'session' ? 'Seans başlığı' : eventType === 'available' ? 'Müsait' : 'Bloklu'}
              className="coach-input mt-1.5"
            />
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time" className="text-[#C4C9AC]">Başlangıç</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="end-time" className="text-[#C4C9AC]">Bitiş</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="coach-input mt-1.5"
              />
            </div>
          </div>

          {/* Student (for session type) */}
          {eventType === 'session' && (
            <div>
              <Label htmlFor="student-select" className="text-[#C4C9AC]">Öğrenci</Label>
              <select
                id="student-select"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="coach-input mt-1.5 w-full rounded-xl px-3 py-2 text-sm"
                required
              >
                <option value="">Öğrenci seçin...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="event-desc" className="text-[#C4C9AC]">Açıklama</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opsiyonel açıklama..."
              className="coach-input mt-1.5 min-h-[80px] resize-none"
            />
          </div>

          {/* Meeting URL */}
          {eventType === 'session' && (
            <div>
              <Label htmlFor="meeting-url" className="text-[#C4C9AC]">Görüşme Linki (Zoom/Meet)</Label>
              <Input
                id="meeting-url"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="coach-input mt-1.5"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="text-[#C4C9AC] hover:bg-[#2A2A2C]">
                İptal
              </Button>
              <Button type="submit" className="bg-[#C3F400] px-6 text-[#283500] hover:bg-[#ABD600]">
                {mode === 'create' ? 'Oluştur' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
