'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, X, Trash2, Calendar, FileText, ExternalLink
} from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import {
  getMonthlyReports,
  saveMonthlyReport,
  deleteMonthlyReport,
  publishMonthlyReport,
  getReportSignedUrl,
  type MonthlyReport
} from '@/lib/coach/report-actions'
import type { ProgressEntry } from '@/types'

// Dynamic imports for jspdf/html2canvas to avoid SSR issues
const getPdfUtils = async () => {
  const { jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas-pro')
  return { jsPDF, html2canvas }
}

type ReportsTabProps = {
  coachStudentId: string
  studentId: string
  entries: ProgressEntry[]
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

export function ReportsTab({ coachStudentId, studentId, entries }: ReportsTabProps) {
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Wizard States
  const [selectedMonth, setSelectedMonth] = useState('') // 'YYYY-MM'
  const [coachComment, setCoachComment] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const getWeeklyDiff = (current: number | null | undefined, prev: number | null | undefined, isWeightOrWaist: boolean = false) => {
    if (current === null || current === undefined || prev === null || prev === undefined) return null
    const diff = current - prev
    if (Math.abs(diff) < 0.05) return null
    const isGood = isWeightOrWaist ? diff < 0 : diff > 0
    const sign = diff > 0 ? '+' : ''
    const color = isGood ? '#ABD600' : '#F87171' // neon lime vs red-400
    return { diff, sign, color }
  }

  const getNetDiff = (w4: number | null | undefined, w1: number | null | undefined, isWeightOrWaist: boolean = false) => {
    if (w4 === null || w4 === undefined || w1 === null || w1 === undefined) return '—'
    const diff = w4 - w1
    if (Math.abs(diff) < 0.05) return '0.0'
    const isGood = isWeightOrWaist ? diff < 0 : diff > 0
    const color = isGood ? 'text-[#ABD600]' : 'text-red-400'
    const sign = diff > 0 ? '+' : ''
    return (
      <span className={`font-bold ${color}`}>
        {sign}{diff.toFixed(1)}
      </span>
    )
  }
  
  const pdfTemplateRef = useRef<HTMLDivElement>(null)

  // Fetch reports function declared here
  const fetchReports = useCallback(async () => {
    setLoading(true)
    const data = await getMonthlyReports(studentId)
    setReports(data)
    setLoading(false)
  }, [studentId])

  // Fetch reports on load
  useEffect(() => {
    let active = true
    const run = async () => {
      await Promise.resolve()
      if (active) {
        fetchReports()
      }
    }
    run()
    return () => {
      active = false
    }
  }, [fetchReports])

  // Month list for selection (last 6 months)
  const monthOptions = useMemo(() => {
    const options = []
    const d = new Date()
    for (let i = 0; i < 6; i++) {
      const year = d.getFullYear()
      const month = d.getMonth()
      const mStr = String(month + 1).padStart(2, '0')
      const value = `${year}-${mStr}`
      const label = `${MONTH_NAMES[month]} ${year}`
      options.push({ value, label })
      d.setMonth(d.getMonth() - 1)
    }
    return options
  }, [])

  // Calculate statistics for selected month
  const stats = useMemo(() => {
    if (!selectedMonth) return null

    // Filter progress entries for selected month ('YYYY-MM-DD')
    const monthEntries = entries.filter((e) => e.date.startsWith(selectedMonth))
    if (monthEntries.length === 0) {
      return {
        totalEntries: 0,
        avgWeight: null,
        weightDiff: null,
        avgWaist: null,
        avgSleep: null,
        avgSteps: null,
        avgDiet: null,
        avgEnergy: null,
        benchMax: null,
        squatMax: null,
        deadliftMax: null,
        workoutsCompleted: 0,
        workoutsTarget: 0,
        photos: [] as string[],
        weeklyBreakdown: [
          { week_number: 1, label: '1. Hafta (1-7)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
          { week_number: 2, label: '2. Hafta (8-14)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
          { week_number: 3, label: '3. Hafta (15-21)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null },
          { week_number: 4, label: '4. Hafta (22+)', avg_weight: null, avg_waist: null, bench_max: null, squat_max: null, deadlift_max: null, avg_sleep: null, avg_steps: null, avg_diet: null, avg_energy: null, workouts_completed: 0, workouts_target: 0, photo_url: null }
        ]
      }
    }

    // Sort ascending for differences
    const sorted = [...monthEntries].sort((a, b) => a.date.localeCompare(b.date))
    
    // Weight calculation
    const weights = sorted.map(e => e.weight).filter((w): w is number => w !== null)
    const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : null
    
    const startWeight = weights.length > 0 ? weights[0] : null
    const endWeight = weights.length > 0 ? weights[weights.length - 1] : null
    const weightDiff = startWeight !== null && endWeight !== null ? endWeight - startWeight : null

    // Waist calculations
    const waists: number[] = []
    const sleepHours: number[] = []
    const steps: number[] = []
    const diets: number[] = []
    const energies: number[] = []
    let benchMax = 0
    let squatMax = 0
    let deadliftMax = 0
    let workoutsCompleted = 0
    let workoutsTarget = 0
    const photos: string[] = []

    sorted.forEach((e) => {
      const m = (e.custom_metrics as Record<string, string | number | null | undefined>) || {}
      
      // Parse waist
      const waist = parseFloat(m.waist_cm?.toString() ?? '')
      if (!isNaN(waist)) waists.push(waist)

      // Parse sleep
      const sleep = parseFloat(m.sleep_hours_avg?.toString() ?? '')
      if (!isNaN(sleep)) sleepHours.push(sleep)

      // Parse steps
      const step = parseFloat(m.steps_avg?.toString() ?? '')
      if (!isNaN(step)) steps.push(step)

      // Parse diet
      const diet = parseFloat(m.diet_compliance?.toString() ?? '')
      if (!isNaN(diet)) diets.push(diet)

      // Parse energy
      const energy = parseFloat(m.energy_level?.toString() ?? '')
      if (!isNaN(energy)) energies.push(energy)

      // Parse lifts
      const bench = parseFloat(m.bench_press_max?.toString() ?? '')
      if (!isNaN(bench) && bench > benchMax) benchMax = bench

      const squat = parseFloat(m.squat_max?.toString() ?? '')
      if (!isNaN(squat) && squat > squatMax) squatMax = squat

      const dead = parseFloat(m.deadlift_max?.toString() ?? '')
      if (!isNaN(dead) && dead > deadliftMax) deadliftMax = dead

      // Workouts
      const completed = parseInt(m.workout_days_completed?.toString() ?? '')
      const target = parseInt(m.workout_days_target?.toString() ?? '')
      if (!isNaN(completed)) workoutsCompleted += completed
      if (!isNaN(target)) workoutsTarget += target

      // Progress Photos
      if (e.before_photo_url) {
        photos.push(e.before_photo_url)
      }
    })

    const avgWaist = waists.length > 0 ? waists.reduce((s, x) => s + x, 0) / waists.length : null
    const avgSleep = sleepHours.length > 0 ? sleepHours.reduce((s, x) => s + x, 0) / sleepHours.length : null
    const avgSteps = steps.length > 0 ? steps.reduce((s, x) => s + x, 0) / steps.length : null
    const avgDiet = diets.length > 0 ? diets.reduce((s, x) => s + x, 0) / diets.length : null
    const avgEnergy = energies.length > 0 ? energies.reduce((s, x) => s + x, 0) / energies.length : null

    // Weekly calculations
    const weekBins = [
      { num: 1, label: '1. Hafta (1-7)', startDay: 1, endDay: 7, entries: [] as ProgressEntry[] },
      { num: 2, label: '2. Hafta (8-14)', startDay: 8, endDay: 14, entries: [] as ProgressEntry[] },
      { num: 3, label: '3. Hafta (15-21)', startDay: 15, endDay: 21, entries: [] as ProgressEntry[] },
      { num: 4, label: '4. Hafta (22+)', startDay: 22, endDay: 31, entries: [] as ProgressEntry[] }
    ]

    sorted.forEach((e) => {
      const parts = e.date.split('-')
      const day = parseInt(parts[2], 10)
      if (isNaN(day)) return
      if (day >= 1 && day <= 7) weekBins[0].entries.push(e)
      else if (day >= 8 && day <= 14) weekBins[1].entries.push(e)
      else if (day >= 15 && day <= 21) weekBins[2].entries.push(e)
      else weekBins[3].entries.push(e)
    })

    const weeklyBreakdown = weekBins.map((bin) => {
      const wEntries = bin.entries
      if (wEntries.length === 0) {
        return {
          week_number: bin.num,
          label: bin.label,
          avg_weight: null,
          avg_waist: null,
          bench_max: null,
          squat_max: null,
          deadlift_max: null,
          avg_sleep: null,
          avg_steps: null,
          avg_diet: null,
          avg_energy: null,
          workouts_completed: 0,
          workouts_target: 0,
          photo_url: null
        }
      }

      const wWeights = wEntries.map(e => e.weight).filter((w): w is number => w !== null)
      const wAvgWeight = wWeights.length > 0 ? wWeights.reduce((s, x) => s + x, 0) / wWeights.length : null

      const wWaists: number[] = []
      const wSleep: number[] = []
      const wSteps: number[] = []
      const wDiets: number[] = []
      const wEnergies: number[] = []
      let wBench = 0
      let wSquat = 0
      let wDead = 0
      let wCompleted = 0
      let wTarget = 0
      let wPhotoUrl: string | null = null

      wEntries.forEach((e) => {
        const m = (e.custom_metrics as Record<string, string | number | null | undefined>) || {}
        
        const waist = parseFloat(m.waist_cm?.toString() ?? '')
        if (!isNaN(waist)) wWaists.push(waist)

        const sleep = parseFloat(m.sleep_hours_avg?.toString() ?? '')
        if (!isNaN(sleep)) wSleep.push(sleep)

        const step = parseFloat(m.steps_avg?.toString() ?? '')
        if (!isNaN(step)) wSteps.push(step)

        const diet = parseFloat(m.diet_compliance?.toString() ?? '')
        if (!isNaN(diet)) wDiets.push(diet)

        const energy = parseFloat(m.energy_level?.toString() ?? '')
        if (!isNaN(energy)) wEnergies.push(energy)

        const bench = parseFloat(m.bench_press_max?.toString() ?? '')
        if (!isNaN(bench) && bench > wBench) wBench = bench

        const squat = parseFloat(m.squat_max?.toString() ?? '')
        if (!isNaN(squat) && squat > wSquat) wSquat = squat

        const dead = parseFloat(m.deadlift_max?.toString() ?? '')
        if (!isNaN(dead) && dead > wDead) wDead = dead

        const completed = parseInt(m.workout_days_completed?.toString() ?? '')
        const target = parseInt(m.workout_days_target?.toString() ?? '')
        if (!isNaN(completed)) wCompleted += completed
        if (!isNaN(target)) wTarget += target

        if (e.before_photo_url && !wPhotoUrl) {
          wPhotoUrl = e.before_photo_url
        }
      })

      return {
        week_number: bin.num,
        label: bin.label,
        avg_weight: wAvgWeight,
        avg_waist: wWaists.length > 0 ? wWaists.reduce((s, x) => s + x, 0) / wWaists.length : null,
        bench_max: wBench || null,
        squat_max: wSquat || null,
        deadlift_max: wDead || null,
        avg_sleep: wSleep.length > 0 ? wSleep.reduce((s, x) => s + x, 0) / wSleep.length : null,
        avg_steps: wSteps.length > 0 ? wSteps.reduce((s, x) => s + x, 0) / wSteps.length : null,
        avg_diet: wDiets.length > 0 ? wDiets.reduce((s, x) => s + x, 0) / wDiets.length : null,
        avg_energy: wEnergies.length > 0 ? wEnergies.reduce((s, x) => s + x, 0) / wEnergies.length : null,
        workouts_completed: wCompleted,
        workouts_target: wTarget,
        photo_url: wPhotoUrl
      }
    })

    return {
      totalEntries: monthEntries.length,
      avgWeight,
      weightDiff,
      avgWaist,
      avgSleep,
      avgSteps,
      avgDiet,
      avgEnergy,
      benchMax: benchMax || null,
      squatMax: squatMax || null,
      deadliftMax: deadliftMax || null,
      workoutsCompleted,
      workoutsTarget,
      photos,
      weeklyBreakdown
    }
  }, [selectedMonth, entries])

  const handleCreateReport = async () => {
    if (!selectedMonth || !stats) {
      setErrorMessage('Lütfen bir ay seçin.')
      return
    }

    setGeneratingPdf(true)
    setErrorMessage(null)

    try {
      const { jsPDF, html2canvas } = await getPdfUtils()

      // Render the hidden template to Canvas
      // Make template visible temporarily for rendering
      const templateEl = pdfTemplateRef.current
      if (!templateEl) {
        throw new Error('Template element not found')
      }

      templateEl.style.display = 'block'
      
      // Wait for images to load if any
      await new Promise((resolve) => setTimeout(resolve, 800))

      const canvas = await html2canvas(templateEl, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#121214',
        logging: false
      })

      // Hide template again
      templateEl.style.display = 'none'

      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      
      // Standard A4 aspect ratio PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const pdfBlob = pdf.output('blob')

      // Convert pdf blob to base64 string
      const reader = new FileReader()
      const pdfBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1]
            resolve(base64String)
          } else {
            reject(new Error('PDF okuma hatası.'))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })

      const pdfBase64 = await pdfBase64Promise

      const result = await saveMonthlyReport({
        coachStudentId,
        studentId,
        reportMonth: `${selectedMonth}-01`,
        coachComment,
        isPublished,
        metricsSummary: {
          avg_weight: stats.avgWeight,
          weight_diff: stats.weightDiff,
          avg_waist: stats.avgWaist,
          avg_sleep: stats.avgSleep,
          avg_steps: stats.avgSteps,
          avg_diet: stats.avgDiet,
          avg_energy: stats.avgEnergy,
          bench_max: stats.benchMax,
          squat_max: stats.squatMax,
          deadlift_max: stats.deadliftMax,
          workouts_completed: stats.workoutsCompleted,
          workouts_target: stats.workoutsTarget,
          weekly_breakdown: stats.weeklyBreakdown,
        },
        pdfBase64,
      })
      if (result.success) {
        setWizardOpen(false)
        setCoachComment('')
        setSelectedMonth('')
        fetchReports()
      } else {
        setErrorMessage(result.error || 'Rapor oluşturulurken hata oluştu.')
      }
    } catch (err) {
      const e = err as Error
      console.error(e)
      setErrorMessage(e.message || 'PDF oluşturulurken beklenmedik bir hata oluştu.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (confirm('Bu gelişim raporunu silmek istediğinize emin misiniz?')) {
      const res = await deleteMonthlyReport(reportId, coachStudentId)
      if (res.success) {
        fetchReports()
      } else {
        alert(res.error)
      }
    }
  }

  const handlePublish = async (reportId: string) => {
    const res = await publishMonthlyReport(reportId, coachStudentId)
    if (res.success) {
      fetchReports()
    } else {
      alert(res.error)
    }
  }

  const handleOpenPdf = async (reportId: string) => {
    const url = await getReportSignedUrl(reportId)
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Rapor indirme linki oluşturulamadı.')
    }
  }

  const getMonthLabel = (dateStr: string) => {
    // dateStr e.g. '2026-05-01'
    const parts = dateStr.split('-')
    const monthIndex = parseInt(parts[1]) - 1
    const year = parts[0]
    return `${MONTH_NAMES[monthIndex]} ${year}`
  }

  return (
    <div className="space-y-6">
      {/* Tab Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#E5E1E4]">Gelişim Raporları</h3>
          <p className="text-xs text-[#C4C9AC]">Aylık gelişim ve özet PDF raporları.</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
          <Plus className="mr-1.5 h-4 w-4" /> Yeni Rapor Hazırla
        </Button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-8 text-center text-sm text-[#C4C9AC]">Yükleniyor...</div>
      ) : reports.length === 0 ? (
        <Card className="coach-card">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-[#C4C9AC]/30" />
            <p className="text-sm font-medium text-[#E5E1E4]">Henüz Hazırlanmış Rapor Yok</p>
            <p className="text-xs text-[#C4C9AC] mt-1">Öğrencinin aylık gelişim özetini ve yorumlarınızı içeren ilk raporu hazırlayın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} className="coach-card border border-[#444933] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-[#19191B] pb-3 border-b border-[#2C2C2E]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#ABD600]" />
                  <span className="font-bold text-[#E5E1E4]">{getMonthLabel(report.report_month)}</span>
                </div>
                <div>
                  {report.is_published ? (
                    <span className="rounded bg-[#ABD600]/10 px-2 py-0.5 text-[10px] font-bold text-[#ABD600]">Yayınlandı</span>
                  ) : (
                    <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">Taslak</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {report.coach_comment && (
                  <p className="text-xs text-[#C4C9AC] line-clamp-3 italic">
                    &ldquo;{report.coach_comment}&rdquo;
                  </p>
                )}

                {/* Quick stats grid from metrics_summary */}
                {report.metrics_summary && (
                  <div className="grid grid-cols-3 gap-2 bg-[#121214]/50 rounded-lg p-2 text-center text-[10px] text-[#C4C9AC] border border-[#27272A]">
                    <div>
                      <span className="block text-[#ABD600] font-semibold">
                        {report.metrics_summary.weight_diff !== null && report.metrics_summary.weight_diff !== undefined 
                          ? `${report.metrics_summary.weight_diff > 0 ? '+' : ''}${Number(report.metrics_summary.weight_diff).toFixed(1)} kg`
                          : '—'
                        }
                      </span>
                      <span>Kilo Farkı</span>
                    </div>
                    <div>
                      <span className="block text-[#ABD600] font-semibold">
                        {report.metrics_summary.avg_waist 
                          ? `${Number(report.metrics_summary.avg_waist).toFixed(1)} cm`
                          : '—'
                        }
                      </span>
                      <span>Ort. Bel</span>
                    </div>
                    <div>
                      <span className="block text-[#ABD600] font-semibold">
                        {report.metrics_summary.workouts_completed || 0} G
                      </span>
                      <span>Antrenman</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenPdf(report.id)} className="h-8 text-xs text-[#C4C9AC] hover:bg-[#2A2A2C] hover:text-[#E5E1E4]">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> PDF
                    </Button>
                    {!report.is_published && (
                      <Button size="sm" onClick={() => handlePublish(report.id)} className="h-8 text-xs bg-[#ABD600]/10 text-[#ABD600] hover:bg-[#ABD600]/20">
                        Yayınla
                      </Button>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(report.id)} className="h-8 w-8 text-white/30 hover:bg-red-500/10 hover:text-red-400 p-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* NEW REPORT WIZARD MODAL */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-[#27272A] bg-[#18181B] p-5 sm:p-6 shadow-2xl my-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#E5E1E4]">Aylık Rapor Sihirbazı</h2>
              <button onClick={() => { setWizardOpen(false); setSelectedMonth(''); setCoachComment(''); }} className="rounded-lg p-1.5 text-[#C4C9AC] hover:bg-[#2A2A2C]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-[#C4C9AC]">Raporlanacak Ay Seçimi</Label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="coach-input mt-1.5 w-full bg-[#131315] text-[#E5E1E4]"
                >
                  <option value="">-- Ay Seçiniz --</option>
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Statistics Preview Card */}
              {selectedMonth && stats && (
                <div className="rounded-xl border border-[#444933] bg-[#121214]/50 p-4 space-y-4">
                  <h3 className="text-xs font-bold text-[#ABD600] uppercase tracking-wider">Otomatik Hesaplanan Gelişim Verileri</h3>
                  
                  {stats.totalEntries === 0 ? (
                    <p className="text-xs text-yellow-500">Seçilen ay için öğrenciye ait herhangi bir kayıt bulunamadı. Rapor boş oluşturulacaktır.</p>
                  ) : (
                    <>
                      {/* Aylık Averages */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-[#18181B] p-2 text-center">
                          <span className="text-[10px] block text-[#C4C9AC]">Toplam Giriş</span>
                          <span className="font-bold text-[#E5E1E4] text-sm">{stats.totalEntries} Gün</span>
                        </div>
                        <div className="rounded-lg bg-[#18181B] p-2 text-center">
                          <span className="text-[10px] block text-[#C4C9AC]">Kilo Farkı</span>
                          <span className={`font-bold text-sm ${stats.weightDiff && stats.weightDiff < 0 ? 'text-[#ABD600]' : 'text-red-400'}`}>
                            {stats.weightDiff !== null 
                              ? `${stats.weightDiff > 0 ? '+' : ''}${stats.weightDiff.toFixed(1)} kg` 
                              : '—'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#18181B] p-2 text-center">
                          <span className="text-[10px] block text-[#C4C9AC]">Aylık Ort. Bel</span>
                          <span className="font-bold text-[#E5E1E4] text-sm">
                            {stats.avgWaist ? `${stats.avgWaist.toFixed(1)} cm` : '—'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#18181B] p-2 text-center">
                          <span className="text-[10px] block text-[#C4C9AC]">Antrenman</span>
                          <span className="font-bold text-[#E5E1E4] text-sm">
                            {stats.workoutsCompleted} / {stats.workoutsTarget} G
                          </span>
                        </div>
                      </div>

                      {/* Haftalık Karşılaştırma Tablosu */}
                      <div className="border-t border-[#27272A] pt-4 space-y-2">
                        <h4 className="text-xs font-bold text-[#ABD600] uppercase tracking-wider">Hafta Hafta Karşılaştırma Analizi</h4>
                        <div className="overflow-x-auto rounded-lg border border-[#27272A] bg-[#18181B]/50">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#27272A] text-[#C4C9AC] bg-[#131315]">
                                <th className="py-2 px-3 font-semibold">Metrik</th>
                                <th className="py-2 px-3 font-semibold text-center">1. Hafta</th>
                                <th className="py-2 px-3 font-semibold text-center">2. Hafta</th>
                                <th className="py-2 px-3 font-semibold text-center">3. Hafta</th>
                                <th className="py-2 px-3 font-semibold text-center">4. Hafta</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/50 text-[#E5E1E4]">
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Ort. Kilo</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center">
                                    {w.avg_weight ? `${w.avg_weight.toFixed(1)} kg` : '—'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Ort. Bel</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center">
                                    {w.avg_waist ? `${w.avg_waist.toFixed(1)} cm` : '—'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Antrenman</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center">
                                    {w.workouts_completed} / {w.workouts_target} G
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Bench / Squat / DL</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center">
                                    {w.bench_max || '—'} / {w.squat_max || '—'} / {w.deadlift_max || '—'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Uyku / Adım</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center text-[10px]">
                                    {w.avg_sleep ? `${w.avg_sleep.toFixed(1)}s` : '—'} / {w.avg_steps ? Math.round(w.avg_steps).toLocaleString('tr-TR') : '—'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-[#C4C9AC] font-medium">Diyet / Enerji</td>
                                {stats.weeklyBreakdown.map((w, idx) => (
                                  <td key={idx} className="py-2 px-3 text-center text-[10px]">
                                    {w.avg_diet ? `${w.avg_diet.toFixed(1)}/10` : '—'} / {w.avg_energy ? `${w.avg_energy.toFixed(1)}/10` : '—'}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Haftalık Fotoğraflar Önizlemesi */}
                      <div className="border-t border-[#27272A] pt-4 space-y-2">
                        <h4 className="text-xs font-bold text-[#ABD600] uppercase tracking-wider">Haftalık Progress Fotoğrafları</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {stats.weeklyBreakdown.map((w, idx) => (
                            <div key={idx} className="text-center space-y-1">
                              <span className="text-[10px] text-[#C4C9AC] block">{idx + 1}. Hafta</span>
                              {w.photo_url ? (
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-[#27272A] bg-black/20">
                                  <Image
                                    src={w.photo_url}
                                    alt={`${idx + 1}. Hafta Foto`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="aspect-[4/3] w-full rounded border border-dashed border-[#27272A] bg-[#18181B] flex items-center justify-center text-[9px] text-[#C4C9AC]/40">
                                  Yok
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Coach comment */}
              <div>
                <Label className="text-[#C4C9AC]">Koç Değerlendirmesi & Notları</Label>
                <Textarea
                  value={coachComment}
                  onChange={(e) => setCoachComment(e.target.value)}
                  placeholder="Bu ayki gelişim hakkında yorumlarınız, antrenman ve beslenme tavsiyeleriniz..."
                  className="coach-input mt-1.5 min-h-[120px]"
                />
              </div>

              {/* Publish state */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-[#C3F400] h-4 w-4 rounded border-[#444933] bg-[#18181B]"
                />
                <Label htmlFor="isPublished" className="text-[#E5E1E4] cursor-pointer">
                  Direkt Öğrenciye Yayınla (Görünür Kıl)
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#27272A] mt-6">
              <Button variant="ghost" onClick={() => { setWizardOpen(false); setSelectedMonth(''); setCoachComment(''); }} className="text-[#C4C9AC] hover:bg-[#2A2A2C]">İptal</Button>
              <Button
                onClick={handleCreateReport}
                disabled={generatingPdf || !selectedMonth}
                className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]"
              >
                {generatingPdf ? 'PDF Hazırlanıyor...' : 'Kaydet ve PDF Üret'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PDF REPORT TEMPLATE FOR HTML2CANVAS */}
      {/* 
        This is a hidden element that will be made display:block temporarily by Javascript, 
        converted to a high-resolution canvas via html2canvas, and saved as a PDF.
        It uses the Kinetic Performance premium design theme.
      */}
      <div
        ref={pdfTemplateRef}
        id="pdf-report-template"
        className="w-[800px] bg-[#121214] text-[#E5E1E4] p-8 space-y-6 font-sans relative"
        style={{ display: 'none', position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -100 }}
      >
        {/* Neon green top line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ABD600]" />

        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#2C2C2E] pb-4">
          <div>
            <h1 className="text-[#ABD600] text-3xl font-extrabold tracking-wider uppercase">FITCOACH</h1>
            <p className="text-[10px] text-[#C4C9AC] uppercase tracking-widest mt-0.5">Kinetic Performance Coaching Portal</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">AYLIK GELİŞİM RAPORU</h2>
            <p className="text-sm font-semibold text-[#ABD600]">{selectedMonth ? getMonthLabel(`${selectedMonth}-01`) : ''}</p>
          </div>
        </div>

        {/* Profile / Metadata Info */}
        <div className="grid grid-cols-2 gap-4 bg-[#18181B] rounded-xl p-4 border border-[#2C2C2E]">
          <div className="text-sm">
            <span className="text-xs text-[#C4C9AC] block">Öğrenci:</span>
            <span className="font-bold text-white text-base">Sporcu Gelişim Raporu</span>
          </div>
          <div className="text-sm text-right">
            <span className="text-xs text-[#C4C9AC] block">Rapor Tarihi:</span>
            <span className="font-semibold text-white">{formatDate(new Date().toISOString())}</span>
          </div>
        </div>

        {/* Weekly Comparison Table */}
        {stats && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#ABD600] uppercase tracking-widest border-l-2 border-[#ABD600] pl-2">Haftalık İlerleme & Karşılaştırma Analizi</h3>
            
            <div className="overflow-hidden rounded-xl border border-[#2C2C2E] bg-[#18181B]/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#19191B] text-[#ABD600] uppercase tracking-wider text-[10px] border-b border-[#2C2C2E]">
                    <th className="py-2.5 px-4 font-bold border-r border-[#2C2C2E]">METRİK</th>
                    <th className="py-2.5 px-3 font-bold border-r border-[#2C2C2E] text-center">1. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-[#2C2C2E] text-center">2. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-[#2C2C2E] text-center">3. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold border-r border-[#2C2C2E] text-center">4. HAFTA</th>
                    <th className="py-2.5 px-3 font-bold text-center bg-[#ABD600]/10 text-white">AYLIK NET FARK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2C2E] text-[#E5E1E4]">
                  {/* Kilo */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Ortalama Kilo</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_weight, prev.avg_weight, true) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold">{w.avg_weight ? `${w.avg_weight.toFixed(1)} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_weight || stats.weeklyBreakdown[2]?.avg_weight || stats.weeklyBreakdown[1]?.avg_weight,
                        stats.weeklyBreakdown[0]?.avg_weight || stats.weeklyBreakdown[1]?.avg_weight,
                        true
                      )} kg
                    </td>
                  </tr>

                  {/* Bel */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Ortalama Bel Ölçüsü</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_waist, prev.avg_waist, true) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold">{w.avg_waist ? `${w.avg_waist.toFixed(1)} cm` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_waist || stats.weeklyBreakdown[2]?.avg_waist || stats.weeklyBreakdown[1]?.avg_waist,
                        stats.weeklyBreakdown[0]?.avg_waist || stats.weeklyBreakdown[1]?.avg_waist,
                        true
                      )} cm
                    </td>
                  </tr>

                  {/* Bench Press */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Bench Press Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.bench_max, prev.bench_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold text-[#ABD600]">{w.bench_max ? `${w.bench_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5 text-[#ABD600]">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.bench_max || stats.weeklyBreakdown[2]?.bench_max || stats.weeklyBreakdown[1]?.bench_max,
                        stats.weeklyBreakdown[0]?.bench_max || stats.weeklyBreakdown[1]?.bench_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Squat */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Squat Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.squat_max, prev.squat_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold text-[#ABD600]">{w.squat_max ? `${w.squat_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5 text-[#ABD600]">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.squat_max || stats.weeklyBreakdown[2]?.squat_max || stats.weeklyBreakdown[1]?.squat_max,
                        stats.weeklyBreakdown[0]?.squat_max || stats.weeklyBreakdown[1]?.squat_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Deadlift */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Deadlift Max</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.deadlift_max, prev.deadlift_max, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold text-[#ABD600]">{w.deadlift_max ? `${w.deadlift_max} kg` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5 text-[#ABD600]">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.deadlift_max || stats.weeklyBreakdown[2]?.deadlift_max || stats.weeklyBreakdown[1]?.deadlift_max,
                        stats.weeklyBreakdown[0]?.deadlift_max || stats.weeklyBreakdown[1]?.deadlift_max,
                        false
                      )} kg
                    </td>
                  </tr>

                  {/* Antrenman */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Antrenman Uyum Oranı</td>
                    {stats.weeklyBreakdown.map((w, idx) => (
                      <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                        <span className="font-semibold">{w.workouts_completed} / {w.workouts_target} G</span>
                      </td>
                    ))}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5 text-white">
                      {stats.workoutsCompleted} / {stats.workoutsTarget} G
                    </td>
                  </tr>

                  {/* Uyku */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Ortalama Uyku</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_sleep, prev.avg_sleep, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold">{w.avg_sleep ? `${w.avg_sleep.toFixed(1)} sa` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_sleep || stats.weeklyBreakdown[2]?.avg_sleep || stats.weeklyBreakdown[1]?.avg_sleep,
                        stats.weeklyBreakdown[0]?.avg_sleep || stats.weeklyBreakdown[1]?.avg_sleep,
                        false
                      )} sa
                    </td>
                  </tr>

                  {/* Adım */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Günlük Ortalama Adım</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_steps, prev.avg_steps, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold">{w.avg_steps ? Math.round(w.avg_steps).toLocaleString('tr-TR') : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{Math.round(trend.diff).toLocaleString('tr-TR')})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_steps || stats.weeklyBreakdown[2]?.avg_steps || stats.weeklyBreakdown[1]?.avg_steps,
                        stats.weeklyBreakdown[0]?.avg_steps || stats.weeklyBreakdown[1]?.avg_steps,
                        false
                      )}
                    </td>
                  </tr>

                  {/* Diyet */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Beslenme / Diyet Uyumu</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_diet, prev.avg_diet, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold text-[#ABD600]">{w.avg_diet ? `${w.avg_diet.toFixed(1)}/10` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5 text-[#ABD600]">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_diet || stats.weeklyBreakdown[2]?.avg_diet || stats.weeklyBreakdown[1]?.avg_diet,
                        stats.weeklyBreakdown[0]?.avg_diet || stats.weeklyBreakdown[1]?.avg_diet,
                        false
                      )}
                    </td>
                  </tr>

                  {/* Enerji */}
                  <tr>
                    <td className="py-2 px-4 font-medium border-r border-[#2C2C2E] text-[#C4C9AC]">Genel Enerji Seviyesi</td>
                    {stats.weeklyBreakdown.map((w, idx) => {
                      const prev = idx > 0 ? stats.weeklyBreakdown[idx - 1] : null
                      const trend = prev ? getWeeklyDiff(w.avg_energy, prev.avg_energy, false) : null
                      return (
                        <td key={idx} className="py-2 px-3 border-r border-[#2C2C2E] text-center">
                          <span className="font-semibold">{w.avg_energy ? `${w.avg_energy.toFixed(1)}/10` : '—'}</span>
                          {trend && (
                            <span style={{ color: trend.color }} className="text-[9px] font-bold ml-1">
                              ({trend.sign}{trend.diff.toFixed(1)})
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2 px-3 text-center font-bold bg-[#ABD600]/5">
                      {getNetDiff(
                        stats.weeklyBreakdown[3]?.avg_energy || stats.weeklyBreakdown[2]?.avg_energy || stats.weeklyBreakdown[1]?.avg_energy,
                        stats.weeklyBreakdown[0]?.avg_energy || stats.weeklyBreakdown[1]?.avg_energy,
                        false
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coach Assessment Comment Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#ABD600] uppercase tracking-widest border-l-2 border-[#ABD600] pl-2">Koçun Değerlendirmesi & Tavsiyeleri</h3>
          <div className="bg-[#18181B] rounded-xl p-5 border border-[#2C2C2E] min-h-[140px] text-sm leading-relaxed text-[#E5E1E4] whitespace-pre-wrap">
            {coachComment || 'Bu ay için koç yorumu eklenmemiştir.'}
          </div>
        </div>

        {/* Weekly Progress Photos Grid */}
        {stats && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#ABD600] uppercase tracking-widest border-l-2 border-[#ABD600] pl-2">Haftalık Gelişim Fotoğrafları</h3>
            <div className="grid grid-cols-4 gap-4">
              {stats.weeklyBreakdown.map((w, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-[#2C2C2E] bg-[#18181B] flex flex-col justify-between h-[180px]">
                  <div className="relative flex-1 bg-black/40 flex items-center justify-center overflow-hidden">
                    {w.photo_url ? (
                      <img
                        src={w.photo_url}
                        alt={`${idx + 1}. Hafta Foto`}
                        className="aspect-[4/3] w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-[10px] text-[#C4C9AC]/30 block uppercase tracking-wider font-bold">Fotoğraf</span>
                        <span className="text-[8px] text-[#C4C9AC]/20 block uppercase tracking-wider mt-0.5">Yüklenmedi</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center text-[10px] text-[#C4C9AC] font-bold border-t border-[#2C2C2E] uppercase tracking-wider bg-[#19191B]">
                    {idx + 1}. HAFTA
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#2C2C2E] pt-6 flex justify-between items-center text-[10px] text-[#C4C9AC]">
          <span>© {new Date().getFullYear()} FITCOACH. Tüm Hakları Saklıdır.</span>
          <span className="font-semibold text-[#ABD600] uppercase tracking-widest">KINETIC PERFORMANCE SYSTEM</span>
        </div>
      </div>
    </div>
  )
}
