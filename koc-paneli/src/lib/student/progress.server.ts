import { createClient } from '@/lib/supabase/server'
import type { ProgressSummary, ProgressEntryItem } from './types'

const PHOTO_URL_EXPIRES_IN = 60 * 60

export async function getProgressData(studentId: string): Promise<{
  summary: ProgressSummary
  entries: ProgressEntryItem[]
  coachId: string | null
}> {
  const supabase = await createClient()

  // Get coach_id
  const { data: rel } = await supabase
    .from('coach_students')
    .select('coach_id')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .limit(1)
    .single()

  const coachId = rel?.coach_id ?? null

  // All progress entries
  const { data: entries, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching progress:', error)
    return { summary: { startWeight: null, currentWeight: null, difference: null }, entries: [], coachId }
  }

  const allEntries = entries ?? []
  const weightsOnly = allEntries.filter((e) => e.weight != null)

  const startWeight = weightsOnly.length > 0 ? weightsOnly[0].weight : null
  const currentWeight = weightsOnly.length > 0 ? weightsOnly[weightsOnly.length - 1].weight : null
  const difference = startWeight != null && currentWeight != null ? currentWeight - startWeight : null

  const mapped: ProgressEntryItem[] = await Promise.all(
    allEntries.map(async (e) => {
      const customMetrics = (e.custom_metrics as Record<string, string | number | boolean | null | undefined>) ?? {}
      const beforePhotoPath =
        typeof customMetrics.before_photo_path === 'string'
          ? customMetrics.before_photo_path
          : null
      const afterPhotoPath =
        typeof customMetrics.after_photo_path === 'string'
          ? customMetrics.after_photo_path
          : null

      const [beforePhotoUrl, afterPhotoUrl] = await Promise.all([
        createSignedProgressPhotoUrl(supabase, beforePhotoPath),
        createSignedProgressPhotoUrl(supabase, afterPhotoPath),
      ])

      return {
        id: e.id,
        date: e.date,
        weight: e.weight,
        note: e.note,
        beforePhotoUrl,
        afterPhotoUrl,
        createdAt: e.created_at,
        isOwnEntry: e.student_id === studentId && e.coach_id !== studentId,
        customMetrics,
      }
    })
  )

  // Reverse for display (newest first)
  mapped.reverse()

  return {
    summary: { startWeight, currentWeight, difference },
    entries: mapped,
    coachId,
  }
}

async function createSignedProgressPhotoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null
) {
  if (!path) {
    return null
  }

  const { data, error } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(path, PHOTO_URL_EXPIRES_IN)

  if (error) {
    return null
  }

  return data.signedUrl
}
