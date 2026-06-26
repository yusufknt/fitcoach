'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { formatTime } from '@/lib/coach/format'
import { cn } from '@/lib/utils'
import type { ChatSummary, Message } from '@/lib/coach/types'

type ChatAreaProps = {
  coachId: string
  studentSummary: ChatSummary | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onBack?: () => void // For mobile
}

export function ChatArea({
  coachId,
  studentSummary,
  messages,
  onSendMessage,
  onBack
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!studentSummary) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#131315]/70 p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C3F400]/10">
          <MessageSquare className="h-10 w-10 text-[#ABD600]" />
        </div>
        <h3 className="text-xl font-semibold text-[#E5E1E4]">Henüz mesaj yok</h3>
        <p className="mt-2 max-w-sm text-[#C4C9AC]">
          Mesajlaşmaya başlamak için sol taraftan bir öğrenci seçin.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#131315]/70">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[#444933] p-4">
        {onBack && (
          <Button variant="ghost" size="icon" className="text-[#C4C9AC] hover:bg-[#2A2A2C] md:hidden" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
        )}
        
        <Avatar className="h-10 w-10 border border-[#444933]">
          {studentSummary.avatarUrl && <AvatarImage src={studentSummary.avatarUrl} />}
          <AvatarFallback className="bg-[#353437] text-[#E5E1E4]">
            {studentSummary.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold text-[#E5E1E4]">{studentSummary.fullName}</h2>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#ABD600]" />
            <span className="text-xs text-[#C4C9AC]">Aktif</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#C4C9AC]">
            Bu konuşmada henüz mesaj bulunmuyor. İlk mesajı siz gönderin!
          </div>
        ) : (
          messages.map((msg) => {
            const isCoach = msg.sender_id === coachId
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] space-y-1",
                  isCoach ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words",
                    isCoach 
                      ? "rounded-br-sm bg-[#C3F400] text-[#283500]"
                      : "rounded-bl-sm bg-[#2A2A2C] text-[#E5E1E4]"
                  )}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 px-1 text-[11px] text-[#C4C9AC]/75">
                  <span>{formatTime(msg.created_at)}</span>
                  {isCoach && (
                    msg.is_read ? (
                      <CheckCheck className="h-3 w-3 text-[#ABD600]" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-[#444933] bg-[#0E0E10]/70 p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın... (Göndermek için Enter)"
            className="coach-input max-h-[160px] min-h-[60px] resize-none"
            autoFocus
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim()}
            size="icon"
            className="h-[60px] w-[60px] shrink-0 bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
