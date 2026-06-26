import { createClient } from '@/lib/supabase/client'
import type { CalendarEventFormData } from './types'

export async function createCalendarEvent(coachId: string, data: CalendarEventFormData) {
  const supabase = createClient()

  const { data: result, error } = await supabase
    .from('calendar_events')
    .insert({
      coach_id: coachId,
      title: data.title,
      event_type: data.event_type,
      start_time: data.start_time,
      end_time: data.end_time,
      student_id: data.student_id || null,
      description: data.description || null,
      meeting_url: data.meeting_url || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return null
  }

  return result
}

export async function updateCalendarEvent(eventId: string, data: Partial<CalendarEventFormData>) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.event_type !== undefined) updateData.event_type = data.event_type
  if (data.start_time !== undefined) updateData.start_time = data.start_time
  if (data.end_time !== undefined) updateData.end_time = data.end_time
  if (data.student_id !== undefined) updateData.student_id = data.student_id || null
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.meeting_url !== undefined) updateData.meeting_url = data.meeting_url || null

  const { error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', eventId)

  if (error) {
    console.error('Error updating event:', error)
    return false
  }

  return true
}

export async function deleteCalendarEvent(eventId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event:', error)
    return false
  }

  return true
}

export async function moveCalendarEvent(eventId: string, newStart: string, newEnd: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('calendar_events')
    .update({ start_time: newStart, end_time: newEnd })
    .eq('id', eventId)

  if (error) {
    console.error('Error moving event:', error)
    return false
  }

  return true
}
