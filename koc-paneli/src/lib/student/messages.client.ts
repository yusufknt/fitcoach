import { createClient } from '@/lib/supabase/client'
import type { StudentMessage } from './types'

export async function getMessages(studentId: string, coachId: string): Promise<StudentMessage[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${studentId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${studentId})`)
    .order('created_at', { ascending: true })
  return (data ?? []) as StudentMessage[]
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<StudentMessage | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content, is_read: false })
    .select()
    .single()
  if (error) { console.error('Error sending message:', error); return null }
  return data as StudentMessage
}

export async function markAsRead(studentId: string, coachId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', coachId)
    .eq('receiver_id', studentId)
    .eq('is_read', false)
}
