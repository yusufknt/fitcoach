import { createClient } from '@/lib/supabase/server'
import type { StudentProfile } from '@/types'

export type StudentOnboardingView = {
  profile: StudentProfile
  photoUrls: {
    frontUrl: string | null
    sideUrl: string | null
    backUrl: string | null
  }
}

// Get student onboarding profile for coach view
export async function getStudentOnboardingProfile(
  studentId: string,
  coachId: string
): Promise<StudentOnboardingView | null> {
  const supabase = await createClient()

  // Verify coach-student relationship
  const { data: relation } = await supabase
    .from('coach_students')
    .select('id')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .limit(1)
    .single()

  if (!relation) return null

  // Get student profile
  const { data: profile, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()

  if (error || !profile) return null

  const typedProfile = profile as StudentProfile

  // Get signed URLs for photos
  const bucket = 'progress-photos'

  async function getSignedUrl(path: string | null): Promise<string | null> {
    if (!path) return null
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [frontUrl, sideUrl, backUrl] = await Promise.all([
    getSignedUrl(typedProfile.photo_front_path),
    getSignedUrl(typedProfile.photo_side_path),
    getSignedUrl(typedProfile.photo_back_path),
  ])

  return {
    profile: typedProfile,
    photoUrls: { frontUrl, sideUrl, backUrl },
  }
}
