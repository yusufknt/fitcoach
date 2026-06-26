import { redirect } from 'next/navigation'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getCoachProfile, getNotificationPreferences } from '@/lib/coach/settings.server'
import { SettingsLayout } from '@/components/coach/settings/settings-layout'

export default async function CoachSettingsPage() {
  const coachId = await getAuthenticatedCoachId()

  if (!coachId) {
    redirect('/giris')
  }

  const [profile, notificationPreferences] = await Promise.all([
    getCoachProfile(coachId),
    getNotificationPreferences(coachId),
  ])

  if (!profile) {
    redirect('/giris')
  }

  return (
    <div className="coach-page">
      <div className="coach-container">
      <SettingsLayout
        profile={profile}
        notificationPreferences={notificationPreferences}
      />
      </div>
    </div>
  )
}
