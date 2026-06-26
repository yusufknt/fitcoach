export type UserRole = 'coach' | 'student'

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type Package = {
  id: string
  coach_id: string
  name: string
  description: string | null
  price: number
  duration_days: number
  features: string[]
  is_active: boolean
  created_at: string
}

export type CoachStudent = {
  id: string
  coach_id: string
  student_id: string
  package_id: string | null
  start_date: string
  end_date: string | null
  status: 'active' | 'paused' | 'completed'
  payment_status: 'paid' | 'pending' | 'failed'
  created_at: string
}

export type ProgressEntry = {
  id: string
  student_id: string
  coach_id: string
  date: string
  weight: number | null
  note: string | null
  custom_metrics: Record<string, unknown>
  before_photo_url?: string | null
  after_photo_url?: string | null
  created_at: string
}

export type Program = {
  id: string
  coach_id: string
  student_id: string
  title: string
  description: string | null
  file_url: string
  file_name: string
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export type CalendarEvent = {
  id: string
  coach_id: string
  student_id: string | null
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: 'available' | 'session' | 'blocked'
  meeting_url: string | null
  created_at: string
}

// --- Student Onboarding ---

export type Gender = 'male' | 'female'
export type TrainingExperience = 'beginner' | '1-3years' | '3plus'
export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'recomposition' | 'strength'

export type StudentProfile = {
  id: string
  student_id: string
  height_cm: number | null
  birth_date: string | null
  gender: Gender | null
  experience: TrainingExperience | null
  goal: FitnessGoal | null
  initial_weight: number | null
  chest_cm: number | null
  waist_cm: number | null
  hip_cm: number | null
  neck_cm: number | null
  right_upper_arm_cm: number | null
  left_upper_arm_cm: number | null
  right_thigh_cm: number | null
  left_thigh_cm: number | null
  right_calf_cm: number | null
  left_calf_cm: number | null
  body_fat_percentage: number | null
  photo_front_path: string | null
  photo_side_path: string | null
  photo_back_path: string | null
  injuries: string | null
  supplements: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}
