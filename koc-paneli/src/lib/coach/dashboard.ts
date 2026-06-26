import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import { getTodayTomorrowRange } from '@/lib/coach/format'
import { type SupabaseClient } from '@supabase/supabase-js'
import type {
  ActivityItem,
  DashboardStats,
  MonthlyRevenue,
  MonthlyStudentGrowth,
  TopActiveStudent,
  UpcomingAppointment,
} from '@/lib/coach/types'

type NameSnippet = { full_name: string }

type StudentRelationRow = {
  id: string
  created_at: string
  student: NameSnippet | NameSnippet[] | null
}

type MessageRow = {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  sender: NameSnippet | NameSnippet[] | null
}

type ProgressRow = {
  id: string
  created_at: string
  student: NameSnippet | NameSnippet[] | null
}

type CalendarRow = {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  student: NameSnippet | NameSnippet[] | null
}

interface PaymentRow {
  amount: number | null
}

interface ProgressEntryWithStudent {
  student_id: string
  student: {
    full_name: string
    avatar_url: string | null
  } | null
}

function resolveName(
  value: NameSnippet | NameSnippet[] | null | undefined
): string | null {
  if (!value) return null
  const item = Array.isArray(value) ? value[0] : value
  return item?.full_name ?? null
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats
  upcomingAppointments: UpcomingAppointment[]
  activities: ActivityItem[]
  revenue: MonthlyRevenue[]
  growth: MonthlyStudentGrowth[]
  topStudents: TopActiveStudent[]
} | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const supabase = await createClient()
  const { start, end } = getTodayTomorrowRange()

  const [
    activeStudentsResult,
    unreadMessagesResult,
    appointmentsResult,
    newStudentsResult,
    messagesResult,
    progressResult,
  ] = await Promise.all([
    supabase
      .from('coach_students')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('status', 'active'),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', coachId)
      .eq('is_read', false),
    supabase
      .from('calendar_events')
      .select(
        'id, title, start_time, end_time, event_type, student:profiles!calendar_events_student_id_fkey(full_name)'
      )
      .eq('coach_id', coachId)
      .eq('event_type', 'session')
      .gte('start_time', start)
      .lt('start_time', end)
      .order('start_time', { ascending: true }),
    supabase
      .from('coach_students')
      .select('id, created_at, student:profiles!coach_students_student_id_fkey(full_name)')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('messages')
      .select(
        'id, content, created_at, sender_id, receiver_id, sender:profiles!messages_sender_id_fkey(full_name)'
      )
      .or(`sender_id.eq.${coachId},receiver_id.eq.${coachId}`)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('progress_entries')
      .select(
        'id, created_at, student:profiles!progress_entries_student_id_fkey(full_name)'
      )
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const upcomingAppointments: UpcomingAppointment[] = (
    (appointmentsResult.data as CalendarRow[] | null) ?? []
  ).map((event) => ({
    id: event.id,
    title: event.title,
    studentName: resolveName(event.student),
    startTime: event.start_time,
    endTime: event.end_time,
    eventType: event.event_type,
  }))

  const activities = buildActivityFeed(
    (newStudentsResult.data as StudentRelationRow[] | null) ?? [],
    (messagesResult.data as MessageRow[] | null) ?? [],
    (progressResult.data as ProgressRow[] | null) ?? [],
    coachId
  )

  // --- Charts data ---
  const revenue = await getMonthlyRevenue(supabase, coachId)
  const growth = await getMonthlyStudentGrowth(supabase, coachId)
  const topStudents = await getTopActiveStudents(supabase, coachId)

  return {
    stats: {
      activeStudentCount: activeStudentsResult.count ?? 0,
      unreadMessageCount: unreadMessagesResult.count ?? 0,
    },
    upcomingAppointments,
    activities,
    revenue,
    growth,
    topStudents,
  }
}

function buildActivityFeed(
  students: StudentRelationRow[],
  messages: MessageRow[],
  progressEntries: ProgressRow[],
  coachId: string
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const row of students) {
    const name = resolveName(row.student) ?? 'Öğrenci'
    items.push({
      id: `student-${row.id}`,
      type: 'new_student',
      title: 'Yeni öğrenci',
      description: `${name} koçluğa katıldı`,
      createdAt: row.created_at,
    })
  }

  for (const row of messages) {
    const isIncoming = row.receiver_id === coachId
    const name = resolveName(row.sender) ?? 'Öğrenci'
    items.push({
      id: `message-${row.id}`,
      type: 'message',
      title: isIncoming ? 'Yeni mesaj' : 'Gönderilen mesaj',
      description: isIncoming
        ? `${name}: ${truncate(row.content, 60)}`
        : truncate(row.content, 60),
      createdAt: row.created_at,
    })
  }

  for (const row of progressEntries) {
    const name = resolveName(row.student) ?? 'Öğrenci'
    items.push({
      id: `progress-${row.id}`,
      type: 'progress',
      title: 'İlerleme kaydı',
      description: `${name} yeni bir kayıt ekledi`,
      createdAt: row.created_at,
    })
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

async function getMonthlyRevenue(supabase: SupabaseClient, coachId: string): Promise<MonthlyRevenue[]> {
  const result: MonthlyRevenue[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const { data } = await supabase
      .from('payments')
      .select('amount')
      .eq('coach_id', coachId)
      .eq('status', 'success')
      .gte('created_at', month.toISOString())
      .lt('created_at', nextMonth.toISOString())

    const total = ((data as PaymentRow[] | null) ?? []).reduce((sum: number, p) => sum + (p.amount ?? 0), 0)
    result.push({
      month: MONTH_NAMES[month.getMonth()],
      revenue: total,
    })
  }

  return result
}

async function getMonthlyStudentGrowth(supabase: SupabaseClient, coachId: string): Promise<MonthlyStudentGrowth[]> {
  const result: MonthlyStudentGrowth[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const { count } = await supabase
      .from('coach_students')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .gte('created_at', month.toISOString())
      .lt('created_at', nextMonth.toISOString())

    result.push({
      month: MONTH_NAMES[month.getMonth()],
      count: count ?? 0,
    })
  }

  return result
}

async function getTopActiveStudents(supabase: SupabaseClient, coachId: string): Promise<TopActiveStudent[]> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data } = await supabase
    .from('progress_entries')
    .select('student_id, student:profiles!progress_entries_student_id_fkey(full_name, avatar_url)')
    .eq('coach_id', coachId)
    .gte('created_at', sevenDaysAgo.toISOString())

  if (!data || data.length === 0) return []

  // Count per student
  const countMap = new Map<string, { fullName: string; avatarUrl: string | null; count: number }>()
  for (const row of data as unknown as ProgressEntryWithStudent[]) {
    const key = row.student_id
    const existing = countMap.get(key)
    if (existing) {
      existing.count++
    } else {
      const profile = Array.isArray(row.student) ? row.student[0] : row.student
      countMap.set(key, {
        fullName: profile?.full_name ?? 'Öğrenci',
        avatarUrl: profile?.avatar_url ?? null,
        count: 1,
      })
    }
  }

  return Array.from(countMap.entries())
    .map(([studentId, info]) => ({
      studentId,
      fullName: info.fullName,
      avatarUrl: info.avatarUrl,
      progressCount: info.count,
    }))
    .sort((a, b) => b.progressCount - a.progressCount)
    .slice(0, 3)
}
