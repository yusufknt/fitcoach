import type { ProgramListItem } from '@/lib/coach/programs'
import { ProgramUpload } from '@/components/coach/student/programs/program-upload'
import { ProgramList } from '@/components/coach/student/programs/program-list'

type ProgramsTabProps = {
  coachStudentId: string
  studentId: string
  programs: ProgramListItem[]
}

export function ProgramsTab({
  coachStudentId,
  studentId,
  programs,
}: ProgramsTabProps) {
  return (
    <div className="space-y-8">
      <ProgramUpload coachStudentId={coachStudentId} studentId={studentId} />
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Yüklü Programlar</h2>
        <ProgramList programs={programs} coachStudentId={coachStudentId} />
      </section>
    </div>
  )
}
