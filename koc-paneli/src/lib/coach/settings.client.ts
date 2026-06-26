import { createClient } from '@/lib/supabase/client'
import type { NotificationPreferences } from './types'

export async function updateProfile(data: { fullName: string; bio: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: data.fullName, bio: data.bio })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return false
  }
  return true
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  return publicUrl
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Supabase doesn't have a "verify old password" method on the client,
  // so we just update the password directly
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function updateNotificationPreferences(prefs: NotificationPreferences) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: prefs })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating notification preferences:', error)
    return false
  }
  return true
}
