'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedStudentId } from '@/lib/student/auth'

type OnboardingResult = {
  success: boolean
  error?: string
}

export async function submitOnboarding(
  formData: FormData
): Promise<OnboardingResult> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  // Parse form fields
  const heightCm = parseFloat(String(formData.get('heightCm') ?? ''))
  const birthDate = String(formData.get('birthDate') ?? '')
  const gender = String(formData.get('gender') ?? '')
  const experience = String(formData.get('experience') ?? '')
  const goal = String(formData.get('goal') ?? '')
  const initialWeight = parseFloat(String(formData.get('initialWeight') ?? ''))

  // Validate required fields
  if (!heightCm || !birthDate || !gender || !experience || !goal || !initialWeight) {
    return { success: false, error: 'Zorunlu alanlar eksik: boy, doğum tarihi, cinsiyet, deneyim, hedef ve kilo.' }
  }

  if (!['male', 'female'].includes(gender)) {
    return { success: false, error: 'Geçersiz cinsiyet değeri.' }
  }
  if (!['beginner', '1-3years', '3plus'].includes(experience)) {
    return { success: false, error: 'Geçersiz deneyim değeri.' }
  }
  if (!['muscle_gain', 'fat_loss', 'recomposition', 'strength'].includes(goal)) {
    return { success: false, error: 'Geçersiz hedef değeri.' }
  }

  // Parse optional measurement fields
  const parseOptional = (key: string): number | null => {
    const val = String(formData.get(key) ?? '').trim()
    if (!val) return null
    const num = parseFloat(val)
    return Number.isNaN(num) ? null : num
  }

  const chestCm = parseOptional('chestCm')
  const waistCm = parseOptional('waistCm')
  const hipCm = parseOptional('hipCm')
  const neckCm = parseOptional('neckCm')
  const rightUpperArmCm = parseOptional('rightUpperArmCm')
  const leftUpperArmCm = parseOptional('leftUpperArmCm')
  const rightThighCm = parseOptional('rightThighCm')
  const leftThighCm = parseOptional('leftThighCm')
  const rightCalfCm = parseOptional('rightCalfCm')
  const leftCalfCm = parseOptional('leftCalfCm')
  const bodyFatPercentage = parseOptional('bodyFatPercentage')

  // Parse optional text fields
  const injuries = String(formData.get('injuries') ?? '').trim() || null
  const supplements = String(formData.get('supplements') ?? '').trim() || null

  // Upload photos
  const frontPhoto = formData.get('photoFront')
  const sidePhoto = formData.get('photoSide')
  const backPhoto = formData.get('photoBack')

  const photoFrontPath = await uploadOnboardingPhoto(supabase, studentId, frontPhoto, 'front')
  const photoSidePath = await uploadOnboardingPhoto(supabase, studentId, sidePhoto, 'side')
  const photoBackPath = await uploadOnboardingPhoto(supabase, studentId, backPhoto, 'back')

  if (photoFrontPath === false || photoSidePath === false || photoBackPath === false) {
    return { success: false, error: 'Fotoğraf yüklenirken bir hata oluştu.' }
  }

  // Check if profile already exists (update vs insert)
  const { data: existing } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('student_id', studentId)
    .single()

  const profileData = {
    student_id: studentId,
    height_cm: heightCm,
    birth_date: birthDate,
    gender,
    experience,
    goal,
    initial_weight: initialWeight,
    chest_cm: chestCm,
    waist_cm: waistCm,
    hip_cm: hipCm,
    neck_cm: neckCm,
    right_upper_arm_cm: rightUpperArmCm,
    left_upper_arm_cm: leftUpperArmCm,
    right_thigh_cm: rightThighCm,
    left_thigh_cm: leftThighCm,
    right_calf_cm: rightCalfCm,
    left_calf_cm: leftCalfCm,
    body_fat_percentage: bodyFatPercentage,
    photo_front_path: photoFrontPath || null,
    photo_side_path: photoSidePath || null,
    photo_back_path: photoBackPath || null,
    injuries,
    supplements,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from('student_profiles')
      .update(profileData)
      .eq('student_id', studentId)

    if (error) {
      console.error('Error updating student profile:', error)
      return { success: false, error: 'Profil güncellenirken bir hata oluştu.' }
    }
  } else {
    const { error } = await supabase
      .from('student_profiles')
      .insert(profileData)

    if (error) {
      console.error('Error creating student profile:', error)
      return { success: false, error: 'Profil oluşturulurken bir hata oluştu.' }
    }
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/student/onboarding')
  return { success: true }
}

async function uploadOnboardingPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  fileValue: FormDataEntryValue | null,
  kind: 'front' | 'side' | 'back'
): Promise<string | null | false> {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null // No file provided — that's OK (optional)
  }

  if (!fileValue.type.startsWith('image/')) {
    return false // Invalid file type
  }

  // Max 10MB
  if (fileValue.size > 10 * 1024 * 1024) {
    return false
  }

  const extension = fileValue.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg'
  const path = `${studentId}/${crypto.randomUUID()}-${kind}.${safeExtension}`

  const { error } = await supabase.storage
    .from('progress-photos')
    .upload(path, fileValue, {
      contentType: fileValue.type,
      upsert: false,
    })

  if (error) {
    console.error(`Error uploading onboarding photo (${kind}):`, error)
    return false
  }

  return path
}

export async function updateStudentOnboardingPhoto(
  formData: FormData,
  kind: 'front' | 'side' | 'back'
): Promise<{ success: boolean; error?: string; photoUrl?: string | null }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  const photoFile = formData.get('photo')
  if (!photoFile) {
    return { success: false, error: 'Dosya seçilmedi.' }
  }

  const photoPath = await uploadOnboardingPhoto(supabase, studentId, photoFile, kind)
  if (photoPath === false) {
    return { success: false, error: 'Fotoğraf yüklenirken bir hata oluştu (Geçersiz format veya >10MB).' }
  }

  const dbColumn = `photo_${kind}_path`
  const { error: dbError } = await supabase
    .from('student_profiles')
    .update({
      [dbColumn]: photoPath,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId)

  if (dbError) {
    console.error('Error updating student profile photo path:', dbError)
    return { success: false, error: 'Veritabanı güncellenirken hata oluştu.' }
  }

  let signedUrl: string | null = null
  if (photoPath) {
    const { data } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(photoPath, 3600)
    signedUrl = data?.signedUrl ?? null
  }

  revalidatePath('/student/profil')
  revalidatePath('/student/dashboard')

  return { success: true, photoUrl: signedUrl }
}

export async function deleteStudentOnboardingPhoto(
  kind: 'front' | 'side' | 'back'
): Promise<{ success: boolean; error?: string }> {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  const dbColumn = `photo_${kind}_path`
  const { error: dbError } = await supabase
    .from('student_profiles')
    .update({
      [dbColumn]: null,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId)

  if (dbError) {
    console.error('Error deleting student profile photo path:', dbError)
    return { success: false, error: 'Fotoğraf silinirken veritabanı hatası oluştu.' }
  }

  revalidatePath('/student/profil')
  revalidatePath('/student/dashboard')

  return { success: true }
}

