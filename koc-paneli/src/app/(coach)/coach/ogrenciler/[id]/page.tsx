import { notFound, redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCoachStudentDetail } from '@/lib/coach/students'
import { getProgressEntries } from '@/lib/coach/progress'
import { getStudentPrograms } from '@/lib/coach/programs'
import { getStudentOnboardingProfile } from '@/lib/coach/onboarding.server'
import { StudentProfileHeader } from '@/components/coach/student/student-profile-header'
import { StudentDetailTabs } from '@/components/coach/student/student-detail-tabs'

type StudentDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    redirect('/giris')
  }

  const { id } = await params
  const student = await getCoachStudentDetail(id)

  if (!student) {
    notFound()
  }

  const [entries, programs, onboarding] = await Promise.all([
    getProgressEntries(student.studentId),
    getStudentPrograms(student.studentId),
    getStudentOnboardingProfile(student.studentId, coachId),
  ])

  return (
    <div className="coach-page">
      <div className="coach-container space-y-6">
      <StudentProfileHeader student={student} onboarding={onboarding} />
      <StudentDetailTabs
        coachStudentId={student.coachStudentId}
        studentId={student.studentId}
        entries={entries ?? []}
        programs={programs ?? []}
        onboarding={onboarding}
      />
      </div>
    </div>
  )
}
