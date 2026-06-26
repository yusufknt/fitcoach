'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { MonthlyRevenue, MonthlyStudentGrowth } from '@/lib/coach/types'

type DashboardChartsProps = {
  revenue: MonthlyRevenue[]
  growth: MonthlyStudentGrowth[]
}

type TooltipProps = {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.[0]) {
    return (
      <div className="rounded-lg border border-[#444933] bg-[#131315] px-3 py-2 text-xs shadow-lg">
        <p className="text-[#C4C9AC]">{label}</p>
        <p className="font-semibold text-[#E5E1E4]">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export function DashboardCharts({ revenue, growth }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Chart */}
      <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-[#E5E1E4]">
            Aylık Gelir
          </CardTitle>
          <span className="rounded-lg bg-[#201F22] px-3 py-1 text-xs font-semibold text-[#C4C9AC]">
            Son 6 Ay
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.08)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#C4C9AC', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#C4C9AC', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(171,214,0,0.06)' }} />
                <Bar
                  dataKey="revenue"
                  fill="#ABD600"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Growth Chart */}
      <Card className="border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ABD600]/40 hover:shadow-[0_0_20px_rgba(171,214,0,0.10)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-[#E5E1E4]">
            Öğrenci Büyümesi
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ABD600]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C4C9AC]">
              Aktif Üye
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.08)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#C4C9AC', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#C4C9AC', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ABD600"
                  strokeWidth={2.5}
                  dot={{ fill: '#ABD600', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#C3F400', strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
