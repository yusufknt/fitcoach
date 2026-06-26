'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus } from 'lucide-react'
import { createProgressEntryFromForm } from '@/lib/coach/progress-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-provider'

const progressSchema = z.object({
  date: z.string().min(1, 'Tarih gerekli'),
  weight: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || value.trim() === '' || !Number.isNaN(Number(value)),
      'Geçerli bir kilo değeri girin'
    ),
  note: z.string().optional(),
  customMetricsJson: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === '') return true
      try {
        const parsed: unknown = JSON.parse(value)
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      } catch {
        return false
      }
    }, 'Geçerli bir JSON nesnesi girin (ör. {"bel": 80})'),
})

type ProgressFormValues = z.infer<typeof progressSchema>

type ProgressFormProps = {
  coachStudentId: string
  studentId: string
}

export function ProgressForm({ coachStudentId, studentId }: ProgressFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      weight: '',
      note: '',
      customMetricsJson: '',
    },
  })

  async function onSubmit(values: ProgressFormValues) {
    setSubmitError(null)

    const formData = new FormData()
    formData.append('coachStudentId', coachStudentId)
    formData.append('studentId', studentId)
    formData.append('date', values.date)
    formData.append('weight', values.weight?.trim() ?? '')
    formData.append('note', values.note?.trim() ?? '')
    formData.append('customMetricsJson', values.customMetricsJson?.trim() ?? '')
    if (beforePhoto) {
      formData.append('beforePhoto', beforePhoto)
    }
    if (afterPhoto) {
      formData.append('afterPhoto', afterPhoto)
    }

    const result = await createProgressEntryFromForm(formData)

    if (!result.success) {
      setSubmitError(result.error)
      return
    }

    reset({
      date: new Date().toISOString().slice(0, 10),
      weight: '',
      note: '',
      customMetricsJson: '',
    })
    setBeforePhoto(null)
    setAfterPhoto(null)
    showToast('success', 'İlerleme kaydı eklendi.')
    router.refresh()
  }

  return (
    <Card className="coach-card">
      <CardHeader>
        <CardTitle className="text-base text-[#E5E1E4]">Yeni İlerleme Kaydı</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Kilo (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="ör. 75.5"
                {...register('weight')}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">
                  {errors.weight.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Not</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Günlük not..."
              {...register('note')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMetricsJson">Özel metrikler (JSON)</Label>
            <Textarea
              id="customMetricsJson"
              rows={3}
              placeholder='{"bel": 80, "gogus": 100}'
              className="font-mono text-xs"
              {...register('customMetricsJson')}
            />
            {errors.customMetricsJson && (
              <p className="text-sm text-destructive">
                {errors.customMetricsJson.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PhotoInput
              id="beforePhoto"
              label="Before fotoğrafı"
              file={beforePhoto}
              onChange={setBeforePhoto}
            />
            <PhotoInput
              id="afterPhoto"
              label="After fotoğrafı"
              file={afterPhoto}
              onChange={setAfterPhoto}
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

type PhotoInputProps = {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
}

function PhotoInput({ id, label, file, onChange }: PhotoInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <label
        htmlFor={id}
        className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#444933] bg-[#0E0E10]/70 px-4 py-5 text-center transition hover:border-[#ABD600]/60 hover:bg-[#ABD600]/5"
      >
        <ImagePlus className="mb-2 h-5 w-5 text-[#ABD600]" />
        <span className="max-w-full truncate text-sm text-[#E5E1E4]">
          {file ? file.name : 'Fotoğraf seç'}
        </span>
        <span className="mt-1 text-xs text-[#C4C9AC]">JPG, PNG veya WEBP</span>
      </label>
      <Input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  )
}
