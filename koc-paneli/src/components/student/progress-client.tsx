'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  TrendingDown, TrendingUp, Minus, Plus, X, Trash2, Calendar,
  Ruler, Dumbbell, Smile,
  ChevronDown, ChevronUp, Camera
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { formatDate } from '@/lib/coach/format'
import { addProgressEntry, deleteProgressEntry } from '@/lib/student/progress.client'
import { submitWeeklyProgress } from '@/lib/student/progress-actions'
import type { ProgressSummary, ProgressEntryItem } from '@/lib/student/types'

type ProgressClientProps = {
  summary: ProgressSummary
  initialEntries: ProgressEntryItem[]
  studentId: string
  coachId: string | null
}

type TimeRange = '1w' | '1m' | 'all'

type ProgressTooltipProps = {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: ProgressTooltipProps) {
  if (active && payload?.[0]) {
    return (
      <div className="rounded-lg border border-[#444933] bg-[#131315] px-3 py-2 text-xs shadow-lg">
        <p className="text-[#C4C9AC]">{label}</p>
        <p className="font-medium text-[#E5E1E4]">{payload[0].value} kg</p>
      </div>
    )
  }
  return null
}

export function ProgressClient({ summary, initialEntries, studentId, coachId }: ProgressClientProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [modalOpen, setModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [referenceTime] = useState(() => Date.now())

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Toggle expanded entries
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({})



  // Form State
  const [entryType, setEntryType] = useState<'daily' | 'weekly'>('daily')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newWeight, setNewWeight] = useState('')
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Weekly Form State
  const [waistCm, setWaistCm] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [rightUpperArmCm, setRightUpperArmCm] = useState('')
  const [leftUpperArmCm, setLeftUpperArmCm] = useState('')
  const [rightThighCm, setRightThighCm] = useState('')
  const [leftThighCm, setLeftThighCm] = useState('')
  
  const [benchPressMax, setBenchPressMax] = useState('')
  const [squatMax, setSquatMax] = useState('')
  const [deadliftMax, setDeadliftMax] = useState('')
  
  const [workoutDaysCompleted, setWorkoutDaysCompleted] = useState('3')
  const [workoutDaysTarget, setWorkoutDaysTarget] = useState('4')
  const [sleepHoursAvg, setSleepHoursAvg] = useState('7')
  const [stepsAvg, setStepsAvg] = useState('')
  const [energyLevel, setEnergyLevel] = useState('7')
  const [dietCompliance, setDietCompliance] = useState('8')
  const [weeklyPhoto, setWeeklyPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Chart data (entries are newest-first, reverse for chart)
  const chartData = useMemo(() => {
    const reversed = [...entries].reverse()
    const withWeight = reversed.filter((e) => e.weight != null)
    const cutoff = timeRange === '1w' ? referenceTime - 7 * 86400000
      : timeRange === '1m' ? referenceTime - 30 * 86400000 : 0

    return withWeight
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .map((e) => ({ date: formatDate(e.date), weight: e.weight! }))
  }, [entries, referenceTime, timeRange])

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetForm = () => {
    setNewDate(new Date().toISOString().slice(0, 10))
    setNewWeight('')
    setNewNote('')
    setEntryType('daily')
    setWaistCm('')
    setChestCm('')
    setRightUpperArmCm('')
    setLeftUpperArmCm('')
    setRightThighCm('')
    setLeftThighCm('')
    setBenchPressMax('')
    setSquatMax('')
    setDeadliftMax('')
    setWorkoutDaysCompleted('3')
    setWorkoutDaysTarget('4')
    setSleepHoursAvg('7')
    setStepsAvg('')
    setEnergyLevel('7')
    setDietCompliance('8')
    setWeeklyPhoto(null)
    setPhotoPreview(null)
    setErrorMessage(null)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Yalnızca resim dosyası seçebilirsiniz.')
        return
      }
      setWeeklyPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    if (!coachId) return
    setErrorMessage(null)
    setSaving(true)

    const w = newWeight ? parseFloat(newWeight) : null
    if (!newDate || w === null || Number.isNaN(w)) {
      setErrorMessage('Tarih ve Kilo alanları zorunludur.')
      setSaving(false)
      return
    }

    try {
      if (entryType === 'daily') {
        const result = await addProgressEntry(studentId, coachId, {
          date: newDate, weight: w, note: newNote,
        })
        if (result) {
          setEntries((prev) => [{
            id: result.id, date: result.date, weight: result.weight,
            note: result.note, beforePhotoUrl: null, afterPhotoUrl: null,
            createdAt: result.created_at, isOwnEntry: true, customMetrics: {}
          }, ...prev])
          setModalOpen(false)
          resetForm()
        } else {
          setErrorMessage('Kayıt eklenirken bir hata oluştu.')
        }
      } else {
        // Weekly Progress using Server Action
        const formData = new FormData()
        formData.append('date', newDate)
        formData.append('weight', newWeight)
        formData.append('note', newNote)
        
        formData.append('waistCm', waistCm)
        formData.append('chestCm', chestCm)
        formData.append('rightUpperArmCm', rightUpperArmCm)
        formData.append('leftUpperArmCm', leftUpperArmCm)
        formData.append('rightThighCm', rightThighCm)
        formData.append('leftThighCm', leftThighCm)
        
        formData.append('benchPressMax', benchPressMax)
        formData.append('squatMax', squatMax)
        formData.append('deadliftMax', deadliftMax)
        
        formData.append('workoutDaysCompleted', workoutDaysCompleted)
        formData.append('workoutDaysTarget', workoutDaysTarget)
        formData.append('sleepHoursAvg', sleepHoursAvg)
        formData.append('stepsAvg', stepsAvg)
        formData.append('energyLevel', energyLevel)
        formData.append('dietCompliance', dietCompliance)
        
        if (weeklyPhoto) {
          formData.append('weeklyPhoto', weeklyPhoto)
        }

        const res = await submitWeeklyProgress(formData)
        if (res.success) {
          // Re-fetch progress list by refreshing or page reload is cleanest since signed URLs must generate for photos
          // But to be responsive, we can reload or let state know.
          window.location.reload()
        } else {
          setErrorMessage(res.error || 'Haftalık kayıt kaydedilirken hata oluştu.')
        }
      }
    } catch (e) {
      console.error(e)
      setErrorMessage('Bir şeyler ters gitti.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      const ok = await deleteProgressEntry(id)
      if (ok) setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const DiffIcon = summary.difference == null ? Minus
    : summary.difference < 0 ? TrendingDown : TrendingUp
  const diffColor = summary.difference == null ? 'text-[#C4C9AC]'
    : summary.difference < 0 ? 'text-[#ABD600]' : 'text-red-400'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="coach-card">
          <CardContent className="p-5">
            <p className="text-xs text-[#C4C9AC]">Başlangıç</p>
            <p className="text-2xl font-bold text-[#E5E1E4]">
              {summary.startWeight != null ? `${summary.startWeight} kg` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="coach-card">
          <CardContent className="p-5">
            <p className="text-xs text-[#C4C9AC]">Mevcut</p>
            <p className="text-2xl font-bold text-[#E5E1E4]">
              {summary.currentWeight != null ? `${summary.currentWeight} kg` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="coach-card">
          <CardContent className="flex items-center gap-3 p-5">
            <DiffIcon className={`h-6 w-6 ${diffColor}`} />
            <div>
              <p className="text-xs text-[#C4C9AC]">Fark</p>
              <p className={`text-2xl font-bold ${diffColor}`}>
                {summary.difference != null
                  ? `${summary.difference > 0 ? '+' : ''}${summary.difference.toFixed(1)} kg`
                  : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="coach-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-[#C4C9AC]">Kilo Değişimi</CardTitle>
          <div className="flex items-center gap-1">
            {(['1w', '1m', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  timeRange === r ? 'bg-[#C3F400] text-[#283500]' : 'text-[#C4C9AC] hover:text-[#E5E1E4]'
                }`}
              >
                {r === '1w' ? '1 Hafta' : r === '1m' ? '1 Ay' : 'Tümü'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.08)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#C4C9AC', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#C4C9AC', fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#ABD600" strokeWidth={2.5}
                    dot={{ fill: '#ABD600', strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: '#C3F400', strokeWidth: 0, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#C4C9AC]">Henüz veri yok.</p>
          )}
        </CardContent>
      </Card>

      {/* Add entry button */}
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
          <Plus className="mr-2 h-4 w-4" /> Yeni Kayıt Ekle
        </Button>
      </div>

      {/* Entry list */}
      <Card className="coach-card">
        <CardHeader><CardTitle className="text-base text-[#E5E1E4]">Kayıt Geçmişi</CardTitle></CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-[#C4C9AC]">Henüz kayıt yok.</p>
          ) : (
            <div className="divide-y divide-[#27272A]/50">
              {entries.map((e) => {
                const isExpanded = !!expandedEntries[e.id]
                const m = e.customMetrics || {}
                const isWeekly = m.entry_type === 'weekly'

                const getMetricString = (val: unknown): string | null => {
                  if (val === undefined || val === null) return null
                  const str = String(val).trim()
                  return str.length > 0 ? str : null
                }

                const waist = getMetricString(m.waist_cm ?? m.waist)
                const chest = getMetricString(m.chest_cm ?? m.chest)
                const rightArm = getMetricString(m.right_upper_arm_cm ?? m.right_arm)
                const leftArm = getMetricString(m.left_upper_arm_cm ?? m.left_arm)
                const rightThigh = getMetricString(m.right_thigh_cm ?? m.right_thigh)
                const leftThigh = getMetricString(m.left_thigh_cm ?? m.left_thigh)

                const bench = getMetricString(m.bench_press_max ?? m.bench)
                const squat = getMetricString(m.squat_max ?? m.squat)
                const deadlift = getMetricString(m.deadlift_max ?? m.deadlift)

                const sleep = getMetricString(m.sleep_hours_avg ?? m.sleep)
                const steps = getMetricString(m.steps_avg ?? m.steps)
                const diet = getMetricString(m.diet_compliance ?? m.diet)
                const energy = getMetricString(m.energy_level ?? m.energy)
                const workoutsCompleted = getMetricString(m.workout_days_completed)
                const workoutsTarget = getMetricString(m.workout_days_target)

                return (
                  <div key={e.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Date & Weight */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#C4C9AC] block font-semibold uppercase tracking-wider">
                            {formatDate(e.date)}
                          </span>
                          <span className="text-base font-extrabold text-[#E5E1E4]">
                            {e.weight !== null ? `${Number(e.weight).toFixed(1)} kg` : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Brief Note preview or Weekly label with tags */}
                      <div className="flex-1 min-w-0 hidden md:block">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {isWeekly && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#ABD600]/10 text-[#ABD600] border border-[#ABD600]/20 font-medium">
                              Haftalık Detaylı
                            </span>
                          )}
                          {!isWeekly && e.note && (
                            <p className="text-xs text-[#C4C9AC] italic truncate max-w-xs">
                              &ldquo;{e.note}&rdquo;
                            </p>
                          )}
                          {isWeekly && waist && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
                              Bel: {waist} cm
                            </span>
                          )}
                          {isWeekly && bench && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/25 text-yellow-400 bg-yellow-500/5">
                              Bench: {bench} kg
                            </span>
                          )}
                          {isWeekly && steps && !isNaN(Number(steps)) && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
                              Adım: {Math.round(Number(steps)).toLocaleString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        {isWeekly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(e.id)}
                            className="text-[#C4C9AC] hover:text-[#E5E1E4] hover:bg-[#2A2A2C]"
                          >
                            {isExpanded ? (
                              <>Gizle <ChevronUp className="ml-1 h-4 w-4" /></>
                            ) : (
                              <>Detaylar <ChevronDown className="ml-1 h-4 w-4" /></>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(e.id)}
                          className="text-[#C4C9AC] hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Weekly Metrics */}
                    {isWeekly && isExpanded && (
                      <div className="mt-4 pl-14 space-y-4 border-l border-[#27272A]/50">
                        {/* Note in expanded view */}
                        {e.note && (
                          <div className="text-xs text-[#C4C9AC] bg-[#18181B]/40 p-2.5 rounded-lg border border-[#27272A]/50">
                            <span className="font-semibold text-[#E5E1E4] block mb-1">Haftalık Yorum:</span>
                            &ldquo;{e.note}&rdquo;
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-3 text-xs">
                          {/* Body Measurements */}
                          <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
                            <div className="flex items-center gap-1.5 text-[#00eefc] font-semibold mb-1">
                              <Ruler className="h-3.5 w-3.5" />
                              <span>Vücut Ölçüleri</span>
                            </div>
                            <div className="space-y-1 text-[#C4C9AC]">
                              <div className="flex justify-between"><span>Bel:</span> <span className="text-[#E5E1E4] font-medium">{waist ? `${waist} cm` : '—'}</span></div>
                              <div className="flex justify-between"><span>Göğüs:</span> <span className="text-[#E5E1E4] font-medium">{chest ? `${chest} cm` : '—'}</span></div>
                              <div className="flex justify-between"><span>Sağ Kol:</span> <span className="text-[#E5E1E4] font-medium">{rightArm ? `${rightArm} cm` : '—'}</span></div>
                              <div className="flex justify-between"><span>Sol Kol:</span> <span className="text-[#E5E1E4] font-medium">{leftArm ? `${leftArm} cm` : '—'}</span></div>
                              <div className="flex justify-between"><span>Sağ Uyluk:</span> <span className="text-[#E5E1E4] font-medium">{rightThigh ? `${rightThigh} cm` : '—'}</span></div>
                              <div className="flex justify-between"><span>Sol Uyluk:</span> <span className="text-[#E5E1E4] font-medium">{leftThigh ? `${leftThigh} cm` : '—'}</span></div>
                            </div>
                          </div>

                          {/* Lifts max */}
                          <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
                            <div className="flex items-center gap-1.5 text-yellow-400 font-semibold mb-1">
                              <Dumbbell className="h-3.5 w-3.5" />
                              <span>Güç Limitleri</span>
                            </div>
                            <div className="space-y-1 text-[#C4C9AC]">
                              <div className="flex justify-between"><span>Bench Press:</span> <span className="text-[#E5E1E4] font-medium">{bench ? `${bench} kg` : '—'}</span></div>
                              <div className="flex justify-between"><span>Squat:</span> <span className="text-[#E5E1E4] font-medium">{squat ? `${squat} kg` : '—'}</span></div>
                              <div className="flex justify-between"><span>Deadlift:</span> <span className="text-[#E5E1E4] font-medium">{deadlift ? `${deadlift} kg` : '—'}</span></div>
                            </div>
                          </div>

                          {/* Lifestyle & Performance */}
                          <div className="space-y-2 p-3 rounded-lg bg-[#18181B]/30 border border-[#27272A]/30">
                            <div className="flex items-center gap-1.5 text-pink-400 font-semibold mb-1">
                              <Smile className="h-3.5 w-3.5" />
                              <span>Yaşam Tarzı & Uyum</span>
                            </div>
                            <div className="space-y-1 text-[#C4C9AC]">
                              <div className="flex justify-between"><span>Ort. Uyku:</span> <span className="text-[#E5E1E4] font-medium">{sleep ? `${sleep} sa` : '—'}</span></div>
                              <div className="flex justify-between"><span>Ort. Adım:</span> <span className="text-[#E5E1E4] font-medium">{steps ? Math.round(Number(steps)).toLocaleString('tr-TR') : '—'}</span></div>
                              <div className="flex justify-between"><span>Antrenman:</span> <span className="text-[#E5E1E4] font-medium">{workoutsCompleted && workoutsTarget ? `${workoutsCompleted}/${workoutsTarget} gün` : '—'}</span></div>
                              <div className="flex justify-between"><span>Diyet Uyumu:</span> <span className="text-[#E5E1E4] font-medium">{diet ? `${diet}/10` : '—'}</span></div>
                              <div className="flex justify-between"><span>Enerji Seviyesi:</span> <span className="text-[#E5E1E4] font-medium">{energy ? `${energy}/10` : '—'}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Photo Slot */}
                        {e.beforePhotoUrl && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#E5E1E4] uppercase tracking-wider">Haftalık Gelişim Fotoğrafı</h4>
                            <div className="relative w-40 aspect-[3/4] rounded-lg overflow-hidden border border-[#27272A] bg-black/20 shrink-0">
                              <Image
                                src={e.beforePhotoUrl}
                                alt="Haftalık Gelişim Fotoğrafı"
                                width={160}
                                height={213}
                                className="w-full h-full object-cover transition-all duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => setLightboxUrl(e.beforePhotoUrl)}
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[#27272A] bg-[#18181B] p-5 sm:p-6 shadow-2xl my-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#E5E1E4]">Yeni Kayıt Ekle</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="rounded-lg p-1.5 text-[#C4C9AC] hover:bg-[#2A2A2C]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Toggle Switch */}
            <div className="mb-5 flex rounded-lg bg-[#27272A] p-1">
              <button
                type="button"
                onClick={() => setEntryType('daily')}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  entryType === 'daily' ? 'bg-[#C3F400] text-[#283500]' : 'text-[#C4C9AC] hover:text-[#E5E1E4]'
                }`}
              >
                Günlük Kilo Girişi
              </button>
              <button
                type="button"
                onClick={() => setEntryType('weekly')}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  entryType === 'weekly' ? 'bg-[#C3F400] text-[#283500]' : 'text-[#C4C9AC] hover:text-[#E5E1E4]'
                }`}
              >
                Haftalık Detaylı Giriş
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Common Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-[#C4C9AC] text-xs">Tarih</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="coach-input mt-1" />
                </div>
                <div>
                  <Label className="text-[#C4C9AC] text-xs">Kilo (kg) *</Label>
                  <Input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ör: 75.5" className="coach-input mt-1" required />
                </div>
              </div>

              {/* Weekly Details Fields */}
              {entryType === 'weekly' && (
                <>
                  {/* Part 1: Body Measurements */}
                  <div className="border-t border-[#27272A] pt-4">
                    <h3 className="mb-3 text-xs font-bold text-[#ABD600] uppercase tracking-wider">Vücut Ölçüleri (Cm)</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Bel Çevresi (En Kritik Derece)</Label>
                        <Input type="number" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} placeholder="Ör: 82" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Göğüs Çevresi</Label>
                        <Input type="number" step="0.1" value={chestCm} onChange={(e) => setChestCm(e.target.value)} placeholder="Ör: 96" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Sağ Üst Kol Çevresi</Label>
                        <Input type="number" step="0.1" value={rightUpperArmCm} onChange={(e) => setRightUpperArmCm(e.target.value)} placeholder="Ör: 36.5" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Sol Üst Kol Çevresi</Label>
                        <Input type="number" step="0.1" value={leftUpperArmCm} onChange={(e) => setLeftUpperArmCm(e.target.value)} placeholder="Ör: 36" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Sağ Uyluk (Üst Bacak)</Label>
                        <Input type="number" step="0.1" value={rightThighCm} onChange={(e) => setRightThighCm(e.target.value)} placeholder="Ör: 58" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Sol Uyluk (Üst Bacak)</Label>
                        <Input type="number" step="0.1" value={leftThighCm} onChange={(e) => setLeftThighCm(e.target.value)} placeholder="Ör: 57.5" className="coach-input mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Best Lifts */}
                  <div className="border-t border-[#27272A] pt-4">
                    <h3 className="mb-3 text-xs font-bold text-[#ABD600] uppercase tracking-wider">Haftalık En İyi Kaldırışlar (Kg)</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Bench Press</Label>
                        <Input type="number" step="0.5" value={benchPressMax} onChange={(e) => setBenchPressMax(e.target.value)} placeholder="Ör: 80" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Squat</Label>
                        <Input type="number" step="0.5" value={squatMax} onChange={(e) => setSquatMax(e.target.value)} placeholder="Ör: 100" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Deadlift</Label>
                        <Input type="number" step="0.5" value={deadliftMax} onChange={(e) => setDeadliftMax(e.target.value)} placeholder="Ör: 120" className="coach-input mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Part 3: Lifestyle */}
                  <div className="border-t border-[#27272A] pt-4">
                    <h3 className="mb-3 text-xs font-bold text-[#ABD600] uppercase tracking-wider">Yaşam Tarzı ve Performans</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Tamamlanan Antrenman Günü</Label>
                        <select
                          value={workoutDaysCompleted}
                          onChange={(e) => setWorkoutDaysCompleted(e.target.value)}
                          className="coach-input mt-1 w-full bg-[#131315] text-[#E5E1E4]"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <option key={num} value={num}>{num} Gün</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Hedef Antrenman Günü</Label>
                        <select
                          value={workoutDaysTarget}
                          onChange={(e) => setWorkoutDaysTarget(e.target.value)}
                          className="coach-input mt-1 w-full bg-[#131315] text-[#E5E1E4]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <option key={num} value={num}>{num} Gün</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Ortalama Uyku Süresi (Saat)</Label>
                        <Input type="number" step="0.5" value={sleepHoursAvg} onChange={(e) => setSleepHoursAvg(e.target.value)} placeholder="Ör: 7.5" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs">Günlük Ortalama Adım (Opsiyonel)</Label>
                        <Input type="number" step="1" value={stepsAvg} onChange={(e) => setStepsAvg(e.target.value)} placeholder="Ör: 8000" className="coach-input mt-1" />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs flex justify-between">
                          <span>Enerji Seviyesi (1-10)</span>
                          <span className="font-semibold text-[#ABD600]">{energyLevel}/10</span>
                        </Label>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)}
                          className="accent-[#C3F400] w-full mt-2 h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <Label className="text-[#C4C9AC] text-xs flex justify-between">
                          <span>Diyet Uyumu (1-10)</span>
                          <span className="font-semibold text-[#ABD600]">{dietCompliance}/10</span>
                        </Label>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={dietCompliance} onChange={(e) => setDietCompliance(e.target.value)}
                          className="accent-[#C3F400] w-full mt-2 h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part 4: Photo */}
                  <div className="border-t border-[#27272A] pt-4">
                    <h3 className="mb-2 text-xs font-bold text-[#ABD600] uppercase tracking-wider">Haftalık Progress Fotoğrafı</h3>
                    <div className="mt-1 flex items-center justify-center rounded-xl border border-dashed border-[#444933] p-4 text-center bg-[#0E0E10]/40">
                      {photoPreview ? (
                        <div className="relative group max-w-[200px] overflow-hidden rounded-lg">
                          <Image src={photoPreview} alt="Fotoğraf Önizleme" width={200} height={150} className="aspect-[4/3] object-cover" />
                          <button
                            type="button"
                            onClick={() => { setWeeklyPhoto(null); setPhotoPreview(null); }}
                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/90"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center">
                          <Camera className="mb-2 h-8 w-8 text-[#C4C9AC]" />
                          <span className="text-xs font-semibold text-[#ABD600]">Fotoğraf Seç veya Sürükle</span>
                          <span className="text-[10px] text-[#C4C9AC] mt-1">PNG, JPG (Max 10MB)</span>
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* General Note */}
              <div className="border-t border-[#27272A] pt-4">
                <Label className="text-[#C4C9AC] text-xs">
                  {entryType === 'weekly' ? 'Haftalık Değerlendirme & Yorum' : 'Günlük Not'}
                </Label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={entryType === 'weekly' ? 'Bu hafta nasıl geçti? Zorlandığınız yerler veya notlarınız...' : 'Bugün nasıl geçti?'}
                  className="coach-input mt-1.5 min-h-[70px] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#27272A] mt-4">
              <Button variant="ghost" onClick={() => { setModalOpen(false); resetForm(); }} className="text-[#C4C9AC] hover:bg-[#2A2A2C]">İptal</Button>
              <Button onClick={handleAdd} disabled={saving} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-[90vw] max-h-[85vh] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxUrl}
              alt="Gelişim fotoğrafı büyük boy"
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  )
}
