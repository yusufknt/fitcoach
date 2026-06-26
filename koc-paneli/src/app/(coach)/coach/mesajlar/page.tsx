import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getChatSummaries } from '@/lib/coach/messages.server'
import { MessageLayout } from '@/components/coach/messages/message-layout'

export default async function CoachMessagesPage() {
  const coachId = await getAuthenticatedCoachId()

  if (!coachId) {
    redirect('/giris')
  }

  const summaries = await getChatSummaries(coachId)

  return (
    <div className="coach-page">
      <div className="coach-container">
      <MessageLayout 
        coachId={coachId} 
        initialSummaries={summaries} 
      />
      </div>
    </div>
  )
}
