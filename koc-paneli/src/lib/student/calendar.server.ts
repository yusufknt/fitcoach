import { createClient } from '@/lib/supabase/server'
import type { StudentCalendarEvent } from './types'

interface CalendarEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  description: string | null
  meeting_url: string | null
  student_id: string | null
}

export async function getStudentCalendarEvents(studentId: string): Promise<StudentCalendarEvent[]> {
  const supabase = await createClient()

  // Get coach
  const { data: rel } = await supabase
    .from('coach_students')
    .select('coach_id')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!rel) return []

  // Get available slots + sessions for this student
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('coach_id', rel.coach_id)
    .or(`event_type.eq.available,and(event_type.eq.session,student_id.eq.${studentId})`)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching calendar:', error)
    return []
  }

  return ((data as CalendarEventRow[] | null) ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    eventType: e.event_type,
    description: e.description ?? '',
    meetingUrl: e.meeting_url ?? '',
    studentName: null,
  }))
}
