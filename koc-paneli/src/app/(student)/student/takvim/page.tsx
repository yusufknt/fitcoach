import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentCalendarEvents } from '@/lib/student/calendar.server'
import { StudentCalendarClient } from '@/components/student/calendar-client'
import { CoachPageHeader } from '@/components/coach/page-header'

export default async function StudentCalendarPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const events = await getStudentCalendarEvents(studentId)

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Takvim"
          description="Randevularınız ve koçunuzun müsait saatleri."
        />
        <StudentCalendarClient events={events} />
      </div>
    </div>
  )
}
