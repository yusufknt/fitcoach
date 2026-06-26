import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function StudentCalendarLoading() {
  return (
    <div className="coach-page">
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar Main Grid Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border coach-card p-4">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-10 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-full shrink-0 lg:w-72 space-y-6">
          <Card className="coach-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
