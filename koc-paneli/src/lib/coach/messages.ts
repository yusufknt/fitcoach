import { createClient } from '@/lib/supabase/client'
import type { Message } from './types'

// Client-side function to get messages between coach and a student
export async function getMessages(coachId: string, studentId: string): Promise<Message[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${coachId},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${coachId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data as Message[]
}

// Client-side function to send a message
export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        is_read: false
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return null
  }

  return data as Message
}

// Client-side function to mark messages as read
export async function markAsRead(coachId: string, studentId: string): Promise<void> {
  const supabase = createClient()

  // Mark all unread messages sent by student to coach as read
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', studentId)
    .eq('receiver_id', coachId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
  }
}
