import { Skeleton } from '@/components/ui/skeleton'

export default function StudentMessagesLoading() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full p-4 md:p-6">
      <div className="flex h-full flex-col rounded-xl border border-[#444933] bg-[#18181B]/80 backdrop-blur-sm">
        {/* Header Loading */}
        <div className="flex items-center gap-4 border-b border-[#444933] p-4 shrink-0">
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {/* Messages Loading */}
        <div className="flex-1 p-4 space-y-6">
          <div className="flex flex-col items-start space-y-1 w-full max-w-[80%]">
            <Skeleton className="h-10 w-64 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col items-end space-y-1 w-full max-w-[80%] ml-auto">
            <Skeleton className="h-16 w-80 rounded-2xl rounded-br-sm" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-start space-y-1 w-full max-w-[80%]">
            <Skeleton className="h-24 w-96 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col items-end space-y-1 w-full max-w-[80%] ml-auto">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-br-sm" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Input Loading */}
        <div className="p-4 border-t border-[#444933] shrink-0 flex items-end gap-2">
          <Skeleton className="h-14 flex-1 rounded-xl" />
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  )
}
