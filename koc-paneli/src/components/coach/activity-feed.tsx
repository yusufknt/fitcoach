import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, MessageCircle, UserPlus } from 'lucide-react'
import { formatRelativeTime } from '@/lib/coach/format'
import type { ActivityItem } from '@/lib/coach/types'

type ActivityFeedProps = {
  activities: ActivityItem[]
}

const activityIcons = {
  new_student: UserPlus,
  message: MessageCircle,
  progress: CheckCircle,
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#E5E1E4]">Son Aktiviteler</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-[#C4C9AC]">
            Henüz aktivite bulunmuyor.
          </p>
        ) : (
          <ul className="relative space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[#444933]">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type]
              return (
              <li key={activity.id} className="relative flex gap-4">
                <div
                  className={
                    index === 0
                      ? 'z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C3F400] text-[#283500]'
                      : 'z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#444933] bg-[#353437] text-[#ABD600]'
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#E5E1E4]">{activity.title}</p>
                  <p className="truncate text-xs text-[#C4C9AC]">
                    {activity.description}
                  </p>
                  <p className="mt-1 text-[11px] text-[#C4C9AC]/70">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </li>
            )})}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
