'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import type { ProgressEntry } from '@/types'
import { formatDate } from '@/lib/coach/format'

type ProgressChartProps = {
  entries: ProgressEntry[]
}

type TabType = 'body' | 'lifts' | 'lifestyle' | 'steps'

export function ProgressChart({ entries }: ProgressChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('body')

  // Parse and sort data
  const chartData = entries
    .map((entry) => {
      const m = entry.custom_metrics || {}
      
      const waist = m.waist_cm ?? m.waist
      const bench = m.bench_press_max ?? m.bench
      const squat = m.squat_max ?? m.squat
      const dead = m.deadlift_max ?? m.deadlift
      const sleep = m.sleep_hours_avg ?? m.sleep
      const steps = m.steps_avg ?? m.steps
      const diet = m.diet_compliance ?? m.diet
      const energy = m.energy_level ?? m.energy

      return {
        date: entry.date,
        label: formatDate(entry.date),
        weight: entry.weight ? parseFloat(entry.weight.toString()) : null,
        waist: waist ? parseFloat(waist.toString()) : null,
        bench: bench ? parseFloat(bench.toString()) : null,
        squat: squat ? parseFloat(squat.toString()) : null,
        deadlift: dead ? parseFloat(dead.toString()) : null,
        sleep: sleep ? parseFloat(sleep.toString()) : null,
        steps: steps ? parseFloat(steps.toString()) : null,
        diet: diet ? parseFloat(diet.toString()) : null,
        energy: energy ? parseFloat(energy.toString()) : null,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (chartData.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[#444933] bg-[#18181B]/60 p-8 text-center text-sm text-[#C4C9AC]">
        Grafik için öğrenciden en az bir ilerleme kaydı alınmış olmalıdır.
      </p>
    )
  }

  // Filter data based on active tab to see if any points exist for chosen metrics
  const hasData = () => {
    switch (activeTab) {
      case 'body':
        return chartData.some((d) => d.weight !== null || d.waist !== null)
      case 'lifts':
        return chartData.some((d) => d.bench !== null || d.squat !== null || d.deadlift !== null)
      case 'lifestyle':
        return chartData.some((d) => d.sleep !== null || d.diet !== null || d.energy !== null)
      case 'steps':
        return chartData.some((d) => d.steps !== null)
    }
  }

  return (
    <div className="coach-card p-5 space-y-4 border border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl">
      {/* Chart Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272A]/80 pb-3">
        <div className="flex flex-wrap gap-1 bg-[#0E0E10] border border-[#27272A] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'body'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-[#C4C9AC] hover:text-white'
            }`}
          >
            Kilo & Bel
          </button>
          <button
            onClick={() => setActiveTab('lifts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lifts'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-[#C4C9AC] hover:text-white'
            }`}
          >
            Güç Gelişimi
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lifestyle'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-[#C4C9AC] hover:text-white'
            }`}
          >
            Yaşam Tarzı
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'steps'
                ? 'bg-[#C3F400] text-[#283500]'
                : 'text-[#C4C9AC] hover:text-white'
            }`}
          >
            Günlük Adım
          </button>
        </div>
        <span className="text-[10px] text-[#C4C9AC] uppercase tracking-wider font-bold">
          Son {chartData.length} Kayıt Listeleniyor
        </span>
      </div>

      {!hasData() ? (
        <div className="h-64 flex items-center justify-center text-xs text-[#C4C9AC] border border-dashed border-[#444933]/30 rounded-xl bg-black/10">
          Seçilen sekmeye ait veri bulunamadı.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'body' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ABD600" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ABD600" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWaist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00eefc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00eefc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#ABD600', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" kg"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#00eefc', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" cm"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#2C2C2E', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E1E4', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="Kilo"
                  stroke="#ABD600"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="waist"
                  name="Bel Çevresi"
                  stroke="#00eefc"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWaist)"
                  dot={{ r: 3 }}
                  connectNulls
                />
              </AreaChart>
            ) : activeTab === 'lifts' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} unit=" kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#2C2C2E', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E1E4', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="bench"
                  name="Bench Press"
                  stroke="#ffb4ab"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="squat"
                  name="Squat"
                  stroke="#ABD600"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="deadlift"
                  name="Deadlift"
                  stroke="#00eefc"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            ) : activeTab === 'lifestyle' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#2C2C2E', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E1E4', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  name="Uyku (saat)"
                  stroke="#d2e5f5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="diet"
                  name="Diyet Skoru"
                  stroke="#ABD600"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Enerji Seviyesi"
                  stroke="#00eefc"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ABD600" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ABD600" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#C4C9AC', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#2C2C2E', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E1E4', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value) => [`${Math.round(Number(value)).toLocaleString('tr-TR')} adım`, 'Adım Sayısı']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="steps"
                  name="Günlük Ortalama Adım"
                  stroke="#ABD600"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSteps)"
                  dot={{ r: 3 }}
                  connectNulls
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
