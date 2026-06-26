import { useState } from 'react'
import type { ProgressEntry } from '@/types'
import { formatDate } from '@/lib/coach/format'
import { Calendar, X } from 'lucide-react'

type ProgressEntryListProps = {
  entries: ProgressEntry[]
}

export function ProgressEntryList({ entries }: ProgressEntryListProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#444933]/30 p-8 text-center text-sm text-[#C4C9AC] bg-black/10">
        Henüz girilmiş bir ilerleme kaydı bulunmuyor.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((entry) => (
        <ProgressEntryCard key={entry.id} entry={entry} onPhotoClick={setLightboxUrl} />
      ))}

      {/* Lightbox Modal */}
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
          <div className="max-w-[90vw] max-h-[85vh] text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="İlerleme Fotoğrafı"
              className="max-h-[80vh] mx-auto rounded-lg object-contain shadow-2xl border border-[#27272A]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressEntryCard({
  entry,
  onPhotoClick,
}: {
  entry: ProgressEntry
  onPhotoClick?: (url: string) => void
}) {
  const m = entry.custom_metrics || {}

  // Helper to safely parse unknown values to string
  const getMetricString = (val: unknown): string | null => {
    if (val === undefined || val === null) return null
    const str = String(val).trim()
    return str.length > 0 ? str : null
  }

  // Parse metrics
  const waist = getMetricString(m.waist_cm ?? m.waist)
  const chest = getMetricString(m.chest_cm ?? m.chest)
  const rightArm = getMetricString(m.right_upper_arm_cm ?? m.right_arm)
  const leftArm = getMetricString(m.left_upper_arm_cm ?? m.left_arm)
  const rightThigh = getMetricString(m.right_thigh_cm ?? m.right_thigh)
  const leftThigh = getMetricString(m.left_thigh_cm ?? m.left_thigh)
  const bodyFat = getMetricString(m.body_fat_percentage ?? m.body_fat)

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
    <div className="bg-[#18181B]/50 border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#ABD600]/30">
      
      {/* Left section: Date & Weight */}
      <div className="flex items-center gap-4 shrink-0 md:w-44">
        <div className="p-2.5 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] text-[#C4C9AC] block font-semibold uppercase tracking-wider">
            {formatDate(entry.date)}
          </span>
          <span className="text-base font-extrabold text-[#E5E1E4]">
            {entry.weight !== null ? `${Number(entry.weight).toFixed(1)} kg` : '—'}
          </span>
        </div>
      </div>

      {/* Middle section: Note & Metrics list */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Notes (compact design) */}
        {entry.note && (
          <p className="text-xs text-[#C4C9AC] italic leading-relaxed line-clamp-2 border-l border-[#ABD600]/50 pl-2">
            &ldquo;{entry.note}&rdquo;
          </p>
        )}

        {/* Clean, minimalist inline metric tags */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Body measurements */}
          {waist && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
              Bel: {waist} cm
            </span>
          )}
          {chest && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
              Göğüs: {chest} cm
            </span>
          )}
          {(rightArm || leftArm) && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
              Kol: {rightArm ?? '—'}/{leftArm ?? '—'} cm
            </span>
          )}
          {(rightThigh || leftThigh) && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
              Uyluk: {rightThigh ?? '—'}/{leftThigh ?? '—'} cm
            </span>
          )}
          {bodyFat && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#00eefc]/25 text-[#00eefc] bg-[#00eefc]/5">
              Yağ %: {bodyFat}%
            </span>
          )}

          {/* Lifts */}
          {bench && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/25 text-yellow-400 bg-yellow-500/5">
              Bench: {bench} kg
            </span>
          )}
          {squat && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/25 text-yellow-400 bg-yellow-500/5">
              Squat: {squat} kg
            </span>
          )}
          {deadlift && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/25 text-yellow-400 bg-yellow-500/5">
              DL: {deadlift} kg
            </span>
          )}

          {/* Lifestyle */}
          {sleep && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
              Uyku: {sleep} sa
            </span>
          )}
          {steps && !isNaN(Number(steps)) && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
              Adım: {Math.round(Number(steps)).toLocaleString('tr-TR')}
            </span>
          )}
          {diet && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
              Diyet: {diet}/10
            </span>
          )}
          {energy && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
              Enerji: {energy}/10
            </span>
          )}
          {workoutsCompleted && workoutsTarget && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-pink-500/25 text-pink-400 bg-pink-500/5">
              Antrenman: {workoutsCompleted}/{workoutsTarget} gün
            </span>
          )}
        </div>
      </div>

      {/* Right section: Compact photo thumbnails */}
      {(entry.before_photo_url || entry.after_photo_url) && (
        <div className="flex gap-2 shrink-0">
          {entry.before_photo_url && (
            <ProgressPhotoThumbnail
              url={entry.before_photo_url}
              onClick={() => onPhotoClick?.(entry.before_photo_url!)}
            />
          )}
          {entry.after_photo_url && (
            <ProgressPhotoThumbnail
              url={entry.after_photo_url}
              onClick={() => onPhotoClick?.(entry.after_photo_url!)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ProgressPhotoThumbnail({ url, onClick }: { url: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative group w-20 h-24 rounded-lg overflow-hidden border border-[#27272A] bg-black/20 shrink-0 cursor-pointer"
    >
      <img
        src={url}
        alt="İlerleme Kaydı Fotoğrafı"
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
        crossOrigin="anonymous"
      />
    </div>
  )
}

