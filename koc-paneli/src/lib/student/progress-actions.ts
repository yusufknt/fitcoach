'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'

type ActionResponse = {
  success: boolean
  error?: string
}

export async function submitWeeklyProgress(formData: FormData): Promise<ActionResponse> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  // Get coach_id
  const { data: rel } = await supabase
    .from('coach_students')
    .select('coach_id')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .limit(1)
    .single()

  const coachId = rel?.coach_id
  if (!coachId) {
    return { success: false, error: 'Aktif bir koç bulunamadı.' }
  }

  const date = String(formData.get('date') ?? '')
  const weightVal = formData.get('weight')
  const weight = weightVal ? parseFloat(String(weightVal)) : null
  const note = String(formData.get('note') ?? '').trim() || null

  if (!date || weight === null || Number.isNaN(weight)) {
    return { success: false, error: 'Tarih ve kilo alanları zorunludur.' }
  }

  // Parse optional metrics
  const parseOptional = (key: string): number | null => {
    const val = String(formData.get(key) ?? '').trim()
    if (!val) return null
    const num = parseFloat(val)
    return Number.isNaN(num) ? null : num
  }

  const waist_cm = parseOptional('waistCm')
  const chest_cm = parseOptional('chestCm')
  const right_upper_arm_cm = parseOptional('rightUpperArmCm')
  const left_upper_arm_cm = parseOptional('leftUpperArmCm')
  const right_thigh_cm = parseOptional('rightThighCm')
  const left_thigh_cm = parseOptional('leftThighCm')

  const bench_press_max = parseOptional('benchPressMax')
  const squat_max = parseOptional('squatMax')
  const deadlift_max = parseOptional('deadliftMax')

  const workout_days_completed = parseOptional('workoutDaysCompleted')
  const workout_days_target = parseOptional('workoutDaysTarget')
  const sleep_hours_avg = parseOptional('sleepHoursAvg')
  const steps_avg = parseOptional('stepsAvg')
  const energy_level = parseOptional('energyLevel')
  const diet_compliance = parseOptional('dietCompliance')

  // Upload photo if exists
  const photoFile = formData.get('weeklyPhoto')
  let beforePhotoPath: string | null = null

  if (photoFile && photoFile instanceof File && photoFile.size > 0) {
    if (!photoFile.type.startsWith('image/')) {
      return { success: false, error: 'Fotoğraf dosyası geçersiz tipte.' }
    }
    if (photoFile.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Fotoğraf boyutu 10MB\'tan büyük olamaz.' }
    }

    const extension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
    const path = `${studentId}/${crypto.randomUUID()}-weekly.${safeExtension}`

    const { error: uploadErr } = await supabase.storage
      .from('progress-photos')
      .upload(path, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      })

    if (uploadErr) {
      console.error('Error uploading weekly photo:', uploadErr)
      return { success: false, error: 'Fotoğraf yüklenirken hata oluştu.' }
    }
    beforePhotoPath = path
  }

  // Construct custom_metrics
  const custom_metrics = {
    entry_type: 'weekly',
    waist_cm,
    chest_cm,
    right_upper_arm_cm,
    left_upper_arm_cm,
    right_thigh_cm,
    left_thigh_cm,
    bench_press_max,
    squat_max,
    deadlift_max,
    workout_days_completed,
    workout_days_target,
    sleep_hours_avg,
    steps_avg,
    energy_level,
    diet_compliance,
    before_photo_path: beforePhotoPath || null,
  }

  const { error } = await supabase
    .from('progress_entries')
    .insert({
      student_id: studentId,
      coach_id: coachId,
      date,
      weight,
      note,
      custom_metrics,
    })

  if (error) {
    console.error('Error saving weekly progress:', error)
    return { success: false, error: 'Veritabanına kaydedilirken bir hata oluştu.' }
  }

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')
  return { success: true }
}

const PHOTO_URL_EXPIRES_IN = 60 * 60

export async function updateProgressEntryPhoto(
  entryId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; photoUrl?: string | null }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: entry, error: fetchError } = await supabase
    .from('progress_entries')
    .select('student_id, custom_metrics')
    .eq('id', entryId)
    .single()

  if (fetchError || !entry) {
    return { success: false, error: 'Kayıt bulunamadı.' }
  }

  if (entry.student_id !== studentId) {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' }
  }

  const photoFile = formData.get('photo')
  if (!photoFile || !(photoFile instanceof File) || photoFile.size === 0) {
    return { success: false, error: 'Dosya seçilmedi.' }
  }

  if (!photoFile.type.startsWith('image/')) {
    return { success: false, error: 'Geçersiz dosya tipi.' }
  }
  if (photoFile.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Fotoğraf 10MB\'tan büyük olamaz.' }
  }

  const extension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${studentId}/${crypto.randomUUID()}-weekly.${safeExtension}`

  const { error: uploadErr } = await supabase.storage
    .from('progress-photos')
    .upload(path, photoFile, {
      contentType: photoFile.type,
      upsert: false,
    })

  if (uploadErr) {
    console.error('Error uploading weekly photo:', uploadErr)
    return { success: false, error: 'Fotoğraf yüklenirken hata oluştu.' }
  }

  // Update custom_metrics
  const customMetrics = {
    ...(entry.custom_metrics as Record<string, unknown> || {}),
    before_photo_path: path,
  }

  const { error: updateError } = await supabase
    .from('progress_entries')
    .update({ custom_metrics: customMetrics })
    .eq('id', entryId)

  if (updateError) {
    console.error('Error updating progress entry metrics:', updateError)
    return { success: false, error: 'Kayıt güncellenemedi.' }
  }

  // Generate signed URL
  let signedUrl: string | null = null
  const { data } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(path, PHOTO_URL_EXPIRES_IN)
  signedUrl = data?.signedUrl ?? null

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')

  return { success: true, photoUrl: signedUrl }
}

export async function deleteProgressEntryPhoto(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: entry, error: fetchError } = await supabase
    .from('progress_entries')
    .select('student_id, custom_metrics')
    .eq('id', entryId)
    .single()

  if (fetchError || !entry) {
    return { success: false, error: 'Kayıt bulunamadı.' }
  }

  if (entry.student_id !== studentId) {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' }
  }

  // Update custom_metrics by clearing before_photo_path
  const customMetrics = {
    ...(entry.custom_metrics as Record<string, unknown> || {}),
    before_photo_path: null,
  }

  const { error: updateError } = await supabase
    .from('progress_entries')
    .update({ custom_metrics: customMetrics })
    .eq('id', entryId)

  if (updateError) {
    console.error('Error deleting progress photo from db:', updateError)
    return { success: false, error: 'Kayıt güncellenemedi.' }
  }

  revalidatePath('/student/ilerleme')
  revalidatePath('/student/dashboard')

  return { success: true }
}

