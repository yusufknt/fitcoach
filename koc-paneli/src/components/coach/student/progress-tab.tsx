import type { ProgressEntry } from '@/types'
import { ProgressChart } from '@/components/coach/student/progress-chart'
import { ProgressEntryList } from '@/components/coach/student/progress-entry-list'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'
import { Scale, Dumbbell, Heart, Activity } from 'lucide-react'

type ProgressTabProps = {
  coachStudentId: string
  studentId: string
  entries: ProgressEntry[]
  onboarding: StudentOnboardingView | null
}

export function ProgressTab({
  coachStudentId,
  studentId,
  entries,
  onboarding,
}: ProgressTabProps) {
  // Sort entries ascending (oldest first)
  const sortedAsc = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  
  // Extract initial and latest values
  const initialWeight = onboarding?.profile?.initial_weight ?? sortedAsc.find(e => e.weight !== null)?.weight ?? null
  const latestWeight = sortedAsc.filter(e => e.weight !== null).pop()?.weight ?? onboarding?.profile?.initial_weight ?? null

  const getWaist = (entry: ProgressEntry) => {
    const w = entry.custom_metrics?.waist_cm ?? entry.custom_metrics?.waist
    return w ? parseFloat(w.toString()) : null
  }
  const initialWaist = onboarding?.profile?.waist_cm ?? sortedAsc.map(getWaist).find(w => w !== null) ?? null
  const latestWaist = sortedAsc.map(getWaist).filter(w => w !== null).pop() ?? onboarding?.profile?.waist_cm ?? null

  // Lifts max calculation
  let maxBench: number | null = null
  let maxSquat: number | null = null
  let maxDeadlift: number | null = null

  entries.forEach((e) => {
    const m = e.custom_metrics || {}
    const bench = m.bench_press_max ?? m.bench
    const squat = m.squat_max ?? m.squat
    const dead = m.deadlift_max ?? m.deadlift

    if (bench !== undefined && bench !== null) {
      const v = parseFloat(bench.toString())
      if (!isNaN(v) && (maxBench === null || v > maxBench)) maxBench = v
    }
    if (squat !== undefined && squat !== null) {
      const v = parseFloat(squat.toString())
      if (!isNaN(v) && (maxSquat === null || v > maxSquat)) maxSquat = v
    }
    if (dead !== undefined && dead !== null) {
      const v = parseFloat(dead.toString())
      if (!isNaN(v) && (maxDeadlift === null || v > maxDeadlift)) maxDeadlift = v
    }
  })

  // Averages for lifestyle
  let totalSleep = 0, sleepCount = 0
  let totalSteps = 0, stepsCount = 0
  let totalDiet = 0, dietCount = 0
  let totalEnergy = 0, energyCount = 0

  entries.forEach((e) => {
    const m = e.custom_metrics || {}
    const sleep = m.sleep_hours_avg ?? m.sleep
    const steps = m.steps_avg ?? m.steps
    const diet = m.diet_compliance ?? m.diet
    const energy = m.energy_level ?? m.energy

    if (sleep !== undefined && sleep !== null) {
      const v = parseFloat(sleep.toString())
      if (!isNaN(v)) { totalSleep += v; sleepCount++ }
    }
    if (steps !== undefined && steps !== null) {
      const v = parseFloat(steps.toString())
      if (!isNaN(v)) { totalSteps += v; stepsCount++ }
    }
    if (diet !== undefined && diet !== null) {
      const v = parseFloat(diet.toString())
      if (!isNaN(v)) { totalDiet += v; dietCount++ }
    }
    if (energy !== undefined && energy !== null) {
      const v = parseFloat(energy.toString())
      if (!isNaN(v)) { totalEnergy += v; energyCount++ }
    }
  })

  const avgSleep = sleepCount > 0 ? totalSleep / sleepCount : null
  const avgSteps = stepsCount > 0 ? totalSteps / stepsCount : null
  const avgDiet = dietCount > 0 ? totalDiet / dietCount : null
  const avgEnergy = energyCount > 0 ? totalEnergy / energyCount : null

  return (
    <div className="space-y-6">
      {/* Metrics Summary Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Kilo Card */}
        <div className="coach-card p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#444933]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C4C9AC] font-bold">Kilo Durumu</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {latestWeight ? `${latestWeight.toFixed(1)} kg` : '—'}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 border-t border-[#27272A]/40 pt-2 text-[10px] text-[#C4C9AC]">
            <span>Başlangıç: {initialWeight ? `${initialWeight} kg` : '—'}</span>
            {latestWeight && initialWeight ? (
              <span className={`font-bold px-1.5 py-0.5 rounded ${latestWeight - initialWeight < 0 ? 'bg-[#ABD600]/10 text-[#ABD600]' : 'bg-red-500/10 text-red-400'}`}>
                {latestWeight - initialWeight > 0 ? '+' : ''}{(latestWeight - initialWeight).toFixed(1)} kg
              </span>
            ) : null}
          </div>
        </div>

        {/* Bel Çevresi Card */}
        <div className="coach-card p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#444933]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C4C9AC] font-bold">Bel Ölçüsü</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {latestWaist ? `${latestWaist.toFixed(1)} cm` : '—'}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-[#00eefc]/10 text-[#00eefc]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 border-t border-[#27272A]/40 pt-2 text-[10px] text-[#C4C9AC]">
            <span>Başlangıç: {initialWaist ? `${initialWaist} cm` : '—'}</span>
            {latestWaist && initialWaist ? (
              <span className={`font-bold px-1.5 py-0.5 rounded ${latestWaist - initialWaist < 0 ? 'bg-[#ABD600]/10 text-[#ABD600]' : 'bg-red-500/10 text-red-400'}`}>
                {latestWaist - initialWaist > 0 ? '+' : ''}{(latestWaist - initialWaist).toFixed(1)} cm
              </span>
            ) : null}
          </div>
        </div>

        {/* Kaldırışlar Card */}
        <div className="coach-card p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#444933]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C4C9AC] font-bold">Kaldırış Gücü (Max)</span>
              <div className="grid grid-cols-3 gap-2 mt-1.5 text-[10px] font-semibold text-white">
                <div>
                  <span className="block text-[8px] text-[#C4C9AC] uppercase">Bench</span>
                  {maxBench ? `${maxBench} kg` : '—'}
                </div>
                <div>
                  <span className="block text-[8px] text-[#C4C9AC] uppercase">Squat</span>
                  {maxSquat ? `${maxSquat} kg` : '—'}
                </div>
                <div>
                  <span className="block text-[8px] text-[#C4C9AC] uppercase">Deadlift</span>
                  {maxDeadlift ? `${maxDeadlift} kg` : '—'}
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Dumbbell className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[8px] text-[#C4C9AC]/50 border-t border-[#27272A]/40 pt-1 mt-1 text-right">
            En Yüksek 1RM Performansı
          </div>
        </div>

        {/* Yaşam Ortalamaları Card */}
        <div className="coach-card p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#444933]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C4C9AC] font-bold">Yaşam Ortalamaları</span>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-[9px] font-semibold text-white">
                <div>
                  <span className="block text-[7px] text-[#C4C9AC] uppercase">Uyku</span>
                  {avgSleep ? `${avgSleep.toFixed(1)} sa` : '—'}
                </div>
                <div>
                  <span className="block text-[7px] text-[#C4C9AC] uppercase">Adım</span>
                  {avgSteps ? Math.round(avgSteps).toLocaleString('tr-TR') : '—'}
                </div>
                <div>
                  <span className="block text-[7px] text-[#C4C9AC] uppercase">Diyet</span>
                  {avgDiet ? `${avgDiet.toFixed(1)}/10` : '—'}
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[8px] text-[#C4C9AC]/50 border-t border-[#27272A]/40 pt-1 mt-1 text-right">
            Enerji Seviyesi Ort: {avgEnergy ? `${avgEnergy.toFixed(1)}/10` : '—'}
          </div>
        </div>
      </div>

      {/* Dynamic Tabs Chart Container */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#E5E1E4]">İlerleme Analiz Grafiği</h2>
        </div>
        <ProgressChart entries={entries} />
      </section>

      {/* Timeline Entries List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#E5E1E4]">İlerleme Kayıt Geçmişi</h2>
        <ProgressEntryList entries={entries} />
      </section>
    </div>
  )
}
