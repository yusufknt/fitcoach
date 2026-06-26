'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Flame, Calendar, FileText, MessageSquare, ArrowRight, Video, Check, Scale, User } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/coach/format'
import { quickWeightEntry } from '@/lib/student/progress.client'
import type { StudentDashboardData } from '@/lib/student/types'
import type { StudentProfile } from '@/types'

type StudentDashboardClientProps = {
  data: StudentDashboardData
  studentId: string
  profile: StudentProfile | null
}

const experienceMap: Record<string, string> = {
  beginner: 'Yeni Başlayan',
  '1-3years': '1-3 Yıl',
  '3plus': '3+ Yıl',
}

const goalMap: Record<string, string> = {
  muscle_gain: 'Kas Kazanımı',
  fat_loss: 'Yağ Yakımı',
  recomposition: 'Rekomposizyon',
  strength: 'Güç',
}

function calculateAge(birthDate: string | null): number | string {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}


export function StudentDashboardClient({ data, studentId, profile }: StudentDashboardClientProps) {
  const [weight, setWeight] = useState('')
  const [weightSaved, setWeightSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleQuickWeight = async () => {
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return
    setSaving(true)
    const result = await quickWeightEntry(studentId, data.coachId, w)
    if (result) {
      setWeightSaved(true)
      setWeight('')
      setTimeout(() => setWeightSaved(false), 3000)
    }
    setSaving(false)
  }

  const progressPercent = data.totalDays && data.daysRemaining != null
    ? Math.round(((data.totalDays - data.daysRemaining) / data.totalDays) * 100)
    : null

  return (
    <div className="space-y-6">
      {/* Unread message banner */}
      {data.unreadMessageCount > 0 && (
        <Link href="/student/mesajlar">
          <div className="flex items-center justify-between rounded-xl border border-[#ABD600]/25 bg-[#ABD600]/10 px-5 py-3 transition-all hover:bg-[#ABD600]/15">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[#ABD600]" />
              <span className="text-sm font-medium text-[#E5E1E4]">
                Koçunuzdan {data.unreadMessageCount} yeni mesaj var
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#ABD600]" />
          </div>
        </Link>
      )}

      {/* Welcome + Coach Card */}
      <Card className="coach-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-[#444933]">
              {data.coachAvatarUrl && <AvatarImage src={data.coachAvatarUrl} />}
              <AvatarFallback className="bg-[#353437] text-xl text-[#E5E1E4]">
                {data.coachName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-[#C4C9AC]">Koçun</p>
              <p className="text-lg font-bold text-[#E5E1E4]">{data.coachName}</p>
              {data.packageName && (
                <p className="mt-0.5 text-sm text-[#ABD600]">{data.packageName}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {progressPercent != null && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#C4C9AC]">
                <span>Paket süresi</span>
                <span>{data.daysRemaining} gün kaldı</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#353437]">
                <div
                  className="h-2 rounded-full bg-[#ABD600] transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Profile Card */}
      {profile && (
        <Card className="coach-card overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#C4C9AC]">
              <User className="h-4 w-4 text-[#ABD600]" />
              Başlangıç Fiziksel Profilim
            </CardTitle>
            <Link
              href="/student/profil"
              className="text-xs text-[#ABD600] hover:underline flex items-center gap-1"
            >
              Tüm Profilim
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all">
                <p className="text-xs text-[#C4C9AC]">Boy</p>
                <p className="mt-1 text-lg font-bold text-[#E5E1E4]">
                  {profile.height_cm ? `${profile.height_cm} cm` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all">
                <p className="text-xs text-[#C4C9AC]">Başlangıç Kilo</p>
                <p className="mt-1 text-lg font-bold text-[#E5E1E4]">
                  {profile.initial_weight ? `${profile.initial_weight} kg` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all">
                <p className="text-xs text-[#C4C9AC]">Yaş</p>
                <p className="mt-1 text-lg font-bold text-[#E5E1E4]">
                  {calculateAge(profile.birth_date)}
                </p>
              </div>
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all">
                <p className="text-xs text-[#C4C9AC]">Yağ Oranı</p>
                <p className="mt-1 text-lg font-bold text-[#E5E1E4]">
                  {profile.body_fat_percentage ? `%${profile.body_fat_percentage}` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all col-span-1">
                <p className="text-xs text-[#C4C9AC]">Hedef</p>
                <p className="mt-1 text-sm font-bold text-[#ABD600] truncate">
                  {goalMap[profile.goal || ''] || profile.goal || '-'}
                </p>
              </div>
              <div className="rounded-lg bg-[#1E1E20] p-3 text-center border border-[#2A2A2C] hover:border-[#ABD600]/30 transition-all col-span-1">
                <p className="text-xs text-[#C4C9AC]">Deneyim</p>
                <p className="mt-1 text-sm font-bold text-[#E5E1E4] truncate">
                  {experienceMap[profile.experience || ''] || profile.experience || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Streak + Quick Weight */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Streak */}
        <Card className="coach-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C3F400]/15">
              <Flame className="h-6 w-6 text-[#ABD600]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#E5E1E4]">{data.streak}</p>
              <p className="text-sm text-[#C4C9AC]">
                {data.streak > 0 ? 'Gün serisi! Devam et' : 'Bugün kayıt ekle!'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick weight */}
        <Card className="coach-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-[#C4C9AC]" />
              <p className="text-sm font-medium text-[#C4C9AC]">Hızlı Kilo Girişi</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Ör: 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="coach-input"
                disabled={weightSaved}
              />
              <Button
                onClick={handleQuickWeight}
                disabled={saving || weightSaved || !weight}
                className={weightSaved ? 'bg-emerald-600 text-white' : 'bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]'}
                size="icon"
              >
                {weightSaved ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session + Program */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Upcoming session */}
        <Card className="coach-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#C4C9AC]">
              <Calendar className="h-4 w-4 text-[#ABD600]" />
              Yaklaşan Randevu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSession ? (
              <div>
                <p className="font-medium text-[#E5E1E4]">{data.upcomingSession.title}</p>
                <p className="mt-1 text-sm text-[#C4C9AC]">
                  {formatDateTime(data.upcomingSession.startTime)}
                </p>
                {data.upcomingSession.meetingUrl && (
                  <a
                    href={data.upcomingSession.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#C3F400]/15 px-3 py-1.5 text-xs font-medium text-[#ABD600] transition hover:bg-[#C3F400]/25"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Görüşmeye Katıl
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#C4C9AC]">Yaklaşan randevu yok.</p>
            )}
          </CardContent>
        </Card>

        {/* Latest program */}
        <Card className="coach-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#C4C9AC]">
              <FileText className="h-4 w-4 text-[#ABD600]" />
              Son Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestProgram ? (
              <div>
                <p className="font-medium text-[#E5E1E4]">{data.latestProgram.title}</p>
                <p className="mt-1 text-sm text-[#C4C9AC]">
                  {formatDate(data.latestProgram.createdAt)}
                </p>
                <Link
                  href="/student/programlar"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#2A2A2C] px-3 py-1.5 text-xs font-medium text-[#E5E1E4] transition hover:bg-[#353437]"
                >
                  Görüntüle
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[#C4C9AC]">Henüz program yüklenmedi.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
