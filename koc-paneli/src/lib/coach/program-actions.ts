'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { buildProgramStoragePath } from '@/lib/coach/programs'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type ActionResult = { success: true } | { success: false; error: string }

async function verifyCoachStudent(
  coachId: string,
  coachStudentId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('coach_students')
    .select('id')
    .eq('id', coachStudentId)
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .single()

  return Boolean(data)
}

export async function uploadProgram(formData: FormData): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const coachStudentId = String(formData.get('coachStudentId') ?? '')
  const studentId = String(formData.get('studentId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('file')

  if (!coachStudentId || !studentId || !title) {
    return { success: false, error: 'Başlık ve öğrenci bilgisi gerekli.' }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'PDF dosyası seçin.' }
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Sadece PDF dosyası yüklenebilir.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Dosya boyutu en fazla 10 MB olabilir.' }
  }

  const isLinked = await verifyCoachStudent(coachId, coachStudentId, studentId)
  if (!isLinked) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const storagePath = buildProgramStoragePath(coachId, studentId, file.name)
  const supabase = await createClient()

  const { error: uploadError } = await supabase.storage
    .from('programs')
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { error: insertError } = await supabase.from('programs').insert({
    coach_id: coachId,
    student_id: studentId,
    title,
    description: description || null,
    file_url: storagePath,
    file_name: file.name,
  })

  if (insertError) {
    await supabase.storage.from('programs').remove([storagePath])
    return { success: false, error: insertError.message }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function deleteProgram(
  programId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()
  const { data: program, error: fetchError } = await supabase
    .from('programs')
    .select('id, file_url')
    .eq('id', programId)
    .eq('coach_id', coachId)
    .single()

  if (fetchError || !program) {
    return { success: false, error: 'Program bulunamadı.' }
  }

  const { error: storageError } = await supabase.storage
    .from('programs')
    .remove([program.file_url])

  if (storageError) {
    return { success: false, error: storageError.message }
  }

  const { error: deleteError } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId)
    .eq('coach_id', coachId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function getProgramDownloadUrl(
  programId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()
  const { data: program, error } = await supabase
    .from('programs')
    .select('file_url, file_name')
    .eq('id', programId)
    .eq('coach_id', coachId)
    .single()

  if (error || !program) {
    return { success: false, error: 'Program bulunamadı.' }
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('programs')
    .createSignedUrl(program.file_url, 120)

  if (signError || !signed?.signedUrl) {
    return { success: false, error: signError?.message ?? 'İndirme linki oluşturulamadı.' }
  }

  return { success: true, url: signed.signedUrl }
}
