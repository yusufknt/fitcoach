import { createClient } from '@/lib/supabase/server'
import type { OnboardingStatus } from './types'
import type { StudentProfile } from '@/types'

// Check if a student has completed onboarding
export async function checkOnboardingStatus(studentId: string): Promise<OnboardingStatus> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('student_profiles')
    .select('onboarding_completed')
    .eq('student_id', studentId)
    .single()

  if (!data) {
    return { completed: false, studentProfileExists: false }
  }

  return {
    completed: data.onboarding_completed ?? false,
    studentProfileExists: true,
  }
}

// Get full student onboarding profile data
export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()

  if (error || !data) {
    return null
  }

  return data as StudentProfile
}

// Get signed URLs for onboarding photos
export async function getOnboardingPhotoUrls(profile: StudentProfile): Promise<{
  frontUrl: string | null
  sideUrl: string | null
  backUrl: string | null
}> {
  const supabase = await createClient()
  const bucket = 'progress-photos'

  async function getSignedUrl(path: string | null): Promise<string | null> {
    if (!path) return null
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [frontUrl, sideUrl, backUrl] = await Promise.all([
    getSignedUrl(profile.photo_front_path),
    getSignedUrl(profile.photo_side_path),
    getSignedUrl(profile.photo_back_path),
  ])

  return { frontUrl, sideUrl, backUrl }
}
