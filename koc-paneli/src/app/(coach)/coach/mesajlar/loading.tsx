import { Skeleton } from '@/components/ui/skeleton'

export default function CoachMessagesLoading() {
  return (
    <div className="coach-page">
      <div className="coach-container flex h-[calc(100vh-8rem)] min-h-[620px] w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl">
      {/* Sidebar Loading */}
      <div className="flex w-full shrink-0 flex-col border-r border-[#444933] bg-[#0E0E10]/70 md:w-80">
        <div className="border-b border-[#444933] p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Loading */}
      <div className="hidden flex-1 flex-col bg-[#131315]/70 md:flex">
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-16 w-16 rounded-full opacity-20" />
        </div>
      </div>
      </div>
    </div>
  )
}
