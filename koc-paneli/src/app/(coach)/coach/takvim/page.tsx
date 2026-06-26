import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCalendarEvents, getCalendarSummary, getStudentOptions } from '@/lib/coach/calendar.server'
import { CalendarLayout } from '@/components/coach/calendar/calendar-layout'

export default async function CoachCalendarPage() {
  const coachId = await getAuthenticatedCoachId()

  if (!coachId) {
    redirect('/giris')
  }

  const [events, summary, students] = await Promise.all([
    getCalendarEvents(coachId),
    getCalendarSummary(coachId),
    getStudentOptions(coachId),
  ])

  return (
    <div className="coach-page">
      <div className="coach-container">
      <CalendarLayout
        coachId={coachId}
        initialEvents={events}
        initialSummary={summary}
        students={students}
      />
      </div>
    </div>
  )
}
