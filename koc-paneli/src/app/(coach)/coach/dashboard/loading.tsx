import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function CoachDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#09090B] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex flex-col gap-4 border-b border-[#444933]/70 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-36 bg-[#353437]" />
            <Skeleton className="h-10 w-52 bg-[#353437]" />
            <Skeleton className="h-4 w-80 max-w-full bg-[#353437]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-full bg-[#353437] sm:w-80" />
            <Skeleton className="h-10 w-10 rounded-full bg-[#353437]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-[#18181B]" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-[#27272A] bg-[#18181B]/80">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-between">
                  <Skeleton className="h-4 w-24 bg-[#353437]" />
                  <Skeleton className="h-4 w-10 bg-[#353437]" />
                </div>
                <Skeleton className="mb-2 h-12 w-16 bg-[#353437]" />
                <Skeleton className="h-3 w-32 bg-[#353437]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-[#27272A] bg-[#18181B]/80">
              <CardHeader>
                <Skeleton className="h-5 w-36 bg-[#353437]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[260px] w-full bg-[#353437]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#27272A] bg-[#18181B]/80">
              <CardHeader>
                <Skeleton className="h-5 w-36 bg-[#353437]" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[#353437]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-[#353437]" />
                      <Skeleton className="h-3 w-1/2 bg-[#353437]" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
