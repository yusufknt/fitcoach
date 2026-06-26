'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileTab } from '@/components/coach/student/profile-tab'
import { ProgressTab } from '@/components/coach/student/progress-tab'
import { ProgramsTab } from '@/components/coach/student/programs/programs-tab'
import { ReportsTab } from '@/components/coach/student/reports-tab'
import type { ProgressEntry } from '@/types'
import type { ProgramListItem } from '@/lib/coach/programs'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'

type StudentDetailTabsProps = {
  coachStudentId: string
  studentId: string
  entries: ProgressEntry[]
  programs: ProgramListItem[]
  onboarding: StudentOnboardingView | null
}

function TabPlaceholder({ title }: { title: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-[#444933] bg-[#18181B]/60 p-8 text-center text-sm text-[#C4C9AC]">
      {title} yakında eklenecek.
    </p>
  )
}

export function StudentDetailTabs({
  coachStudentId,
  studentId,
  entries,
  programs,
  onboarding,
}: StudentDetailTabsProps) {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="coach-tab-list">
        <TabsTrigger value="profile" className="coach-tab-trigger">Profil</TabsTrigger>
        <TabsTrigger value="progress" className="coach-tab-trigger">İlerleme</TabsTrigger>
        <TabsTrigger value="programs" className="coach-tab-trigger">Programlar</TabsTrigger>
        <TabsTrigger value="reports" className="coach-tab-trigger">Raporlar</TabsTrigger>
        <TabsTrigger value="notes" className="coach-tab-trigger">Notlar</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileTab onboarding={onboarding} />
      </TabsContent>

      <TabsContent value="progress" className="mt-6">
        <ProgressTab
          coachStudentId={coachStudentId}
          studentId={studentId}
          entries={entries}
          onboarding={onboarding}
        />
      </TabsContent>

      <TabsContent value="programs" className="mt-6">
        <ProgramsTab
          coachStudentId={coachStudentId}
          studentId={studentId}
          programs={programs}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ReportsTab
          coachStudentId={coachStudentId}
          studentId={studentId}
          entries={entries}
        />
      </TabsContent>

      <TabsContent value="notes" className="mt-6">
        <TabPlaceholder title="Notlar sekmesi" />
      </TabsContent>
    </Tabs>
  )
}

