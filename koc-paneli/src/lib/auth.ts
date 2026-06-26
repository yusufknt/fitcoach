import type { UserRole } from '@/types'

export function resolveUserRole(
  profileRole: string | null | undefined,
  metadataRole: unknown
): UserRole | null {
  if (profileRole === 'coach' || profileRole === 'student') {
    return profileRole
  }

  if (metadataRole === 'coach' || metadataRole === 'student') {
    return metadataRole
  }

  return null
}

export function getDashboardPath(role: UserRole | null): string {
  if (role === 'coach') {
    return '/coach/dashboard'
  }
  if (role === 'student') {
    return '/student/dashboard'
  }
  return '/giris'
}
