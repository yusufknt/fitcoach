import { type NextRequest, NextResponse } from 'next/server'
import { getDashboardPath } from '@/lib/auth'
import { getUserRole, updateSession } from '@/lib/supabase/middleware'

const coachRoutes = ['/coach']
const studentRoutes = ['/student']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isCoachRoute = coachRoutes.some((route) => pathname.startsWith(route))
  const isStudentRoute = studentRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isLoginRoute = pathname.startsWith('/giris')

  const { supabase, response, user } = await updateSession(request)

  if (isLoginRoute) {
    if (user) {
      const role = await getUserRole(supabase, user.id, user.user_metadata?.role)
      const destination = getDashboardPath(role)
      if (destination === '/giris') {
        return response
      }
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return response
  }

  if (!isCoachRoute && !isStudentRoute) {
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/giris', request.url))
  }

  const role = await getUserRole(supabase, user.id, user.user_metadata?.role)

  if (isCoachRoute && role !== 'coach') {
    return NextResponse.redirect(
      new URL('/student/dashboard', request.url)
    )
  }

  if (isStudentRoute) {
    if (role !== 'student') {
      return NextResponse.redirect(new URL('/coach/dashboard', request.url))
    }

    const isOnboardingRoute = pathname.startsWith('/student/onboarding')
    
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('onboarding_completed')
      .eq('student_id', user.id)
      .single()

    const completed = profile?.onboarding_completed ?? false

    if (!completed && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/student/onboarding', request.url))
    }

    if (completed && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
