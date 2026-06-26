import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
export type ProgramListItem = {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  createdAt: string
}

export async function getStudentPrograms(
  studentId: string
): Promise<ProgramListItem[] | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programs')
    .select('id, title, description, file_name, file_url, created_at')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    fileName: row.file_name,
    filePath: row.file_url,
    createdAt: row.created_at,
  }))
}

export function buildProgramStoragePath(
  coachId: string,
  studentId: string,
  fileName: string
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${coachId}/${studentId}/${Date.now()}-${safeName}`
}
