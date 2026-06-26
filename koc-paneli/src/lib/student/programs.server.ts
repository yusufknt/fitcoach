import { createClient } from '@/lib/supabase/server'
import type { StudentProgram } from './types'

export async function getStudentPrograms(studentId: string): Promise<StudentProgram[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching programs:', error)
    return []
  }

  const threeDaysAgo = Date.now() - 3 * 86400000

  const programs = await Promise.all(
    (data ?? []).map(async (p) => {
      let fileUrl = p.file_url

      // Generate signed URL
      const { data: signedData, error: signError } = await supabase.storage
        .from('programs')
        .createSignedUrl(p.file_url, 3600) // 1 hour

      if (!signError && signedData?.signedUrl) {
        fileUrl = signedData.signedUrl
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        fileUrl,
        fileName: p.file_name,
        createdAt: p.created_at,
        isNew: new Date(p.created_at).getTime() > threeDaysAgo,
      }
    })
  )

  return programs
}
