import { createClient } from '@/lib/supabase/client'

export async function addProgressEntry(studentId: string, coachId: string, data: { date: string; weight: number | null; note: string }) {
  const supabase = createClient()

  const { data: result, error } = await supabase
    .from('progress_entries')
    .insert({
      student_id: studentId,
      coach_id: coachId,
      date: data.date,
      weight: data.weight,
      note: data.note || null,
      custom_metrics: {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding progress entry:', error)
    return null
  }
  return result
}

export async function deleteProgressEntry(entryId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('progress_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting progress entry:', error)
    return false
  }
  return true
}

export async function quickWeightEntry(studentId: string, coachId: string, weight: number) {
  const today = new Date().toISOString().slice(0, 10)
  return addProgressEntry(studentId, coachId, { date: today, weight, note: '' })
}
