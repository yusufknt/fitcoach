import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentDashboard } from '@/lib/student/dashboard.server'
import { getStudentProfile } from '@/lib/student/onboarding.server'
import { StudentDashboardClient } from '@/components/student/dashboard-client'
import { CoachPageHeader } from '@/components/coach/page-header'

export default async function StudentDashboardPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const data = await getStudentDashboard(studentId)
  if (!data) redirect('/giris')

  const profile = await getStudentProfile(studentId)

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Hoş Geldin"
          description="Koçluk yolculuğuna devam et."
        />
        <StudentDashboardClient data={data} studentId={studentId} profile={profile} />
      </div>
    </div>
  )
}
