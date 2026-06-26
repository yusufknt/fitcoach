import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function StudentDashboardLoading() {
  return (
    <div className="coach-page space-y-6">
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Welcome + Coach Card Skeleton */}
      <Card className="coach-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Streak + Quick Weight Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="coach-card">
          <CardContent className="flex items-center gap-4 p-5">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card className="coach-card">
          <CardContent className="p-5">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session + Program Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="coach-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-32 mt-2 rounded-lg" />
          </CardContent>
        </Card>
        <Card className="coach-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28 mt-2 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
