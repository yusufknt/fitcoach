'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Trash2 } from 'lucide-react'
import {
  deleteProgram,
  getProgramDownloadUrl,
} from '@/lib/coach/program-actions'
import { formatDate } from '@/lib/coach/format'
import type { ProgramListItem } from '@/lib/coach/programs'
import { Button } from '@/components/ui/button'

type ProgramListProps = {
  programs: ProgramListItem[]
  coachStudentId: string
}

export function ProgramList({ programs, coachStudentId }: ProgramListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(programId: string) {
    setLoadingId(programId)
    setError(null)
    const result = await getProgramDownloadUrl(programId)
    setLoadingId(null)

    if (!result.success) {
      setError(result.error)
      return
    }

    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  async function handleDelete(programId: string) {
    if (!window.confirm('Bu programı silmek istediğinize emin misiniz?')) {
      return
    }

    setLoadingId(programId)
    setError(null)
    const result = await deleteProgram(programId, coachStudentId)
    setLoadingId(null)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  if (programs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#444933] bg-[#18181B]/60 p-8 text-center text-sm text-[#C4C9AC]">
        Henüz yüklenmiş program yok.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <ul className="divide-y divide-[#444933] overflow-hidden rounded-2xl border border-[#27272A] bg-[#18181B]/70">
        {programs.map((program) => (
          <li
            key={program.id}
            className="list-row flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 size-5 shrink-0 text-[#ABD600]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-[#E5E1E4]">{program.title}</p>
                <p className="text-xs text-[#C4C9AC]/70">
                  {formatDate(program.createdAt)} · {program.fileName}
                </p>
                {program.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[#C4C9AC]">
                    {program.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loadingId === program.id}
                onClick={() => handleDownload(program.id)}
                className="gap-1"
              >
                <Download className="size-3.5" />
                İndir
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={loadingId === program.id}
                onClick={() => handleDelete(program.id)}
                className="gap-1"
              >
                <Trash2 className="size-3.5" />
                Sil
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
