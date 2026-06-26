'use client'

import { useEffect, useState } from 'react'
import { StudentList } from './student-list'
import { ChatArea } from './chat-area'
import type { ChatSummary, Message } from '@/lib/coach/types'
import { getMessages, sendMessage, markAsRead } from '@/lib/coach/messages'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type MessageLayoutProps = {
  coachId: string
  initialSummaries: ChatSummary[]
}

export function MessageLayout({ coachId, initialSummaries }: MessageLayoutProps) {
  const [summaries, setSummaries] = useState<ChatSummary[]>(initialSummaries)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialSummaries.length > 0 ? initialSummaries[0].studentId : null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  // Fetch messages when selected student changes
  useEffect(() => {
    if (!selectedStudentId) return

    const loadMessages = async () => {
      const data = await getMessages(coachId, selectedStudentId)
      setMessages(data)
      
      // Mark as read when opening
      await markAsRead(coachId, selectedStudentId)
      
      // Update local unread count
      setSummaries(prev => prev.map(s => 
        s.studentId === selectedStudentId 
          ? { ...s, unreadCount: 0 } 
          : s
      ))
    }

    loadMessages()
  }, [coachId, selectedStudentId])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase.channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message
          
          // Check if it's relevant to this coach
          if (newMsg.receiver_id !== coachId && newMsg.sender_id !== coachId) {
            return
          }

          const otherUserId = newMsg.sender_id === coachId ? newMsg.receiver_id : newMsg.sender_id
          const isFromSelected = otherUserId === selectedStudentId

          // 1. Update Messages if current chat is open
          if (isFromSelected) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            // Mark as read immediately if it's an incoming message in active chat
            if (newMsg.receiver_id === coachId) {
              await markAsRead(coachId, selectedStudentId)
            }
          }

          // 2. Update Summaries
          setSummaries(prev => {
            const index = prev.findIndex(s => s.studentId === otherUserId)
            if (index === -1) return prev // If student not in list, ideally we should fetch them, but for now ignore

            const updatedSummary = { ...prev[index] }
            updatedSummary.lastMessage = {
              content: newMsg.content,
              createdAt: newMsg.created_at,
              isRead: isFromSelected ? true : newMsg.is_read,
              senderId: newMsg.sender_id
            }

            // Increment unread count if it's incoming and not the active chat
            if (newMsg.receiver_id === coachId && !isFromSelected) {
              updatedSummary.unreadCount += 1
            } else if (isFromSelected) {
              updatedSummary.unreadCount = 0
            }

            // Move to top
            const newSummaries = [...prev]
            newSummaries.splice(index, 1)
            return [updatedSummary, ...newSummaries]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coachId, selectedStudentId])

  const handleSendMessage = async (content: string) => {
    if (!selectedStudentId) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const newMsg: Message = {
      id: tempId,
      sender_id: coachId,
      receiver_id: selectedStudentId,
      content,
      created_at: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, newMsg])
    
    // Update summary optimistically
    setSummaries(prev => {
      const index = prev.findIndex(s => s.studentId === selectedStudentId)
      if (index === -1) return prev
      const updated = { ...prev[index] }
      updated.lastMessage = {
        content,
        createdAt: newMsg.created_at,
        isRead: false,
        senderId: coachId
      }
      const newSummaries = [...prev]
      newSummaries.splice(index, 1)
      return [updated, ...newSummaries]
    })

    const sent = await sendMessage(coachId, selectedStudentId, content)
    if (sent) {
      // Replace temp with real
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m))
    } else {
      // Revert if failed
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    setIsMobileChatOpen(true)
  }

  const selectedSummary = summaries.find(s => s.studentId === selectedStudentId) || null

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[620px] w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B]/80 shadow-black/20 backdrop-blur-xl">
      {/* Left Panel */}
      <div 
        className={cn(
          "w-full shrink-0 md:w-80 lg:w-96",
          isMobileChatOpen ? "hidden md:block" : "block"
        )}
      >
        <StudentList
          summaries={summaries}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
        />
      </div>

      {/* Right Panel */}
      <div 
        className={cn(
          "min-w-0 flex-1",
          !isMobileChatOpen ? "hidden md:block" : "block"
        )}
      >
        <ChatArea
          coachId={coachId}
          studentSummary={selectedSummary}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => setIsMobileChatOpen(false)}
        />
      </div>
    </div>
  )
}
