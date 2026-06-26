import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'
import type { CoachStudentListItem, CoachStudentDetail } from '@/lib/coach/types'

type ProfileSnippet = {
  full_name: string
  avatar_url: string | null
}

type PackageSnippet = {
  name: string
}

type CoachStudentRow = {
  id: string
  student_id: string
  start_date: string
  end_date: string | null
  status: CoachStudentListItem['status']
  created_at: string
  payment_status?: CoachStudentDetail['paymentStatus']
  packages: PackageSnippet | PackageSnippet[] | null
  student: ProfileSnippet | ProfileSnippet[] | null
}

function resolveOne<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

type MessageActivityRow = {
  sender_id: string
  receiver_id: string
  created_at: string
}

type ProgressActivityRow = {
  student_id: string
  created_at: string
}

export async function getCoachStudents(): Promise<
  CoachStudentListItem[] | null
> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const supabase = await createClient()

  const [studentsResult, messagesResult, progressResult] = await Promise.all([
    supabase
      .from('coach_students')
      .select(
        `
        id,
        student_id,
        start_date,
        end_date,
        status,
        created_at,
        packages (name),
        student:profiles!coach_students_student_id_fkey (full_name, avatar_url)
      `
      )
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('sender_id, receiver_id, created_at')
      .or(`sender_id.eq.${coachId},receiver_id.eq.${coachId}`)
      .order('created_at', { ascending: false }),
    supabase
      .from('progress_entries')
      .select('student_id, created_at')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false }),
  ])

  if (studentsResult.error || !studentsResult.data) {
    return []
  }

  const rows = studentsResult.data as CoachStudentRow[]
  const lastActivityByStudent = buildLastActivityMap(
    coachId,
    (messagesResult.data as MessageActivityRow[] | null) ?? [],
    (progressResult.data as ProgressActivityRow[] | null) ?? [],
    rows
  )

  return rows.map((row) => {
    const student = resolveOne(row.student)
    const pkg = resolveOne(row.packages)

    return {
    id: row.id,
    studentId: row.student_id,
    fullName: student?.full_name ?? 'İsimsiz',
    avatarUrl: student?.avatar_url ?? null,
    packageName: pkg?.name ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    lastActivityAt: lastActivityByStudent.get(row.student_id) ?? row.created_at,
  }
  })
}

export async function getCoachStudentDetail(
  coachStudentId: string
): Promise<CoachStudentDetail | null> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coach_students')
    .select(
      `
      id,
      student_id,
      start_date,
      end_date,
      status,
      payment_status,
      packages (name),
      student:profiles!coach_students_student_id_fkey (full_name, avatar_url)
    `
    )
    .eq('id', coachStudentId)
    .eq('coach_id', coachId)
    .single()

  if (error || !data) {
    return null
  }

  const row = data as CoachStudentRow
  const student = resolveOne(row.student)
  const pkg = resolveOne(row.packages)

  const { data: email } = await supabase.rpc('coach_student_email', {
    p_student_id: row.student_id,
  })

  return {
    coachStudentId: row.id,
    studentId: row.student_id,
    fullName: student?.full_name ?? 'İsimsiz',
    email: typeof email === 'string' ? email : null,
    avatarUrl: student?.avatar_url ?? null,
    packageName: pkg?.name ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    paymentStatus: row.payment_status ?? 'pending',
  }
}

function buildLastActivityMap(
  coachId: string,
  messages: MessageActivityRow[],
  progressEntries: ProgressActivityRow[],
  students: CoachStudentRow[]
): Map<string, string> {
  const map = new Map<string, string>()

  for (const student of students) {
    map.set(student.student_id, student.created_at)
  }

  for (const message of messages) {
    const studentId =
      message.sender_id === coachId ? message.receiver_id : message.sender_id
    updateLatest(map, studentId, message.created_at)
  }

  for (const entry of progressEntries) {
    updateLatest(map, entry.student_id, entry.created_at)
  }

  return map
}

function updateLatest(
  map: Map<string, string>,
  studentId: string,
  timestamp: string
): void {
  const current = map.get(studentId)
  if (!current || new Date(timestamp) > new Date(current)) {
    map.set(studentId, timestamp)
  }
}
