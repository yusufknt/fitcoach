import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getProgressData } from '@/lib/student/progress.server'
import { ProgressClient } from '@/components/student/progress-client'
import { CoachPageHeader } from '@/components/coach/page-header'

export default async function StudentProgressPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const { summary, entries, coachId } = await getProgressData(studentId)

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="İlerlemem"
          description="Kilo takibi ve ilerleme kayıtların."
        />
        <ProgressClient
          summary={summary}
          initialEntries={entries}
          studentId={studentId}
          coachId={coachId}
        />
      </div>
    </div>
  )
}
