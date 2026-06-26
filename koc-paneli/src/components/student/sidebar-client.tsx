'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  FileText,
  User,
  ClipboardList,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { SidebarBadges } from '@/lib/student/types'

const navItems = [
  { href: '/student/dashboard', label: 'Ana Sayfa', icon: Home },
  { href: '/student/programlar', label: 'Programlarım', icon: FileText, badgeKey: 'program' as const },
  { href: '/student/ilerleme', label: 'İlerlemem', icon: LineChart },
  { href: '/student/raporlar', label: 'Raporlarım', icon: ClipboardList },
  { href: '/student/mesajlar', label: 'Mesajlar', icon: MessageSquare, badgeKey: 'message' as const },
  { href: '/student/takvim', label: 'Takvim', icon: Calendar },
  { href: '/student/profil', label: 'Profilim', icon: User },
]

type StudentSidebarClientProps = {
  badges: SidebarBadges
}

export function StudentSidebarClient({ badges }: StudentSidebarClientProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/giris')
    router.refresh()
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#444933] bg-[#0E0E10] md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-[#444933] p-5">
        <span className="block text-sm font-extrabold uppercase tracking-tight text-[#E5E1E4]">
          Kinetic Performance
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ABD600]">
          Student Portal
        </span>
      </div>
      <nav className="flex flex-1 gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/student/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          // Badge logic
          let showBadge = false
          let badgeCount = 0
          if (item.badgeKey === 'message' && badges.unreadMessages > 0) {
            showBadge = true
            badgeCount = badges.unreadMessages
          }
          if (item.badgeKey === 'program' && badges.hasNewProgram) {
            showBadge = true
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200',
                isActive
                  ? 'bg-[#C3F400] font-bold text-[#283500] shadow-[0_0_18px_rgba(171,214,0,0.18)]'
                  : 'text-[#C4C9AC] hover:bg-[#2A2A2C] hover:text-[#E5E1E4]'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="whitespace-nowrap md:flex-1">{item.label}</span>
              {showBadge && badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ABD600] px-1.5 text-[10px] font-bold text-[#283500]">
                  {badgeCount}
                </span>
              )}
              {showBadge && badgeCount === 0 && (
                <span className="h-2 w-2 rounded-full bg-[#ABD600]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Coach info card */}
      <div className="hidden border-t border-[#444933] p-3 md:block">
        <div className="rounded-xl border border-[#27272A] bg-[#18181B]/80 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-[#444933]">
              {badges.coachAvatarUrl && <AvatarImage src={badges.coachAvatarUrl} />}
              <AvatarFallback className="bg-[#353437] text-xs text-[#E5E1E4]">
                {badges.coachName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#E5E1E4]">{badges.coachName}</p>
              <p className="text-[10px] text-[#C4C9AC]">Koçun</p>
            </div>
          </div>
          <Link href="/student/mesajlar">
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 w-full justify-center gap-1.5 text-xs text-[#ABD600] hover:bg-[#ABD600]/10"
            >
              <MessageSquare className="h-3 w-3" />
              Mesaj Gönder
            </Button>
          </Link>
        </div>
      </div>

      <Separator className="hidden bg-[#444933] md:block" />
      <div className="hidden p-2 md:block">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-[#C4C9AC] transition-all duration-200 hover:bg-[#2A2A2C] hover:text-[#E5E1E4]"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  )
}
