import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentPrograms } from '@/lib/student/programs.server'
import { ProgramsClient } from '@/components/student/programs-client'
import { CoachPageHeader } from '@/components/coach/page-header'

export default async function StudentProgramsPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const programs = await getStudentPrograms(studentId)

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Programlarım"
          description="Koçunuzun yüklediği antrenman ve beslenme programları."
        />
        <ProgramsClient programs={programs} />
      </div>
    </div>
  )
}
