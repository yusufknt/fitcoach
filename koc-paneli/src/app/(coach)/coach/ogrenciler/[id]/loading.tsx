import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CoachStudentDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090B]">
      <div className="flex shrink-0 items-center gap-4 border-b border-[#444933] bg-[#0E0E10] p-4">
        <Link
          href="/coach/ogrenciler"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#444933] bg-[#18181B] text-[#C4C9AC] transition-colors hover:bg-[#2A2A2C] hover:text-[#E5E1E4]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Skeleton (Tabs) */}
        <div className="hidden w-64 shrink-0 overflow-y-auto border-r border-[#444933] bg-[#0E0E10] p-4 md:block">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card className="coach-card">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
            <Card className="coach-card">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
          <Card className="coach-card">
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
