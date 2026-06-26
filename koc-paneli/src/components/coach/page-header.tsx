import type { ReactNode } from 'react'

type CoachPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function CoachPageHeader({
  eyebrow = 'Elite Coaching',
  title,
  description,
  action,
}: CoachPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#444933]/70 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ABD600]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#E5E1E4] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#C4C9AC] sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
