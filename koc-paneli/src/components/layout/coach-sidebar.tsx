'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/coach/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/coach/ogrenciler', label: 'Öğrencilerim', icon: Users },
  { href: '/coach/mesajlar', label: 'Mesajlar', icon: MessageSquare },
  { href: '/coach/takvim', label: 'Takvim', icon: Calendar },
  { href: '/coach/ayarlar', label: 'Ayarlar', icon: Settings },
]

export function CoachSidebar() {
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
          Elite Coaching
        </span>
      </div>
      <nav className="flex flex-1 gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/coach/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

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
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>
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
