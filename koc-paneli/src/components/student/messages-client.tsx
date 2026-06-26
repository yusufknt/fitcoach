'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { formatTime } from '@/lib/coach/format'
import { sendMessage, markAsRead } from '@/lib/student/messages.client'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { StudentMessage, CoachInfo } from '@/lib/student/types'

type MessagesClientProps = {
  studentId: string
  coach: CoachInfo
  initialMessages: StudentMessage[]
}

export function MessagesClient({ studentId, coach, initialMessages }: MessagesClientProps) {
  const [messages, setMessages] = useState<StudentMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Mark as read on mount
  useEffect(() => {
    markAsRead(studentId, coach.id)
  }, [studentId, coach.id])

  // Realtime
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('student:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as StudentMessage
        if (
          (msg.sender_id === coach.id && msg.receiver_id === studentId) ||
          (msg.sender_id === studentId && msg.receiver_id === coach.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          if (msg.sender_id === coach.id) markAsRead(studentId, coach.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [studentId, coach.id])

  const handleSend = async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')

    // Optimistic
    const tempId = `temp-${Date.now()}`
    const temp: StudentMessage = {
      id: tempId, sender_id: studentId, receiver_id: coach.id,
      content, is_read: false, created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, temp])

    const sent = await sendMessage(studentId, coach.id, content)
    if (sent) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? sent : m))
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[620px] flex-col rounded-xl border border-[#27272A] bg-[#18181B]/80 backdrop-blur-xl">
      {/* Header — Coach Profile */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[#444933] p-4">
        <Avatar className="h-11 w-11 border border-[#444933]">
          {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} />}
          <AvatarFallback className="bg-[#353437] text-[#E5E1E4]">
            {coach.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-[#E5E1E4]">{coach.fullName}</h2>
          {coach.bio && <p className="line-clamp-1 text-xs text-[#C4C9AC]">{coach.bio}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#ABD600]" />
          <span className="text-xs text-[#C4C9AC]">Aktif</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#C3F400]/10">
              <MessageSquare className="h-8 w-8 text-[#ABD600]" />
            </div>
            <p className="text-sm text-[#C4C9AC]">
              Koçunuzla mesajlaşmaya başlayın!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isStudent = msg.sender_id === studentId
            return (
              <div key={msg.id} className={cn(
                'flex flex-col max-w-[80%] space-y-1',
                isStudent ? 'ml-auto items-end' : 'mr-auto items-start'
              )}>
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words',
                  isStudent
                    ? 'rounded-br-sm bg-[#C3F400] text-[#283500]'
                    : 'rounded-bl-sm bg-[#2A2A2C] text-[#E5E1E4]'
                )}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 px-1 text-[11px] text-[#C4C9AC]/75">
                  <span>{formatTime(msg.created_at)}</span>
                  {isStudent && (
                    msg.is_read
                      ? <CheckCheck className="h-3 w-3 text-[#ABD600]" />
                      : <Check className="h-3 w-3" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#444933] bg-[#0E0E10]/70 p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="coach-input max-h-[160px] min-h-[56px] resize-none"
            autoFocus
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon"
            className="h-[56px] w-[56px] shrink-0 bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
