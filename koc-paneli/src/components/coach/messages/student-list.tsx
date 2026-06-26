'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/coach/format'
import type { ChatSummary } from '@/lib/coach/types'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type StudentListProps = {
  summaries: ChatSummary[]
  selectedStudentId: string | null
  onSelectStudent: (id: string) => void
}

export function StudentList({
  summaries,
  selectedStudentId,
  onSelectStudent
}: StudentListProps) {
  const [search, setSearch] = useState('')

  const filtered = summaries.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col border-r border-[#444933] bg-[#0E0E10]/70">
      <div className="border-b border-[#444933] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ABD600]">İletişim</p>
        <h2 className="mb-4 mt-1 text-2xl font-extrabold text-[#E5E1E4]">Mesajlar</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#C4C9AC]" />
          <Input
            type="search"
            placeholder="Öğrenci ara..."
            className="coach-input pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#C4C9AC]">
            Öğrenci bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {filtered.map((summary) => {
              const isActive = selectedStudentId === summary.studentId
              const hasUnread = summary.unreadCount > 0

              return (
                <button
                  key={summary.studentId}
                  onClick={() => onSelectStudent(summary.studentId)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-[#2A2A2C]',
                    isActive && 'bg-[#C3F400] text-[#283500]'
                  )}
                >
                  <Avatar className="h-12 w-12 border border-[#444933]">
                    {summary.avatarUrl && <AvatarImage src={summary.avatarUrl} />}
                    <AvatarFallback className={cn(isActive ? 'bg-[#283500] text-[#C3F400]' : 'bg-[#353437] text-[#E5E1E4]')}>
                      {summary.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'truncate font-medium',
                          hasUnread && !isActive ? 'font-bold text-[#E5E1E4]' : isActive ? 'text-[#283500]' : 'text-[#E5E1E4]/80'
                        )}
                      >
                        {summary.fullName}
                      </span>
                      {summary.lastMessage && (
                        <span className={cn("ml-2 shrink-0 text-xs", isActive ? 'text-[#283500]/70' : 'text-[#C4C9AC]/70')}>
                          {formatRelativeTime(summary.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className={cn(
                        "truncate text-sm",
                        hasUnread && !isActive ? "font-medium text-[#E5E1E4]" : isActive ? "text-[#283500]/80" : "text-[#C4C9AC]"
                      )}>
                        {summary.lastMessage?.content || 'Henüz mesaj yok'}
                      </p>
                      
                      {hasUnread && (
                        <span className={cn("flex h-2 w-2 shrink-0 rounded-full", isActive ? 'bg-[#283500]' : 'bg-[#ABD600]')} />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
