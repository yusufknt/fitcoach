'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StudentSidebarClient } from '@/components/student/sidebar-client'
import type { SidebarBadges } from '@/lib/student/types'

export function StudentSidebar() {
  const [badges, setBadges] = useState<SidebarBadges>({
    unreadMessages: 0,
    hasNewProgram: false,
    coachName: 'Koç',
    coachAvatarUrl: null,
  })

  useEffect(() => {
    const fetchBadges = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Unread messages
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      // New programs (last 3 days)
      const { data: newPrograms } = await supabase
        .from('programs')
        .select('id')
        .eq('student_id', user.id)
        .gte('created_at', new Date(Date.now() - 3 * 86400000).toISOString())
        .limit(1)

      // Coach info
      const { data: rel } = await supabase
        .from('coach_students')
        .select('coach:profiles!coach_students_coach_id_fkey(full_name, avatar_url)')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single()

      const coach = (rel as { coach?: { full_name?: string | null; avatar_url?: string | null } } | null)?.coach

      setBadges({
        unreadMessages: count ?? 0,
        hasNewProgram: (newPrograms?.length ?? 0) > 0,
        coachName: coach?.full_name ?? 'Koç',
        coachAvatarUrl: coach?.avatar_url ?? null,
      })
    }

    fetchBadges()
  }, [])

  return <StudentSidebarClient badges={badges} />
}
