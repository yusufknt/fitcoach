export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
      <div className="w-full max-w-3xl space-y-6 px-4">
        {/* Header skeleton */}
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[#27272A]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[#27272A]" />
        </div>

        {/* Step indicator skeleton */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#27272A]" />
              {i < 3 && <div className="h-0.5 w-12 animate-pulse bg-[#27272A]" />}
            </div>
          ))}
        </div>

        {/* Form card skeleton */}
        <div className="rounded-2xl border border-[#27272A] bg-[#18181B]/80 p-6 backdrop-blur-md">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#27272A]" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-[#27272A]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
