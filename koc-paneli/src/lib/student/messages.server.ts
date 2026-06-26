import { createClient } from '@/lib/supabase/server'
import type { CoachInfo } from './types'

interface CoachRelationRow {
  coach: {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  } | {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  }[] | null
}

export async function getStudentCoachInfo(studentId: string): Promise<CoachInfo | null> {
  const supabase = await createClient()

  const { data: rel } = await supabase
    .from('coach_students')
    .select('coach:profiles!coach_students_coach_id_fkey(id, full_name, avatar_url, bio)')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!rel) return null
  const relTyped = rel as unknown as CoachRelationRow
  const coachRaw = relTyped.coach
  const coach = Array.isArray(coachRaw) ? coachRaw[0] : coachRaw

  if (!coach) return null

  return {
    id: coach.id,
    fullName: coach.full_name,
    avatarUrl: coach.avatar_url,
    bio: coach.bio,
  }
}

export async function getInitialMessages(studentId: string, coachId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${studentId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${studentId})`)
    .order('created_at', { ascending: true })

  return data ?? []
}
