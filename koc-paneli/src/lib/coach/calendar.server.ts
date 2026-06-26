import { createClient } from '@/lib/supabase/server'
import type { CalendarSummary, StudentOption } from './types'

interface CalendarEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: string
  description: string | null
  meeting_url: string | null
  student_id: string | null
  student: { full_name: string } | null
}

interface TodayEventRow {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  student: { full_name: string } | null
}

interface StudentOptionRow {
  student_id: string
  profiles: { id: string; full_name: string } | { id: string; full_name: string }[] | null
}

export async function getCalendarEvents(coachId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('calendar_events')
    .select(
      '*, student:profiles!calendar_events_student_id_fkey(full_name)'
    )
    .eq('coach_id', coachId)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }

  return ((data as CalendarEventRow[] | null) ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    eventType: e.event_type as 'available' | 'session' | 'blocked',
    description: e.description ?? '',
    meetingUrl: e.meeting_url ?? '',
    studentId: e.student_id,
    studentName: e.student?.full_name ?? null,
  }))
}

export async function getCalendarSummary(coachId: string): Promise<CalendarSummary> {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  // Week range (Monday to Sunday)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [todayResult, weekResult] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, start_time, end_time, event_type, student:profiles!calendar_events_student_id_fkey(full_name)')
      .eq('coach_id', coachId)
      .gte('start_time', todayStart)
      .lt('start_time', todayEnd)
      .order('start_time', { ascending: true }),
    supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('event_type', 'session')
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString()),
  ])

  const todayEvents = ((todayResult.data as TodayEventRow[] | null) ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    startTime: e.start_time,
    endTime: e.end_time,
    eventType: e.event_type,
    studentName: e.student?.full_name ?? null,
  }))

  return {
    todayEvents,
    weekSessionCount: weekResult.count ?? 0,
  }
}

export async function getStudentOptions(coachId: string): Promise<StudentOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coach_students')
    .select('student_id, profiles!coach_students_student_id_fkey(id, full_name)')
    .eq('coach_id', coachId)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching student options:', error)
    return []
  }

  return ((data as unknown as StudentOptionRow[] | null) ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      id: profile?.id ?? row.student_id,
      fullName: profile?.full_name ?? 'İsimsiz',
    }
  })
}
