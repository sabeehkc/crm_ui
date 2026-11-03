'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Mic, Send, Loader2, Square } from 'lucide-react'
import { getInitials, getStatusColor } from './mockData'
import { useListEnquiriesQuery } from '@/store/services/enquirySlice'
import { useGetMessagesQuery, useSendMessageMutation, useSendVoiceMessageMutation } from '@/store/services/chatSlice'
import { useAppSelector } from '@/store/hooks'
import { BASE_URL } from '@/store/constants'
import { IEnquiry } from '@/types/enquiry'
import toast from 'react-hot-toast'
import { useSearchParams, useRouter } from 'next/navigation'

export const ChatSection = () => {
  const { data: enquiriesData, isLoading: isLoadingEnquiries } = useListEnquiriesQuery({ limit: 50 })
  const enquiries = enquiriesData?.data?.items || []
  
  const user = useAppSelector(state => state.auth.user)
  const senderName = user?.name || 'Admin'

  const searchParams = useSearchParams()
  const router = useRouter()
  const queryEnquiryId = searchParams.get('enquiryId')

  const [activeEnquiry, setActiveEnquiry] = useState<IEnquiry | null>(null)
  const [message, setMessage] = useState('')
  
  const { data: messagesResponse, isLoading: isLoadingMessages } = useGetMessagesQuery(activeEnquiry?._id || '', { 
    skip: !activeEnquiry,
    pollingInterval: 3000
  })
  
  const messages = messagesResponse?.data?.items || []

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [sendVoiceMessage, { isLoading: isSendingVoice }] = useSendVoiceMessageMutation()

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (queryEnquiryId && enquiries.length > 0) {
      const enq = enquiries.find(e => e._id === queryEnquiryId)
      if (enq && activeEnquiry?._id !== enq._id) {
        setActiveEnquiry(enq)
      }
    } else if (enquiries.length > 0 && !activeEnquiry) {
      setActiveEnquiry(enquiries[0])
    }
  }, [enquiries, queryEnquiryId, activeEnquiry])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendText = async () => {
    if (!message.trim() || !activeEnquiry) return
    try {
      await sendMessage({ enquiryId: activeEnquiry._id, content: message, senderName }).unwrap()
      setMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('voiceNote', audioBlob, 'voice.webm')
        formData.append('senderName', senderName)

        if (activeEnquiry) {
          try {
            await sendVoiceMessage({ enquiryId: activeEnquiry._id, formData }).unwrap()
            toast.success('Voice message sent')
          } catch (err) {
            toast.error('Failed to send voice message')
          }
        }
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingDuration(0)
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-row h-[700px] overflow-hidden shadow-sm rounded-2xl bg-white dark:bg-card">
      {/* Sidebar */}
      <div className="w-[340px] border-r flex flex-col bg-white dark:bg-card shrink-0">
        <div className="p-4 border-b border-muted/30">
          <Input placeholder="Search contacts..." className="rounded-xl bg-white dark:bg-background shadow-sm border-muted/40 h-10 px-4" />
        </div>
        <ScrollArea className="flex-1">
          {isLoadingEnquiries ? (
            <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : (
            enquiries.map((enq, i) => (
              <div 
                key={enq._id} 
                onClick={() => {
                   setActiveEnquiry(enq)
                   router.replace(`?tab=chat&enquiryId=${enq._id}`)
                }}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-muted/20 ${activeEnquiry?._id === enq._id ? 'bg-[#fff5f4] dark:bg-red-900/20' : 'hover:bg-muted/20'}`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`bg-blue-500 text-white font-semibold`}>
                      {getInitials(enq.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm text-foreground truncate max-w-[120px]">{enq.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{enq.phone}</div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${getStatusColor(enq.status)} border-transparent truncate max-w-[80px]`}>{enq.status}</Badge>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f4f6fb] dark:bg-background relative">
        {activeEnquiry ? (
          <>
            <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-card shadow-sm z-10 border-b border-muted/30">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-yellow-400 text-white font-semibold">{getInitials(activeEnquiry.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground text-sm">{activeEnquiry.name}</div>
                  <div className="text-[11px] text-emerald-500 flex items-center mt-0.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> {activeEnquiry.status}</div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="rounded-lg px-4 h-8 text-xs font-medium bg-white dark:bg-background shadow-sm"><Phone className="mr-2 h-3 w-3" /> Call</Button>
                <Button variant="outline" size="sm" className="rounded-lg px-4 h-8 text-xs font-medium bg-white dark:bg-background shadow-sm"><Mail className="mr-2 h-3 w-3" /> Email</Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 flex flex-col">
                {isLoadingMessages ? (
                   <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                ) : messages.length === 0 ? (
                   <div className="text-center text-muted-foreground mt-10 text-sm">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?._id || msg.senderName === senderName;
                    return (
                      <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end ${isMe ? '' : 'space-x-3'} max-w-[75%]`}>
                          {!isMe && (
                            <Avatar className="w-8 h-8 mb-1"><AvatarFallback className="text-xs bg-yellow-400 text-white font-semibold">{getInitials(msg.senderName)}</AvatarFallback></Avatar>
                          )}
                          <div className={`${isMe ? 'bg-[#b33131] text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-muted/20 text-foreground rounded-bl-none'} rounded-2xl px-4 py-2.5 text-sm shadow-sm min-w-[120px]`}>
                            {!isMe && <div className="text-[10px] font-bold text-muted-foreground mb-1">{msg.senderName}</div>}
                            
                            {msg.messageType === 'voice' && msg.voiceUrl ? (
                               <div className="flex flex-col">
                                 <audio src={`${BASE_URL}${msg.voiceUrl}`} controls className="h-8 w-[200px]" />
                               </div>
                            ) : (
                              <div>{msg.content}</div>
                            )}
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="px-6 py-4 bg-white dark:bg-card border-t border-muted/30 flex items-center space-x-4 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
              {isRecording ? (
                <div className="flex-1 flex items-center bg-red-50 dark:bg-red-900/20 rounded-full px-5 h-12 border border-red-200 dark:border-red-900/50">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3"></div>
                   <span className="text-red-500 font-medium text-sm flex-1">Recording... {formatTime(recordingDuration)}</span>
                   <Button variant="ghost" size="icon" onClick={stopRecording} className="text-red-600 hover:bg-red-100 rounded-full w-8 h-8">
                     <Square className="h-4 w-4 fill-current" />
                   </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={startRecording}
                    className="text-muted-foreground hover:bg-muted/50 rounded-full h-10 w-10 shrink-0 bg-muted/20"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    className="flex-1 rounded-full border border-muted/30 bg-[#f4f6fb] dark:bg-background focus-visible:ring-1 px-5 h-12 shadow-inner" 
                    placeholder="Type a message..." 
                  />
                  <Button 
                    disabled={!message.trim() || isSending}
                    onClick={handleSendText}
                    className="rounded-full px-8 h-12 bg-[#dca4a4] hover:bg-[#c28e8e] text-white font-medium shadow-sm shrink-0"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
             Select an enquiry to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
