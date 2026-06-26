'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Upload } from 'lucide-react'
import { uploadProgram } from '@/lib/coach/program-actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-provider'
import { cn } from '@/lib/utils'

type ProgramUploadProps = {
  coachStudentId: string
  studentId: string
}

export function ProgramUpload({ coachStudentId, studentId }: ProgramUploadProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return
    if (
      selected.type !== 'application/pdf' &&
      !selected.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Sadece PDF dosyası yükleyebilirsiniz.')
      return
    }
    setError(null)
    setFile(selected)
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ''))
    }
  }, [title])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file || !title.trim()) {
      setError('Başlık ve PDF dosyası zorunludur.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('coachStudentId', coachStudentId)
    formData.append('studentId', studentId)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('file', file)

    const result = await uploadProgram(formData)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setFile(null)
    setTitle('')
    setDescription('')
    showToast('success', 'Program öğrenci paneline yüklendi.')
    router.refresh()
  }

  return (
    <Card className="coach-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
          <Upload className="size-4 text-[#ABD600]" />
          Program Yükle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFile(e.dataTransfer.files?.[0] ?? null)
            }}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
              isDragging
                ? 'border-[#ABD600]/60 bg-[#ABD600]/10'
                : 'border-[#444933] bg-[#0E0E10]/70 hover:border-[#ABD600]/50'
            )}
          >
            <FileUp className="mb-3 size-10 text-[#ABD600]" />
            <p className="text-sm font-medium text-[#E5E1E4]">
              PDF dosyasını sürükleyip bırakın
            </p>
            <p className="mt-1 text-xs text-[#C4C9AC]">veya dosya seçin</p>
            <label className="mt-4 cursor-pointer">
              <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Dosya Seç
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <p className="mt-3 text-sm text-[#ABD600]">{file.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-title">Başlık</Label>
            <Input
              id="program-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn. 4. Hafta Antrenman Programı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-desc">Açıklama</Label>
            <Textarea
              id="program-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="İsteğe bağlı açıklama"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
            {isSubmitting ? 'Yükleniyor...' : 'Programı Yükle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
