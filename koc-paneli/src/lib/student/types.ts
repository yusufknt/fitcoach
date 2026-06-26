// --- Dashboard ---

export type StudentDashboardData = {
  coachName: string
  coachAvatarUrl: string | null
  coachBio: string | null
  coachId: string
  packageName: string | null
  daysRemaining: number | null
  totalDays: number | null
  streak: number
  upcomingSession: {
    id: string
    title: string
    startTime: string
    endTime: string
    meetingUrl: string | null
  } | null
  latestProgram: {
    id: string
    title: string
    createdAt: string
    fileUrl: string
  } | null
  unreadMessageCount: number
}

// --- Programs ---

export type StudentProgram = {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string
  createdAt: string
  isNew: boolean // within 3 days
}

// --- Progress ---

export type ProgressSummary = {
  startWeight: number | null
  currentWeight: number | null
  difference: number | null
}

export type ProgressChartPoint = {
  date: string
  weight: number
}

export type ProgressEntryItem = {
  id: string
  date: string
  weight: number | null
  note: string | null
  beforePhotoUrl: string | null
  afterPhotoUrl: string | null
  createdAt: string
  isOwnEntry: boolean // student can only edit own entries
  customMetrics?: Record<string, string | number | boolean | null | undefined>
}

// --- Messages ---

export type StudentMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export type CoachInfo = {
  id: string
  fullName: string
  avatarUrl: string | null
  bio: string | null
}

// --- Calendar ---

export type StudentCalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  eventType: 'available' | 'session' | 'blocked'
  description: string
  meetingUrl: string
  studentName: string | null
}

// --- Sidebar ---

export type SidebarBadges = {
  unreadMessages: number
  hasNewProgram: boolean
  coachName: string
  coachAvatarUrl: string | null
}

// --- Onboarding ---

export type OnboardingFormData = {
  // Kişisel
  heightCm: number
  birthDate: string
  gender: 'male' | 'female'
  experience: 'beginner' | '1-3years' | '3plus'
  goal: 'muscle_gain' | 'fat_loss' | 'recomposition' | 'strength'
  // Ölçüler
  initialWeight: number
  chestCm: number | null
  waistCm: number | null
  hipCm: number | null
  neckCm: number | null
  rightUpperArmCm: number | null
  leftUpperArmCm: number | null
  rightThighCm: number | null
  leftThighCm: number | null
  rightCalfCm: number | null
  leftCalfCm: number | null
  bodyFatPercentage: number | null
  // Sağlık
  injuries: string | null
  supplements: string | null
}

export type OnboardingStatus = {
  completed: boolean
  studentProfileExists: boolean
}
