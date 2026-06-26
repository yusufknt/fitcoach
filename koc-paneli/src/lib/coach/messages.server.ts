import { createClient as createServerClient } from '@/lib/supabase/server'
import type { ChatSummary } from './types'

interface StudentChatListItemRow {
  student_id: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
  } | {
    id: string
    full_name: string
    avatar_url: string | null
  }[] | null
}

// Server-side function to get chat summaries for the coach
export async function getChatSummaries(coachId: string): Promise<ChatSummary[]> {
  const supabase = await createServerClient()

  // We need to get all students of the coach, and then their latest message and unread count.
  const { data: students, error: studentError } = await supabase
    .from('coach_students')
    .select(`
      student_id,
      profiles!coach_students_student_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('coach_id', coachId)

  if (studentError) {
    console.error('Error fetching students for chat summary:', studentError)
    return []
  }

  const summaries: ChatSummary[] = []

  for (const cs of (students as unknown as StudentChatListItemRow[] | null) ?? []) {
    const profileRaw = cs.profiles
    if (!profileRaw) continue
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

    // Get last message
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${coachId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${coachId})`)
      .order('created_at', { ascending: false })
      .limit(1)

    // Get unread count (messages sent by student to coach that are not read)
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', profile.id)
      .eq('receiver_id', coachId)
      .eq('is_read', false)

    let lastMessage = null
    if (messages && messages.length > 0) {
      const msg = messages[0]
      lastMessage = {
        content: msg.content,
        createdAt: msg.created_at,
        isRead: msg.is_read,
        senderId: msg.sender_id
      }
    }

    summaries.push({
      studentId: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      lastMessage,
      unreadCount: count || 0
    })
  }

  // Sort summaries by last message date descending
  return summaries.sort((a, b) => {
    if (!a.lastMessage) return 1
    if (!b.lastMessage) return -1
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })
}
