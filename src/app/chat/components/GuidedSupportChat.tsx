'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, PhoneCall, ChevronRight, Loader2, RefreshCw, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useListEnquiriesQuery } from '@/store/services/enquirySlice'
import { getInitials, getStatusColor } from '../../admin-crm/components/mockData'
import { IEnquiry } from '@/types/enquiry'
import { useSearchParams, useRouter } from 'next/navigation'

// Define the flow structure
type ChatNodeId = string;

interface ChatOption {
  id: string;
  label: string;
  nextNodeId?: ChatNodeId;
  action?: 'contact_support' | 'end_chat';
}

interface ChatNode {
  id: ChatNodeId;
  message: string;
  options?: ChatOption[];
}

const chatFlow: Record<ChatNodeId, ChatNode> = {
  welcome: {
    id: 'welcome',
    message: "Hi there! 👋 I'm your virtual assistant. How can I help you today?",
    options: [
      { id: 'opt_sales', label: 'Sales Inquiry', nextNodeId: 'sales' },
      { id: 'opt_support', label: 'Technical Support', nextNodeId: 'support' },
      { id: 'opt_billing', label: 'Billing & Payments', nextNodeId: 'billing' },
      { id: 'opt_contact', label: 'Contact Support Team directly', action: 'contact_support' }
    ]
  },
  sales: {
    id: 'sales',
    message: "Great! What kind of sales inquiry do you have?",
    options: [
      { id: 'opt_pricing', label: 'Pricing Information', nextNodeId: 'pricing' },
      { id: 'opt_demo', label: 'Request a Demo', nextNodeId: 'demo' },
      { id: 'opt_back', label: 'Go Back', nextNodeId: 'welcome' }
    ]
  },
  support: {
    id: 'support',
    message: "I'm sorry you're experiencing issues. Please select the category:",
    options: [
      { id: 'opt_login', label: 'Login Issues', nextNodeId: 'login_issue' },
      { id: 'opt_bug', label: 'Report a Bug', nextNodeId: 'bug_report' },
      { id: 'opt_back', label: 'Go Back', nextNodeId: 'welcome' },
      { id: 'opt_contact_support', label: 'Talk to a human', action: 'contact_support' }
    ]
  },
  billing: {
    id: 'billing',
    message: "For billing inquiries, please select an option:",
    options: [
      { id: 'opt_invoice', label: 'Download Invoice', nextNodeId: 'invoice_help' },
      { id: 'opt_upgrade', label: 'Upgrade Plan', nextNodeId: 'upgrade_help' },
      { id: 'opt_back', label: 'Go Back', nextNodeId: 'welcome' }
    ]
  },
  pricing: {
    id: 'pricing',
    message: "Our pricing starts at $99/mo for the basic tier. Would you like to speak to a sales rep for a custom quote?",
    options: [
      { id: 'opt_contact_sales', label: 'Yes, contact sales', action: 'contact_support' },
      { id: 'opt_back', label: 'No, go back', nextNodeId: 'welcome' }
    ]
  },
  demo: {
    id: 'demo',
    message: "Awesome! You can schedule a demo using our calendar link: calendly.com/demo. Anything else?",
    options: [
      { id: 'opt_back', label: 'Back to main menu', nextNodeId: 'welcome' }
    ]
  },
  login_issue: {
    id: 'login_issue',
    message: "Please try resetting your password using the 'Forgot Password' link on the login page. Did this resolve your issue?",
    options: [
      { id: 'opt_resolved', label: 'Yes, it works now', nextNodeId: 'resolved' },
      { id: 'opt_contact', label: 'No, I need human help', action: 'contact_support' }
    ]
  },
  bug_report: {
    id: 'bug_report',
    message: "To report a bug, please connect with our support team so we can gather more details.",
    options: [
      { id: 'opt_contact', label: 'Connect to Support Team', action: 'contact_support' }
    ]
  },
  invoice_help: {
    id: 'invoice_help',
    message: "You can download your invoices from Settings > Billing in your dashboard.",
    options: [
      { id: 'opt_back', label: 'Back to main menu', nextNodeId: 'welcome' }
    ]
  },
  upgrade_help: {
    id: 'upgrade_help',
    message: "Ready to upgrade? Head to Settings > Billing and select your new plan. Our support team can also help if you have questions.",
    options: [
      { id: 'opt_contact', label: 'Contact Support Team', action: 'contact_support' },
      { id: 'opt_back', label: 'Back to main menu', nextNodeId: 'welcome' }
    ]
  },
  resolved: {
    id: 'resolved',
    message: "Glad to hear that! Have a great day.",
    options: [
      { id: 'opt_restart', label: 'Start Over', nextNodeId: 'welcome' }
    ]
  }
};

type MessageType = {
  id: string;
  sender: 'bot' | 'user' | 'system';
  content: string;
  options?: ChatOption[];
  timestamp: Date;
};

export const GuidedSupportChat = () => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [liveChatActive, setLiveChatActive] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: enquiriesData, isLoading: isLoadingEnquiries } = useListEnquiriesQuery({ limit: 50 })
  const enquiries = enquiriesData?.data?.items || []
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryEnquiryId = searchParams.get('enquiryId')

  const [activeEnquiry, setActiveEnquiry] = useState<IEnquiry | null>(null)

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

  const addBotMessage = (nodeId: ChatNodeId) => {
    setIsTyping(true)
    setTimeout(() => {
      const node = chatFlow[nodeId]
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          sender: 'bot',
          content: node.message,
          options: node.options,
          timestamp: new Date()
        }
      ])
      setIsTyping(false)
    }, 600) // Simulated typing delay
  }

  const initialized = useRef(false)

  useEffect(() => {
    // Initial greeting
    if (!initialized.current) {
      initialized.current = true
      addBotMessage('welcome')
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleOptionClick = (option: ChatOption) => {
    // Remove options from the previous bot message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastBotMsgIndex = newMessages.map(m => m.sender).lastIndexOf('bot');
      if (lastBotMsgIndex !== -1) {
        newMessages[lastBotMsgIndex] = { ...newMessages[lastBotMsgIndex], options: undefined };
      }
      return newMessages;
    });

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        content: option.label,
        timestamp: new Date()
      }
    ]);

    if (option.action === 'contact_support') {
      setIsTyping(true)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'system',
            content: "Connecting you to the next available support agent...",
            timestamp: new Date()
          }
        ])
        setTimeout(() => {
          setLiveChatActive(true)
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'system',
              content: "Agent Sarah has joined the chat.",
              timestamp: new Date()
            },
            {
              id: (Date.now() + 1).toString(),
              sender: 'bot', // Technically a human now, but using bot styling
              content: "Hi, I'm Sarah from the support team. I see you need some help. Could you provide a bit more detail?",
              timestamp: new Date()
            }
          ])
          setIsTyping(false)
        }, 1500)
      }, 800)
    } else if (option.nextNodeId) {
      addBotMessage(option.nextNodeId)
    }
  }

  const handleRestart = () => {
    setLiveChatActive(false)
    setMessages([])
    addBotMessage('welcome')
  }

  return (
    <div className="flex flex-row h-[700px] overflow-hidden shadow-sm rounded-2xl bg-white dark:bg-card border border-muted/30">
      
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
                   handleRestart() // Restart chat flow for new user
                }}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-muted/20 ${activeEnquiry?._id === enq._id ? 'bg-[#fff5f4] dark:bg-red-900/20' : 'hover:bg-muted/20'}`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`bg-primary/10 text-primary font-semibold`}>
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

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-card">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-card shadow-sm z-10 border-b border-muted/30">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {liveChatActive ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground text-sm">
                {liveChatActive ? (activeEnquiry ? `Live Support: ${activeEnquiry.name}` : 'Live Support') : 'Guided Assistant'}
              </div>
              <div className="text-[11px] text-emerald-500 flex items-center mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> 
                Online
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={handleRestart} className="rounded-lg px-4 h-8 text-xs font-medium bg-white dark:bg-background shadow-sm text-muted-foreground hover:text-foreground">
              <RefreshCw className="mr-2 h-3 w-3" /> Start Over
            </Button>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] dark:bg-background/50 relative">
          <div className="flex-1 overflow-y-auto p-6 pb-4 space-y-6">
            <AnimatePresence>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-4"
                    >
                      <div className="bg-muted/50 text-muted-foreground text-xs px-4 py-1.5 rounded-full border border-muted/20">
                        {msg.content}
                      </div>
                    </motion.div>
                  )
                }

                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end ${isUser ? '' : 'space-x-3'} max-w-[85%] md:max-w-[75%]`}>
                      {!isUser && (
                        <Avatar className="w-8 h-8 mb-1 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                            {liveChatActive ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col space-y-2">
                        <div className={`${isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white dark:bg-slate-800 border border-muted/20 text-foreground rounded-bl-none'} rounded-2xl px-5 py-3.5 text-sm shadow-sm`}>
                          <div className="leading-relaxed">{msg.content}</div>
                          <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Options */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="flex flex-col space-y-2 mt-2 ml-2">
                            {msg.options.map((opt) => (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={opt.id}>
                                <Button
                                  variant="outline"
                                  onClick={() => handleOptionClick(opt)}
                                  className="w-full justify-between bg-white dark:bg-slate-800 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary shadow-sm rounded-xl py-6 h-auto whitespace-normal text-left"
                                >
                                  <span className="font-medium text-sm">{opt.label}</span>
                                  <ChevronRight className="w-4 h-4 opacity-50 shrink-0 ml-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-end space-x-3 max-w-[75%]">
                  <Avatar className="w-8 h-8 mb-1">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {liveChatActive ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-slate-800 border border-muted/20 rounded-2xl rounded-bl-none px-4 py-3.5 shadow-sm flex space-x-1.5 items-center h-[42px]">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input Area - Only functional if live chat is active */}
        <div className="px-6 py-4 bg-white dark:bg-card border-t border-muted/30 flex items-center space-x-4 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          {liveChatActive ? (
            <>
              <div className="relative flex-1">
                <input 
                  type="text"
                  className="w-full rounded-full border border-muted/30 bg-[#f8fafc] dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 px-5 h-12 shadow-inner text-sm" 
                  placeholder="Type your message to support..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const val = e.currentTarget.value;
                      setMessages(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          sender: 'user',
                          content: val,
                          timestamp: new Date()
                        }
                      ])
                      e.currentTarget.value = '';
                      setIsTyping(true);
                      setTimeout(() => {
                        setMessages(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            sender: 'bot',
                            content: "Thanks for the details. Let me check that for you right away.",
                            timestamp: new Date()
                          }
                        ])
                        setIsTyping(false);
                      }, 2000);
                    }
                  }}
                />
              </div>
              <Button 
                className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm shrink-0"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </>
          ) : (
             <div className="w-full flex items-center justify-center text-muted-foreground/60 text-xs py-2">
               <MessageSquare className="w-4 h-4 mr-2 opacity-50" />
               Select an option above to continue
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
