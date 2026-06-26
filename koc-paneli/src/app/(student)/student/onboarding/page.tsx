import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { checkOnboardingStatus } from '@/lib/student/onboarding.server'
import { OnboardingClient } from '@/components/student/onboarding-client'

export const metadata = {
  title: 'Hoş Geldiniz — Kinetic Performance',
  description: 'Kişisel bilgilerinizi girerek başlayın.',
}

export default async function OnboardingPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) {
    redirect('/giris')
  }

  const status = await checkOnboardingStatus(studentId)
  if (status.completed) {
    redirect('/student/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090B] px-4 py-8">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(rgba(171,214,0,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#ABD600]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#C3F400]/5 blur-[100px]" />

      <div className="w-full max-w-3xl">
        <OnboardingClient />
      </div>
    </div>
  )
}
