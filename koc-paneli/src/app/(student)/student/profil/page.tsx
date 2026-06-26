import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentProfile, getOnboardingPhotoUrls } from '@/lib/student/onboarding.server'
import { ProfileTab } from '@/components/coach/student/profile-tab'
import { CoachPageHeader } from '@/components/coach/page-header'

export const metadata = {
  title: 'Profil Bilgilerim — Kinetic Performance',
  description: 'İlk kayıt esnasında doldurduğunuz profil bilgileriniz.',
}

export default async function StudentProfilePage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const profile = await getStudentProfile(studentId)
  let onboarding = null

  if (profile) {
    const photoUrls = await getOnboardingPhotoUrls(profile)
    onboarding = {
      profile,
      photoUrls,
    }
  }

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Profil Bilgilerim"
          description="İlk kayıt esnasında doldurduğunuz vücut geliştirme profil bilgileriniz."
        />
        <div className="max-w-3xl">
          <ProfileTab onboarding={onboarding} isEditable={true} />
        </div>
      </div>
    </div>
  )
}
