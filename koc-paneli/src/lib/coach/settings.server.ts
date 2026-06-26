import { createClient } from '@/lib/supabase/server'
import type { CoachProfile, NotificationPreferences } from './types'

export async function getCoachProfile(coachId: string): Promise<CoachProfile | null> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url')
    .eq('id', coachId)
    .single()

  if (error || !profile) {
    console.error('Error fetching coach profile:', error)
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()

  return {
    id: profile.id,
    fullName: profile.full_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    email: user?.email ?? null,
  }
}

export async function getNotificationPreferences(coachId: string): Promise<NotificationPreferences> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', coachId)
    .single()

  const prefs = (data as { notification_preferences: Partial<NotificationPreferences> | null } | null)?.notification_preferences

  return {
    emailOnMessage: prefs?.emailOnMessage ?? true,
    emailOnNewStudent: prefs?.emailOnNewStudent ?? true,
    emailReminderBefore24h: prefs?.emailReminderBefore24h ?? true,
  }
}
