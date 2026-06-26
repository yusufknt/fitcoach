'use client'

import { useState, useRef } from 'react'
import { User, Ruler, Heart, Camera, X, Trash2, Loader2 } from 'lucide-react'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'
import { useToast } from '@/components/ui/toast-provider'
import { updateStudentOnboardingPhoto, deleteStudentOnboardingPhoto } from '@/lib/student/onboarding-actions'

type ProfileTabProps = {
  onboarding: StudentOnboardingView | null
  isEditable?: boolean
}

const genderMap: Record<string, string> = {
  male: 'Erkek',
  female: 'Kadın',
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

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatValue(value: string | number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined) return 'Belirtilmedi'
  return `${value}${suffix}`
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#27272A]/40 last:border-0">
      <span className="coach-muted text-xs sm:text-sm">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-[#E5E1E4]">{value}</span>
    </div>
  )
}

function SectionCard({
  icon,
  title,
  children,
  className = '',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`coach-card p-5 border border-[#27272A] hover:border-[#ABD600]/40 transition duration-300 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-[#E5E1E4] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function ProfileTab({ onboarding, isEditable = false }: ProfileTabProps) {
  const { showToast } = useToast()

  const [frontPhoto, setFrontPhoto] = useState<string | null>(onboarding?.photoUrls.frontUrl || null)
  const [sidePhoto, setSidePhoto] = useState<string | null>(onboarding?.photoUrls.sideUrl || null)
  const [backPhoto, setBackPhoto] = useState<string | null>(onboarding?.photoUrls.backUrl || null)

  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingSide, setUploadingSide] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)

  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; label: string } | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const sideInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  if (!onboarding) {
    return (
      <p className="rounded-2xl border border-dashed border-[#444933] bg-[#18181B]/60 p-8 text-center text-sm text-[#C4C9AC]">
        Öğrenci henüz profil bilgilerini tamamlamamış.
      </p>
    )
  }

  const { profile } = onboarding

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = kind === 'front' ? setUploadingFront : kind === 'side' ? setUploadingSide : setUploadingBack
    const setPhoto = kind === 'front' ? setFrontPhoto : kind === 'side' ? setSidePhoto : setBackPhoto
    const label = kind === 'front' ? 'Ön' : kind === 'side' ? 'Yan' : 'Arka'

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const result = await updateStudentOnboardingPhoto(formData, kind)
      if (result.success && result.photoUrl) {
        setPhoto(result.photoUrl)
        showToast('success', `${label} fotoğrafı başarıyla güncellendi.`)
      } else {
        showToast('error', result.error ?? 'Fotoğraf güncellenemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Bir hata oluştu.')
    } finally {
      setUploading(false)
      // Reset input value so change event fires again for the same file if needed
      e.target.value = ''
    }
  }

  const handlePhotoDelete = async (e: React.MouseEvent, kind: 'front' | 'side' | 'back') => {
    e.stopPropagation()
    const label = kind === 'front' ? 'Ön' : kind === 'side' ? 'Yan' : 'Arka'
    if (!confirm(`${label} fotoğrafını silmek istediğinize emin misiniz?`)) {
      return
    }

    const setUploading = kind === 'front' ? setUploadingFront : kind === 'side' ? setUploadingSide : setUploadingBack
    const setPhoto = kind === 'front' ? setFrontPhoto : kind === 'side' ? setSidePhoto : setBackPhoto

    setUploading(true)
    try {
      const result = await deleteStudentOnboardingPhoto(kind)
      if (result.success) {
        setPhoto(null)
        showToast('success', `${label} fotoğrafı başarıyla silindi.`)
      } else {
        showToast('error', result.error ?? 'Fotoğraf silinemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Fotoğraf silinirken hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  const renderPhotoSlot = (
    kind: 'front' | 'side' | 'back',
    label: string,
    photoUrl: string | null,
    uploading: boolean,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    if (!isEditable && !photoUrl) return null

    return (
      <div className="space-y-1.5 flex flex-col">
        <p className="coach-muted text-center text-xs font-semibold">{label}</p>
        <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0E0E10] aspect-[3/4] group flex-1">
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <Loader2 className="h-6 w-6 text-[#ABD600] animate-spin" />
            </div>
          ) : photoUrl ? (
            <>
              {isEditable && (
                <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      inputRef.current?.click()
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#09090B]/85 text-[#C4C9AC] hover:text-[#ABD600] hover:scale-105 transition"
                    title={`${label} Fotoğrafını Değiştir`}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePhotoDelete(e, kind)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#09090B]/85 text-[#C4C9AC] hover:text-red-400 hover:scale-105 transition"
                    title={`${label} Fotoğrafını Sil`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => setLightboxPhoto({ url: photoUrl, label: `Başlangıç ${label} Fotoğrafı` })}
              >
                <img
                  src={photoUrl}
                  alt={`${label} fotoğrafı`}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                />
              </div>
            </>
          ) : isEditable ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-[#444933] bg-[#0E0E10]/50 transition duration-200 hover:border-[#ABD600]/50 hover:bg-[#ABD600]/5"
            >
              <Camera className="h-6 w-6 text-[#C4C9AC]/60 animate-pulse" />
              <span className="text-[10px] text-[#C4C9AC]/60 font-semibold uppercase">Fotoğraf Yükle</span>
            </button>
          ) : (
            <div className="flex w-full h-full items-center justify-center bg-[#0E0E10]">
              <span className="text-xs text-[#C4C9AC]/40">Yüklenmemiş</span>
            </div>
          )}
          {isEditable && (
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e, kind)}
            />
          )}
        </div>
      </div>
    )
  }

  const hasAnyPhoto = frontPhoto || sidePhoto || backPhoto
  const showGrid = isEditable || hasAnyPhoto

  return (
    <div className="space-y-6">
      {/* 2-Column Grid for main data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Personal Info & Health */}
        <div className="space-y-6">
          <SectionCard
            icon={<User className="h-4 w-4" />}
            title="Kişisel Bilgiler"
          >
            <div className="divide-y divide-[#27272A]/40">
              <InfoRow
                label="Boy"
                value={formatValue(profile.height_cm, ' cm')}
              />
              <InfoRow
                label="Yaş"
                value={
                  profile.birth_date
                    ? `${calculateAge(profile.birth_date)} Yaş (${new Date(profile.birth_date).toLocaleDateString('tr-TR')})`
                    : 'Belirtilmedi'
                }
              />
              <InfoRow
                label="Cinsiyet"
                value={profile.gender ? (genderMap[profile.gender] ?? 'Belirtilmedi') : 'Belirtilmedi'}
              />
              <InfoRow
                label="Deneyim Seviyesi"
                value={
                  profile.experience
                    ? (experienceMap[profile.experience] ?? 'Belirtilmedi')
                    : 'Belirtilmedi'
                }
              />
              <InfoRow
                label="Hedef"
                value={profile.goal ? (goalMap[profile.goal] ?? 'Belirtilmedi') : 'Belirtilmedi'}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Heart className="h-4 w-4" />}
            title="Sağlık ve Supplement Kullanımı"
          >
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[#C4C9AC] block font-semibold mb-1">Sakatlık veya Kısıtlamalar</span>
                <p className="text-xs text-[#E5E1E4] bg-[#131315]/50 border border-[#27272A] rounded-lg p-3 min-h-[50px] leading-relaxed">
                  {profile.injuries ?? 'Herhangi bir sakatlık belirtilmedi.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#C4C9AC] block font-semibold mb-1">Kullanılan Supplementler</span>
                <p className="text-xs text-[#E5E1E4] bg-[#131315]/50 border border-[#27272A] rounded-lg p-3 min-h-[50px] leading-relaxed">
                  {profile.supplements ?? 'Kullanılan supplement belirtilmedi.'}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Measurements */}
        <SectionCard
          icon={<Ruler className="h-4 w-4" />}
          title="Başlangıç Fiziksel Ölçüleri"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoRow label="Kilo" value={formatValue(profile.initial_weight, ' kg')} />
            <InfoRow label="Bel Çevresi" value={formatValue(profile.waist_cm, ' cm')} />
            <InfoRow label="Göğüs Çevresi" value={formatValue(profile.chest_cm, ' cm')} />
            <InfoRow label="Kalça Çevresi" value={formatValue(profile.hip_cm, ' cm')} />
            <InfoRow label="Boyun Çevresi" value={formatValue(profile.neck_cm, ' cm')} />
            <InfoRow label="Vücut Yağ Oranı" value={formatValue(profile.body_fat_percentage, ' %')} />
            <InfoRow label="Sağ Üst Kol" value={formatValue(profile.right_upper_arm_cm, ' cm')} />
            <InfoRow label="Sol Üst Kol" value={formatValue(profile.left_upper_arm_cm, ' cm')} />
            <InfoRow label="Sağ Uyluk" value={formatValue(profile.right_thigh_cm, ' cm')} />
            <InfoRow label="Sol Uyluk" value={formatValue(profile.left_thigh_cm, ' cm')} />
            <InfoRow label="Sağ Baldır" value={formatValue(profile.right_calf_cm, ' cm')} />
            <InfoRow label="Sol Baldır" value={formatValue(profile.left_calf_cm, ' cm')} />
          </div>
        </SectionCard>
      </div>

      {/* Onboarding / Start Photos */}
      <SectionCard
        icon={<Camera className="h-4 w-4" />}
        title="Başlangıç Fotoğrafları"
      >
        {showGrid ? (
          <div className="grid grid-cols-3 gap-4">
            {renderPhotoSlot('front', 'Ön', frontPhoto, uploadingFront, frontInputRef)}
            {renderPhotoSlot('side', 'Yan', sidePhoto, uploadingSide, sideInputRef)}
            {renderPhotoSlot('back', 'Arka', backPhoto, uploadingBack, backInputRef)}
          </div>
        ) : (
          <p className="coach-muted text-xs">Başlangıç fotoğrafı yüklenmemiş.</p>
        )}
      </SectionCard>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-[90vw] max-h-[85vh] text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.label}
              className="max-h-[80vh] mx-auto rounded-lg object-contain shadow-2xl border border-[#27272A]"
            />
            <p className="mt-4 text-sm font-semibold text-[#E5E1E4] tracking-wide">{lightboxPhoto.label}</p>
          </div>
        </div>
      )}
    </div>
  )
}

