'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitOnboarding } from '@/lib/student/onboarding-actions'
import { User, Ruler, Heart, ChevronRight, ChevronLeft, Loader2, Camera, X } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Kişisel Bilgiler', icon: User },
  { id: 2, title: 'Başlangıç Ölçüleri', icon: Ruler },
  { id: 3, title: 'Sağlık & Fotoğraflar', icon: Heart },
] as const

type PhotoPreview = {
  file: File
  url: string
}

export function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Personal info
  const [heightCm, setHeightCm] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [experience, setExperience] = useState('')
  const [goal, setGoal] = useState('')

  // Step 2: Measurements
  const [initialWeight, setInitialWeight] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [waistCm, setWaistCm] = useState('')
  const [hipCm, setHipCm] = useState('')
  const [neckCm, setNeckCm] = useState('')
  const [rightUpperArmCm, setRightUpperArmCm] = useState('')
  const [leftUpperArmCm, setLeftUpperArmCm] = useState('')
  const [rightThighCm, setRightThighCm] = useState('')
  const [leftThighCm, setLeftThighCm] = useState('')
  const [rightCalfCm, setRightCalfCm] = useState('')
  const [leftCalfCm, setLeftCalfCm] = useState('')
  const [bodyFatPercentage, setBodyFatPercentage] = useState('')

  // Step 3: Health & Photos
  const [injuries, setInjuries] = useState('')
  const [supplements, setSupplements] = useState('')
  const [photoFront, setPhotoFront] = useState<PhotoPreview | null>(null)
  const [photoSide, setPhotoSide] = useState<PhotoPreview | null>(null)
  const [photoBack, setPhotoBack] = useState<PhotoPreview | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const sideInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  function validateStep1(): boolean {
    if (!heightCm || !birthDate || !gender || !experience || !goal) {
      setError('Lütfen tüm zorunlu alanları doldurun.')
      return false
    }
    const h = parseFloat(heightCm)
    if (Number.isNaN(h) || h < 100 || h > 250) {
      setError('Boy değeri 100-250 cm arasında olmalıdır.')
      return false
    }
    return true
  }

  function validateStep2(): boolean {
    if (!initialWeight) {
      setError('Kilo alanı zorunludur.')
      return false
    }
    const w = parseFloat(initialWeight)
    if (Number.isNaN(w) || w < 30 || w > 300) {
      setError('Kilo değeri 30-300 kg arasında olmalıdır.')
      return false
    }
    return true
  }

  function nextStep() {
    setError(null)
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((s) => Math.min(s + 1, 3))
  }

  function prevStep() {
    setError(null)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (p: PhotoPreview | null) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları kabul edilir.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.')
      return
    }
    setter({ file, url: URL.createObjectURL(file) })
  }

  function removePhoto(
    setter: (p: PhotoPreview | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) {
    setter(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit() {
    setError(null)
    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()

    // Step 1
    formData.set('heightCm', heightCm)
    formData.set('birthDate', birthDate)
    formData.set('gender', gender)
    formData.set('experience', experience)
    formData.set('goal', goal)

    // Step 2
    formData.set('initialWeight', initialWeight)
    if (chestCm) formData.set('chestCm', chestCm)
    if (waistCm) formData.set('waistCm', waistCm)
    if (hipCm) formData.set('hipCm', hipCm)
    if (neckCm) formData.set('neckCm', neckCm)
    if (rightUpperArmCm) formData.set('rightUpperArmCm', rightUpperArmCm)
    if (leftUpperArmCm) formData.set('leftUpperArmCm', leftUpperArmCm)
    if (rightThighCm) formData.set('rightThighCm', rightThighCm)
    if (leftThighCm) formData.set('leftThighCm', leftThighCm)
    if (rightCalfCm) formData.set('rightCalfCm', rightCalfCm)
    if (leftCalfCm) formData.set('leftCalfCm', leftCalfCm)
    if (bodyFatPercentage) formData.set('bodyFatPercentage', bodyFatPercentage)

    // Step 3
    if (injuries) formData.set('injuries', injuries)
    if (supplements) formData.set('supplements', supplements)
    if (photoFront) formData.set('photoFront', photoFront.file)
    if (photoSide) formData.set('photoSide', photoSide.file)
    if (photoBack) formData.set('photoBack', photoBack.file)

    const result = await submitOnboarding(formData)

    if (!result.success) {
      setError(result.error ?? 'Bir hata oluştu.')
      setIsSubmitting(false)
      return
    }

    router.push('/student/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-[#E5E1E4]">
          Hoş Geldiniz
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ABD600]">
          Kinetic Performance
        </p>
        <p className="mt-3 text-sm text-[#C4C9AC]">
          Başlamadan önce sizi daha iyi tanımamız gerekiyor.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (step.id < currentStep) {
                  setError(null)
                  setCurrentStep(step.id)
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                ${
                  currentStep === step.id
                    ? 'border-[#ABD600] bg-[#ABD600] text-[#283500] shadow-[0_0_16px_rgba(171,214,0,0.4)]'
                    : currentStep > step.id
                    ? 'border-[#ABD600]/60 bg-[#ABD600]/20 text-[#ABD600]'
                    : 'border-[#444933] bg-[#18181B] text-[#C4C9AC]'
                }
              `}
            >
              <step.icon className="h-4 w-4" />
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 rounded-full transition-all duration-300 sm:w-12 ${
                  currentStep > step.id ? 'bg-[#ABD600]' : 'bg-[#444933]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-[#E5E1E4]">
          {STEPS[currentStep - 1].title}
        </h2>
      </div>

      {/* Form card */}
      <div className="surface-card p-6 sm:p-8">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <FormField label="Boy (cm) *" htmlFor="heightCm">
              <input
                id="heightCm"
                type="number"
                className="input-surface w-full px-4 py-2.5"
                placeholder="175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                min={100}
                max={250}
              />
            </FormField>

            <FormField label="Doğum Tarihi *" htmlFor="birthDate">
              <input
                id="birthDate"
                type="date"
                className="input-surface w-full px-4 py-2.5"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </FormField>

            <FormField label="Cinsiyet *" htmlFor="gender">
              <div className="grid grid-cols-2 gap-3">
                <SelectButton
                  selected={gender === 'male'}
                  onClick={() => setGender('male')}
                  label="Erkek"
                />
                <SelectButton
                  selected={gender === 'female'}
                  onClick={() => setGender('female')}
                  label="Kadın"
                />
              </div>
            </FormField>

            <FormField label="Antrenman Deneyimi *" htmlFor="experience">
              <div className="grid grid-cols-3 gap-3">
                <SelectButton
                  selected={experience === 'beginner'}
                  onClick={() => setExperience('beginner')}
                  label="Yeni Başlayan"
                />
                <SelectButton
                  selected={experience === '1-3years'}
                  onClick={() => setExperience('1-3years')}
                  label="1-3 Yıl"
                />
                <SelectButton
                  selected={experience === '3plus'}
                  onClick={() => setExperience('3plus')}
                  label="3+ Yıl"
                />
              </div>
            </FormField>

            <FormField label="Hedef *" htmlFor="goal">
              <div className="grid grid-cols-2 gap-3">
                <SelectButton
                  selected={goal === 'muscle_gain'}
                  onClick={() => setGoal('muscle_gain')}
                  label="Kas Kazanımı"
                />
                <SelectButton
                  selected={goal === 'fat_loss'}
                  onClick={() => setGoal('fat_loss')}
                  label="Yağ Yakımı"
                />
                <SelectButton
                  selected={goal === 'recomposition'}
                  onClick={() => setGoal('recomposition')}
                  label="Rekomposizyon"
                />
                <SelectButton
                  selected={goal === 'strength'}
                  onClick={() => setGoal('strength')}
                  label="Güç"
                />
              </div>
            </FormField>
          </div>
        )}

        {/* Step 2: Measurements */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <FormField label="Kilo (kg) *" htmlFor="initialWeight">
              <input
                id="initialWeight"
                type="number"
                className="input-surface w-full px-4 py-2.5"
                placeholder="80"
                value={initialWeight}
                onChange={(e) => setInitialWeight(e.target.value)}
                min={30}
                max={300}
                step="0.1"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Göğüs (cm)" htmlFor="chestCm">
                <input
                  id="chestCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="100"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
              <FormField label="Bel (cm)" htmlFor="waistCm">
                <input
                  id="waistCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="85"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Kalça (cm)" htmlFor="hipCm">
                <input
                  id="hipCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="100"
                  value={hipCm}
                  onChange={(e) => setHipCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
              <FormField label="Boyun (cm)" htmlFor="neckCm">
                <input
                  id="neckCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="38"
                  value={neckCm}
                  onChange={(e) => setNeckCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
            </div>

            <p className="text-xs font-medium uppercase tracking-wider text-[#ABD600]">
              Kol Ölçüleri
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sağ Üst Kol (cm)" htmlFor="rightUpperArmCm">
                <input
                  id="rightUpperArmCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="35"
                  value={rightUpperArmCm}
                  onChange={(e) => setRightUpperArmCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
              <FormField label="Sol Üst Kol (cm)" htmlFor="leftUpperArmCm">
                <input
                  id="leftUpperArmCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="34"
                  value={leftUpperArmCm}
                  onChange={(e) => setLeftUpperArmCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
            </div>

            <p className="text-xs font-medium uppercase tracking-wider text-[#ABD600]">
              Bacak Ölçüleri
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sağ Uyluk (cm)" htmlFor="rightThighCm">
                <input
                  id="rightThighCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="58"
                  value={rightThighCm}
                  onChange={(e) => setRightThighCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
              <FormField label="Sol Uyluk (cm)" htmlFor="leftThighCm">
                <input
                  id="leftThighCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="57"
                  value={leftThighCm}
                  onChange={(e) => setLeftThighCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sağ Baldır (cm)" htmlFor="rightCalfCm">
                <input
                  id="rightCalfCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="38"
                  value={rightCalfCm}
                  onChange={(e) => setRightCalfCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
              <FormField label="Sol Baldır (cm)" htmlFor="leftCalfCm">
                <input
                  id="leftCalfCm"
                  type="number"
                  className="input-surface w-full px-4 py-2.5"
                  placeholder="37"
                  value={leftCalfCm}
                  onChange={(e) => setLeftCalfCm(e.target.value)}
                  step="0.1"
                />
              </FormField>
            </div>

            <FormField label="Vücut Yağ Oranı (%)" htmlFor="bodyFatPercentage">
              <input
                id="bodyFatPercentage"
                type="number"
                className="input-surface w-full px-4 py-2.5"
                placeholder="15"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value)}
                min={3}
                max={60}
                step="0.1"
              />
              <p className="mt-1 text-xs text-[#C4C9AC]/70">
                Bilmiyorsanız boş bırakabilirsiniz.
              </p>
            </FormField>
          </div>
        )}

        {/* Step 3: Health & Photos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <FormField label="Sakatlık / Kısıtlama" htmlFor="injuries">
              <textarea
                id="injuries"
                className="input-surface w-full resize-none px-4 py-2.5"
                rows={3}
                placeholder="Varsa sakatlık veya fiziksel kısıtlamalarınızı belirtin..."
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
              />
            </FormField>

            <FormField label="Kullandığınız Supplement'ler" htmlFor="supplements">
              <textarea
                id="supplements"
                className="input-surface w-full resize-none px-4 py-2.5"
                rows={3}
                placeholder="Protein tozu, kreatin, vitamin D vb."
                value={supplements}
                onChange={(e) => setSupplements(e.target.value)}
              />
            </FormField>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#ABD600]">
                Başlangıç Fotoğrafları (opsiyonel)
              </p>
              <p className="mb-4 text-xs text-[#C4C9AC]/70">
                Ön, yan ve arka fotoğraflarınızı yükleyin. İlerlemenizi takip etmek için çok faydalı olacaktır.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PhotoUpload
                  label="Ön"
                  preview={photoFront}
                  inputRef={frontInputRef}
                  onChange={(e) => handlePhotoChange(e, setPhotoFront)}
                  onRemove={() => removePhoto(setPhotoFront, frontInputRef)}
                  inputId="photoFront"
                />
                <PhotoUpload
                  label="Yan"
                  preview={photoSide}
                  inputRef={sideInputRef}
                  onChange={(e) => handlePhotoChange(e, setPhotoSide)}
                  onRemove={() => removePhoto(setPhotoSide, sideInputRef)}
                  inputId="photoSide"
                />
                <PhotoUpload
                  label="Arka"
                  preview={photoBack}
                  inputRef={backInputRef}
                  onChange={(e) => handlePhotoChange(e, setPhotoBack)}
                  onRemove={() => removePhoto(setPhotoBack, backInputRef)}
                  inputId="photoBack"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 rounded-xl border border-[#444933] px-5 py-2.5 text-sm font-medium text-[#C4C9AC] transition-all duration-200 hover:border-[#ABD600]/40 hover:text-[#E5E1E4]"
          >
            <ChevronLeft className="h-4 w-4" />
            Geri
          </button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary-glow flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            İleri
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary-glow flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Tamamla'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// --- Sub-components ---

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#C4C9AC]"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function SelectButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200
        ${
          selected
            ? 'border-[#ABD600] bg-[#ABD600]/15 text-[#ABD600] shadow-[0_0_12px_rgba(171,214,0,0.15)]'
            : 'border-[#444933] bg-[#0E0E10] text-[#C4C9AC] hover:border-[#ABD600]/40 hover:text-[#E5E1E4]'
        }
      `}
    >
      {label}
    </button>
  )
}

function PhotoUpload({
  label,
  preview,
  inputRef,
  onChange,
  onRemove,
  inputId,
}: {
  label: string
  preview: PhotoPreview | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  inputId: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-medium text-[#C4C9AC]">{label}</p>
      {preview ? (
        <div className="group relative">
          <img
            src={preview.url}
            alt={`${label} fotoğrafı`}
            className="h-48 w-full rounded-xl border border-[#444933] object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#09090B]/80 text-[#C4C9AC] opacity-0 transition-all duration-200 hover:text-red-400 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#444933] bg-[#0E0E10]/50 transition-all duration-200 hover:border-[#ABD600]/50 hover:bg-[#ABD600]/5"
        >
          <Camera className="h-6 w-6 text-[#C4C9AC]/60" />
          <span className="text-xs text-[#C4C9AC]/60">Yükle</span>
        </button>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  )
}
