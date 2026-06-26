import { redirect } from 'next/navigation'
import { getCoachStudents } from '@/lib/coach/students'
import { StudentList } from '@/components/coach/student-list'
import { CoachPageHeader } from '@/components/coach/page-header'

export default async function CoachStudentsPage() {
  const students = await getCoachStudents()

  if (students === null) {
    redirect('/giris')
  }

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          title="Öğrencilerim"
          description="Tüm öğrencilerinizi görüntüleyin ve yönetin."
        />
        <StudentList students={students} />
      </div>
    </div>
  )
}
