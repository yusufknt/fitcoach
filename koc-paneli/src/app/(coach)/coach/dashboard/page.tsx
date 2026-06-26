import { redirect } from 'next/navigation'
import { getDashboardData } from '@/lib/coach/dashboard'
import { DashboardStatsCards } from '@/components/coach/dashboard-stats'
import { UpcomingAppointments } from '@/components/coach/upcoming-appointments'
import { ActivityFeed } from '@/components/coach/activity-feed'
import { DashboardCharts } from '@/components/coach/dashboard-charts'
import { QuickActions } from '@/components/coach/quick-actions'
import { TopStudents } from '@/components/coach/top-students'
import { CoachPageHeader } from '@/components/coach/page-header'
import { Bell, Search, ShieldCheck } from 'lucide-react'

export default async function CoachDashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/giris')
  }

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          title="Genel Bakış"
          description="Koçluk panelinize hoş geldiniz. Bugünün hedeflerine odaklanın."
          action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C9AC]" />
              <input
                className="h-10 w-full rounded-lg border border-[#444933] bg-[#0E0E10] pl-10 pr-3 text-sm text-[#E5E1E4] outline-none transition focus:border-[#ABD600] focus:ring-1 focus:ring-[#ABD600]"
                placeholder="Öğrenci veya program ara..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#444933] bg-[#1C1B1D]">
                <Bell className="h-4 w-4 text-[#E5E1E4]" />
                {data.stats.unreadMessageCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C3F400]" />
                )}
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-[#444933] bg-[#1C1B1D] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#ABD600] sm:flex">
                <ShieldCheck className="h-4 w-4" />
                Pro Coach
              </div>
            </div>
          </div>
          }
        />

        <QuickActions />

        <DashboardStatsCards
          stats={data.stats}
          appointmentCount={data.upcomingAppointments.length}
          activityCount={data.activities.length}
        />

        <DashboardCharts revenue={data.revenue} growth={data.growth} />

        <div className="grid gap-6 xl:grid-cols-3">
          <UpcomingAppointments appointments={data.upcomingAppointments} />
          <ActivityFeed activities={data.activities} />
          <TopStudents students={data.topStudents} />
        </div>
      </div>
    </div>
  )
}
