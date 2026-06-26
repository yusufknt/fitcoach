import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { getStudentCoachInfo, getInitialMessages } from '@/lib/student/messages.server'
import { MessagesClient } from '@/components/student/messages-client'

export default async function StudentMessagesPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const coach = await getStudentCoachInfo(studentId)
  if (!coach) redirect('/giris')

  const messages = await getInitialMessages(studentId, coach.id)

  return (
    <div className="coach-page">
      <div className="coach-container">
      <MessagesClient
        studentId={studentId}
        coach={coach}
        initialMessages={messages}
      />
      </div>
    </div>
  )
}
