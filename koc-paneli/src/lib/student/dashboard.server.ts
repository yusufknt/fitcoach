import { createClient } from '@/lib/supabase/server'
import type { StudentDashboardData, SidebarBadges } from './types'

interface CoachStudentDashboardRow {
  coach_id: string
  start_date: string
  end_date: string | null
  status: string
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
  package: {
    name: string
    duration_days: number
  } | {
    name: string
    duration_days: number
  }[] | null
}

export async function getStudentDashboard(studentId: string): Promise<StudentDashboardData | null> {
  const supabase = await createClient()

  // Get coach relationship
  const { data } = await supabase
    .from('coach_students')
    .select(`
      coach_id, start_date, end_date, status,
      coach:profiles!coach_students_coach_id_fkey(id, full_name, avatar_url, bio),
      package:packages(name, duration_days)
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null

  const rel = data as unknown as CoachStudentDashboardRow
  const coachRaw = rel.coach
  const coach = Array.isArray(coachRaw) ? coachRaw[0] : coachRaw
  const pkgRaw = rel.package
  const pkg = Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw

  // Days remaining
  let daysRemaining: number | null = null
  let totalDays: number | null = null
  if (rel.end_date) {
    const end = new Date(rel.end_date)
    const now = new Date()
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
    const start = new Date(rel.start_date)
    totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  }

  // Streak (consecutive days with progress entries)
  const { data: entries } = await supabase
    .from('progress_entries')
    .select('date')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .limit(60)

  let streak = 0
  if (entries && entries.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let checkDate = new Date(today)

    for (const entry of entries) {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      if (entryDate.getTime() === checkDate.getTime()) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (entryDate.getTime() < checkDate.getTime()) {
        // Allow today not to have an entry yet
        if (streak === 0 && entryDate.getTime() === checkDate.getTime() - 86400000) {
          checkDate = entryDate
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }
  }

  // Upcoming session
  const now = new Date().toISOString()
  const { data: sessions } = await supabase
    .from('calendar_events')
    .select('id, title, start_time, end_time, meeting_url')
    .eq('student_id', studentId)
    .eq('event_type', 'session')
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(1)

  const upcomingSession = sessions?.[0]
    ? {
        id: sessions[0].id,
        title: sessions[0].title,
        startTime: sessions[0].start_time,
        endTime: sessions[0].end_time,
        meetingUrl: sessions[0].meeting_url,
      }
    : null

  // Latest program
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, created_at, file_url')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestProgram = programs?.[0]
    ? {
        id: programs[0].id,
        title: programs[0].title,
        createdAt: programs[0].created_at,
        fileUrl: programs[0].file_url,
      }
    : null

  // Unread messages
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', studentId)
    .eq('is_read', false)

  return {
    coachName: coach?.full_name ?? 'Koç',
    coachAvatarUrl: coach?.avatar_url ?? null,
    coachBio: coach?.bio ?? null,
    coachId: rel.coach_id,
    packageName: pkg?.name ?? null,
    daysRemaining,
    totalDays,
    streak,
    upcomingSession,
    latestProgram,
    unreadMessageCount: count ?? 0,
  }
}

interface SidebarCoachRow {
  coach: {
    full_name: string
    avatar_url: string | null
  } | {
    full_name: string
    avatar_url: string | null
  }[] | null
}

export async function getSidebarBadges(studentId: string): Promise<SidebarBadges> {
  const supabase = await createClient()

  const [msgResult, programResult, coachResult] = await Promise.all([
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', studentId)
      .eq('is_read', false),
    supabase
      .from('programs')
      .select('created_at')
      .eq('student_id', studentId)
      .gte('created_at', new Date(Date.now() - 3 * 86400000).toISOString())
      .limit(1),
    supabase
      .from('coach_students')
      .select('coach:profiles!coach_students_coach_id_fkey(full_name, avatar_url)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .limit(1)
      .single(),
  ])

  const coachRaw = (coachResult.data as unknown as SidebarCoachRow | null)?.coach
  const coach = Array.isArray(coachRaw) ? coachRaw[0] : coachRaw

  return {
    unreadMessages: msgResult.count ?? 0,
    hasNewProgram: (programResult.data?.length ?? 0) > 0,
    coachName: coach?.full_name ?? 'Koç',
    coachAvatarUrl: coach?.avatar_url ?? null,
  }
}
