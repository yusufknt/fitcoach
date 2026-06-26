import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { ProgressEntry } from '@/types'

const PHOTO_URL_EXPIRES_IN = 60 * 60

export type CreateProgressEntryInput = {
  coachStudentId: string
  studentId: string
  date: string
  weight: number | null
  note: string | null
  customMetrics: Record<string, unknown>
}

export type CreateProgressEntryResult =
  | { success: true }
  | { success: false; error: string }

export async function getProgressEntries(
  studentId: string
): Promise<ProgressEntry[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .order('date', { ascending: true })

  if (error || !data) {
    return []
  }

  return Promise.all(
    data.map(async (entry) => {
      const customMetrics =
        (entry.custom_metrics as Record<string, unknown>) ?? {}
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
        ...entry,
        weight: entry.weight !== null ? Number(entry.weight) : null,
        custom_metrics: customMetrics,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
      }
    })
  )
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
