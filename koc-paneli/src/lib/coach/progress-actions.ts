'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { CreateProgressEntryInput, CreateProgressEntryResult } from '@/lib/coach/progress'

export async function createProgressEntry(
  input: CreateProgressEntryInput
): Promise<CreateProgressEntryResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  const { data: relation } = await supabase
    .from('coach_students')
    .select('id, student_id')
    .eq('id', input.coachStudentId)
    .eq('coach_id', coachId)
    .eq('student_id', input.studentId)
    .single()

  if (!relation) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const { error } = await supabase.from('progress_entries').insert({
    student_id: input.studentId,
    coach_id: coachId,
    date: input.date,
    weight: input.weight,
    note: input.note,
    custom_metrics: input.customMetrics,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/coach/ogrenciler/${input.coachStudentId}`)
  return { success: true }
}

export async function createProgressEntryFromForm(
  formData: FormData
): Promise<CreateProgressEntryResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const coachStudentId = String(formData.get('coachStudentId') ?? '')
  const studentId = String(formData.get('studentId') ?? '')
  const date = String(formData.get('date') ?? '')
  const weightRaw = String(formData.get('weight') ?? '').trim()
  const noteRaw = String(formData.get('note') ?? '').trim()
  const customMetricsRaw = String(formData.get('customMetricsJson') ?? '').trim()
  const beforePhoto = formData.get('beforePhoto')
  const afterPhoto = formData.get('afterPhoto')

  if (!coachStudentId || !studentId || !date) {
    return { success: false, error: 'Tarih ve öğrenci bilgisi zorunludur.' }
  }

  const weight = weightRaw ? Number(weightRaw) : null
  if (weightRaw && Number.isNaN(weight)) {
    return { success: false, error: 'Geçerli bir kilo değeri girin.' }
  }

  let customMetrics: Record<string, unknown> = {}
  if (customMetricsRaw) {
    try {
      const parsed: unknown = JSON.parse(customMetricsRaw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { success: false, error: 'Özel metrikler JSON nesnesi olmalı.' }
      }
      customMetrics = parsed as Record<string, unknown>
    } catch {
      return { success: false, error: 'Özel metrikler geçerli JSON olmalı.' }
    }
  }

  const supabase = await createClient()

  const { data: relation } = await supabase
    .from('coach_students')
    .select('id, student_id')
    .eq('id', coachStudentId)
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .single()

  if (!relation) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  const beforePhotoPath = await uploadProgressPhoto(
    supabase,
    coachId,
    studentId,
    beforePhoto,
    'before'
  )
  const afterPhotoPath = await uploadProgressPhoto(
    supabase,
    coachId,
    studentId,
    afterPhoto,
    'after'
  )

  if (beforePhotoPath === false || afterPhotoPath === false) {
    return { success: false, error: 'Fotoğraf yüklenemedi.' }
  }

  if (beforePhotoPath) {
    customMetrics.before_photo_path = beforePhotoPath
  }
  if (afterPhotoPath) {
    customMetrics.after_photo_path = afterPhotoPath
  }

  const { error } = await supabase.from('progress_entries').insert({
    student_id: studentId,
    coach_id: coachId,
    date,
    weight,
    note: noteRaw || null,
    custom_metrics: customMetrics,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  revalidatePath('/student/ilerleme')
  return { success: true }
}

async function uploadProgressPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coachId: string,
  studentId: string,
  fileValue: FormDataEntryValue | null,
  kind: 'before' | 'after'
): Promise<string | null | false> {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null
  }

  if (!fileValue.type.startsWith('image/')) {
    return false
  }

  const extension = fileValue.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${coachId}/${studentId}/${crypto.randomUUID()}-${kind}.${safeExtension}`

  const { error } = await supabase.storage
    .from('progress-photos')
    .upload(path, fileValue, {
      contentType: fileValue.type,
      upsert: false,
    })

  if (error) {
    return false
  }

  return path
}
