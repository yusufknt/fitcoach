import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/coach/format'
import type { UpcomingAppointment } from '@/lib/coach/types'

type UpcomingAppointmentsProps = {
  appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  return (
    <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#E5E1E4]">Yaklaşan Randevular</CardTitle>
        <p className="text-sm text-[#C4C9AC]">Bugün ve yarın</p>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-[#C4C9AC]">
            Yaklaşan randevu bulunmuyor.
          </p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center gap-4 rounded-lg p-3 transition hover:bg-[#2A2A2C]"
              >
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border border-[#444933] bg-[#353437] text-[10px] font-bold">
                  <span className="text-[#ABD600]">
                    {new Date(appointment.startTime).getDate()}
                  </span>
                  <span className="text-[8px] uppercase text-[#C4C9AC]/70">
                    {new Date(appointment.startTime).toLocaleDateString('tr-TR', { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#E5E1E4]">{appointment.title}</p>
                  {appointment.studentName && (
                    <p className="truncate text-xs text-[#C4C9AC]">
                      {appointment.studentName}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-[#C4C9AC]">
                  {formatDateTime(appointment.startTime)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
